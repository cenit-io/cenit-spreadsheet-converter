/**
 * SpreadsheetConverter nodejs helper module to persist calculator node form in CenitIO
 */

var util = require('util'),
    request = require('request');

module.exports = {
    /**
     * Init process to send form data to CenitIO platform.
     *
     * @param formData {Object} Form data to be seved.
     * @param CenitIO {Object} CenitIO connection setting.
     * @param callback {Function} Callback function with status and menssage response parameters.
     */
    saveFormData: function (formData, CenitIO, callback) {
        var vThis = this;

        CenitIO = CenitIO || {};
        formData = this.parseData(formData);

        vThis.validate(CenitIO, function (err) {
            if (err) return callback(500, vThis.renderView(500, err));

            var uaKey = CenitIO.userAccessKey.trim(),
                uaToken = CenitIO.userAccessToken.trim(),
                dtName = CenitIO.dataTypeName.trim(),
                dtNamespace = CenitIO.dataTypeNamespace.trim(),
                baUrl = CenitIO.baseApiUrl.trim().replace(/\/$/, '');

            vThis.getDataType(baUrl, uaKey, uaToken, dtNamespace, dtName, function (err, dataType) {
                if (err) return callback(500, vThis.renderView(500, err));
                if (dataType) {
                    vThis.saveDataInDataType(baUrl, uaKey, uaToken, dataType, formData, callback);
                } else {
                    vThis.createDataType(baUrl, uaKey, uaToken, dtNamespace, dtName, formData, function (err, dataType) {
                        if (err) return callback(500, vThis.renderView(500, err));
                        vThis.saveDataInDataType(baUrl, uaKey, uaToken, dataType, formData, callback);
                    });
                }
            });
        });
    },

    /**
     * Send form data to CenitIO platform.
     *
     * @param baUrl {String} Base URL to CenitIO API.
     * @param uaKey {String} CenitIO user access key.
     * @param uaToken {String} CenitIO user access token.
     * @param dataType {Object} Data type record.
     * @param formData {Object} Form data to be seved.
     * @param callback {Function} Callback function with status and menssage response parameters.
     */
    saveDataInDataType: function (baUrl, uaKey, uaToken, dataType, formData, callback) {
        var vThis = this,
            options = {
                url: util.format('%s/%s/%s.json', baUrl, dataType.namespace.toLowerCase(), dataType.slug),
                headers: this.headers(uaKey, uaToken),
                method: 'POST',
                json: true,
                body: formData
            };

        request(options, function (err, response, resData) {
            var msg, status;

            if (err || resData.summary) {
                msg = err.toString() || resData.summary;
                status = 500;
            } else {
                msg = 'Data was successfully saved.';
                status = 422;
            }

            callback(status, vThis.renderView(status, msg));
        });
    },

    /**
     * Search and return data type record with given name and namespace.
     *
     * @param baUrl {String} Base URL to CenitIO API.
     * @param uaKey {String} CenitIO user access key.
     * @param uaToken {String} CenitIO user access token.
     * @param dtNamespace {String} Data type namespace.
     * @param dtName {String} Data type name.
     * @param callback {Function} Callback function with error and data type record parameters.
     */
    getDataType: function (baUrl, uaKey, uaToken, dtNamespace, dtName, callback) {
        var options = {
            url: util.format('%s/setup/json_data_type.json', baUrl),
            headers: this.headers(uaKey, uaToken),
            method: 'GET',
            json: true,
            qs: { limit: 1, namespace: dtNamespace, name: dtName }
        };

        request(options, function (err, response, resData) {
            if (err || resData.summary) return callback(err || resData.summary);
            callback(null, resData.json_data_types[0]);
        });
    },

    /**
     * Create and return data type record with given name and namespace.
     *
     * @param baUrl {String} Base URL to CenitIO API.
     * @param uaKey {String} CenitIO user access key.
     * @param uaToken {String} CenitIO user access token.
     * @param dtNamespace {String} Data type namespace.
     * @param dtName {String} Data type name.
     * @param formData {Object} Form data to be seved.
     * @param callback {Function} Callback function with error and data type record parameters.
     */
    createDataType: function (baUrl, uaKey, uaToken, dtNamespace, dtName, formData, callback) {
        var schema = this.parseJsonSchema(formData),
            options = {
                url: util.format('%s/setup/json_data_type.json', baUrl),
                headers: this.headers(uaKey, uaToken),
                method: 'POST',
                json: true,
                body: {
                    namespace: dtNamespace,
                    name: dtName,
                    schema: schema
                }
            };

        request(options, function (err, response, resData) {
            if (err || resData.summary) return callback(err || resData.summary);
            callback(null, resData.success.json_data_type);
        });
    },

    /**
     * Parse json schema from formData.
     *
     * @param formData {Object} Form data to be seved.
     * @returns {{type: string, properties: { field1: { type: "string" ... } } } }
     */
    parseJsonSchema: function (formData) {
        var schema = { type: 'object', properties: {} };

        Object.keys(formData).forEach(function (key) {
            schema.properties[key] = { type: this.parseType(formData[key]) };
        }, this);

        return schema;
    },

    /**
     * Parse data fields from formData.
     *
     * @param formData {Object} Form data to be seved.
     * @returns {Object}
     */
    parseData: function (formData) {
        var item = {};

        Object.keys(formData).forEach(function (key) {
            if (!key.match(/^xl_/)) item[key] = this.parseValue(formData[key]);
        }, this);

        return item;
    },

    /**
     * Parse type from given value.
     *
     * @param value {*}
     * @returns {string}
     */
    parseType: function (value) {
        // TODO: Parse field value type.
        return 'string';
    },

    /**
     * Parse value in real type from given string value.
     *
     * @param value {string}
     * @returns {*}
     */
    parseValue: function (value) {
        // TODO: Parse field value.
        return value;
    },

    /**
     * Validate CenitIO connection setting.
     *
     * @param CenitIO {Object} CenitIO connection setting.
     * @param callback {Function} Callback function with error parameter.
     */
    validate: function (CenitIO, callback) {
        var errMsg = 'CenitIO.%s is a required string, please set it to the config.json file.',
            isValid = function (v) {
                return typeof v == 'String' && v.trim() != ''
            };

        if (isValid(CenitIO.userAccessKey)) return callback(util.format(errMsg, 'userAccessKey'));
        if (isValid(CenitIO.userAccessToken)) return callback(util.format(errMsg, 'userAccessToken'));
        if (isValid(CenitIO.dataType)) return callback(util.format(errMsg, 'dataType'));
        if (isValid(CenitIO.baseApiUrl)) return callback(util.format(errMsg, 'baseApiUrl'));

        callback();
    },

    /**
     * Returns headers to be sent in CenitIO request.
     *
     * @param uaKey {String} CenitIO user access key.
     * @param uaToken {String} CenitIO user access token.
     * @returns {{Content-Type: string, X-User-Access-Key: *, X-User-Access-Token: *}}
     */
    headers: function (uaKey, uaToken) {
        return {
            'Content-Type': 'application/json',
            'X-User-Access-Key': uaKey,
            'X-User-Access-Token': uaToken
        };
    },

    /**
     * Render view.
     *
     * @param status {Integer} Http response status.
     * @param msg {String} Response message
     * @returns {String} Response html
     */
    renderView: function (status, msg) {
        // TODO: Customise view.
        var tmpl = '' +
            '<div style="border: 1px solid gray; background-color: %s; padding: 1.5em; text-align: center;">%s</div>' +
            '<script type="text/javascript">setTimeout(function () { window.location = "/" }, 5000)</script>';

        return util.format(tmpl, status == 500 ? 'red' : '#c9e2b3', msg.toString());
    }
};