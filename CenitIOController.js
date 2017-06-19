/**
 * SpreadsheetConverter nodejs helper module to persist calculator node form in CenitIO
 */

var util = require('util'),
    request = require('request'),
    inflection = require('inflection');

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
            if (err) return callback(500, err);

            var taKey = vThis.getTenantAccessKey(CenitIO),
                taToken = vThis.getTenantAccessToken(CenitIO),
                dtName = CenitIO.dataTypeName.trim(),
                dtNamespace = CenitIO.dataTypeNamespace.trim(),
                dtNamespaceSlug = CenitIO.dataTypeNamespaceSlug || inflection.underscore(dtNamespace).trim(),
                baUrl = CenitIO.baseApiUrl.trim().replace(/\/$/, '');

            vThis.getDataType(baUrl, taKey, taToken, dtNamespace, dtName, function (err, dataType) {
                if (err) return callback(500, err);
                if (dataType) {
                    dataType.namespaceSlug = dtNamespaceSlug;
                    vThis.saveDataInDataType(baUrl, taKey, taToken, dataType, formData, callback);
                } else {
                    vThis.createDataType(baUrl, taKey, taToken, dtNamespace, dtName, formData, function (err, dataType) {
                        if (err) return callback(500, err);
                        dataType.namespaceSlug = dtNamespaceSlug;
                        vThis.saveDataInDataType(baUrl, taKey, taToken, dataType, formData, callback);
                    });
                }
            });
        });
    },

    /**
     * Send form data to CenitIO platform.
     *
     * @param baUrl {String} Base URL to CenitIO API.
     * @param taKey {String} CenitIO tenant access key.
     * @param taToken {String} CenitIO tenant access token.
     * @param dataType {Object} Data type record.
     * @param formData {Object} Form data to be seved.
     * @param callback {Function} Callback function with status and menssage response parameters.
     */
    saveDataInDataType: function (baUrl, taKey, taToken, dataType, formData, callback) {
        var vThis = this,
            options = {
                url: util.format('%s/%s/%s.json', baUrl, dataType.namespaceSlug, dataType.slug),
                headers: this.headers(taKey, taToken),
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
                status = 200;
            }

            callback(status, msg);
        });
    },

    /**
     * Search and return data type record with given name and namespace.
     *
     * @param baUrl {String} Base URL to CenitIO API.
     * @param taKey {String} CenitIO tenant access key.
     * @param taToken {String} CenitIO tenant access token.
     * @param dtNamespace {String} Data type namespace.
     * @param dtName {String} Data type name.
     * @param callback {Function} Callback function with error and data type record parameters.
     */
    getDataType: function (baUrl, taKey, taToken, dtNamespace, dtName, callback) {
        var options = {
            url: util.format('%s/setup/json_data_type.json', baUrl),
            headers: this.headers(taKey, taToken),
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
     * @param taKey {String} CenitIO tenant access key.
     * @param taToken {String} CenitIO tenantv access token.
     * @param dtNamespace {String} Data type namespace.
     * @param dtName {String} Data type name.
     * @param formData {Object} Form data to be seved.
     * @param callback {Function} Callback function with error and data type record parameters.
     */
    createDataType: function (baUrl, taKey, taToken, dtNamespace, dtName, formData, callback) {
        var schema = this.parseJsonSchema(formData),
            options = {
                url: util.format('%s/setup/json_data_type.json', baUrl),
                headers: this.headers(taKey, taToken),
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

    getSelectionItemOptions: function (selItemSetting, CenitIO, callback) {
        var taKey = this.getTenantAccessKey(CenitIO),
            taToken = this.getTenantAccessToken(CenitIO),
            baUrl = CenitIO.baseApiUrl.trim().replace(/\/$/, ''),
            apiService = selItemSetting.apiService,
            rField = selItemSetting.rField,
            vField = selItemSetting.vField,
            lField = selItemSetting.lField,

            options = {
                url: util.format('%s/%s', baUrl, apiService),
                headers: this.headers(taKey, taToken),
                method: 'GET',
                json: true
            };

        request(options, function (err, response, resData) {
            if (err || resData.summary) return callback(500, err || resData.summary);

            var records = resData[rField] || [],
                options = records.map(function (record) {
                    return {
                        id: record[vField],
                        text: record[lField]
                    }
                });

            callback(200, options);
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
     * Get tenant access key from CenitIO settings or TENANT_ACCESS_KEY environment.
     *
     * @param CenitIO
     * @returns {string}
     */
    getTenantAccessKey: function (CenitIO) {
        return (CenitIO.tenantAccessKey || process.env.TENANT_ACCESS_KEY).trim()
    },

    /**
     * Get tenant access token from CenitIO settings or TENANT_ACCESS_TOKEN environment.
     *
     * @param CenitIO
     * @returns {string}
     */
    getTenantAccessToken: function (CenitIO) {
        return (CenitIO.tenantAccessToken || process.env.TENANT_ACCESS_TOKEN).trim()
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
                return typeof v == 'string' && v.trim() != ''
            };

        if (!isValid(CenitIO.dataTypeName)) return callback(util.format(errMsg, 'dataTypeName'));
        if (!isValid(CenitIO.dataTypeNamespace)) return callback(util.format(errMsg, 'dataTypeNamespace'));
        if (!isValid(CenitIO.baseApiUrl)) return callback(util.format(errMsg, 'baseApiUrl'));

        callback();
    },

    /**
     * Returns headers to be sent in CenitIO request.
     *
     * @param taKey {String} CenitIO tenant access key.
     * @param taToken {String} CenitIO tenant access token.
     * @returns {{Content-Type: string, X-Tenant-Access-Key: *, X-Tenant-Access-Token: *}}
     */
    headers: function (taKey, taToken) {
        return {
            'Content-Type': 'application/json',
            'X-Tenant-Access-Key': taKey,
            'X-Tenant-Access-Token': taToken
        };
    }
};