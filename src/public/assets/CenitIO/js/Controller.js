(function ($) {

    var CenitIO = {

        /**
         * Init process to send form data to CenitIO platform.
         *
         * @param formData {Object} Form data to be seved.
         * @param callback {Function} Callback function with status and menssage response parameters.
         */
        saveFormData: function (formData, callback) {
            var vThis = this;

            formData = this.parseData(formData);

            $.ajax({
                url: '/saveFormData',
                method: 'POST',
                dataType: 'json',
                data: formData,

                success: function (resData, textStatus, jqXHR) {
                    callback(status, resData.message);
                },

                error: function (jqXHR, textStatus, errorThrown) {
                    callback(500, "Request failed ({0}), data can't be saved.".format(errorThrown || textStatus));
                }
            });
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
         * Create selection boxes.
         */
        createSelectionBoxes: function (callback) {
            var vThis = this;

            $.ajax({
                url: '/selectionItems',
                method: 'GET',
                dataType: 'json',

                success: function (selectionItems, textStatus, jqXHR) {
                    var selItems = Object.keys(selectionItems || {}),

                        create = function (selItem, idx, select2options) {
                            var $el = $("#{0}".format(selItem)),
                                $parent = $el.parent(),
                                classes = $el.prop('class');

                            $el.remove();
                            $parent.append('<select name="{0}" id="{0}" class="{1}"></select>'.format(selItem, classes));

                            $("select#{0}".format(selItem)).select2(select2options);

                            if (idx == selItems.length - 1) callback(200, null, true);
                        };

                    selItems.forEach(function (selItem, idx) {
                        if (selectionItems[selItem].remote) {
                            create(selItem, idx, vThis.getRemoteOptions(selectionItems[selItem].remote));
                        } else {
                            vThis.getStaticOptions(selectionItems[selItem], function (options) {
                                create(selItem, idx, { data: options });
                            });
                        }
                    }, this);
                },

                error: function (jqXHR, textStatus, errorThrown) {
                    callback(500, "Request failed ({0}), data can't be saved.".format(errorThrown || textStatus));
                }
            });
        },

        startLoading: function () {
            var $el = $('#loading');

            if ($el.length == 0) {
                $('body').append('<div id="loading" class="modal"><img src="assets/CenitIO/images/loading.gif"/></div>');
                $el = $('#loading');
            }

            $el.modal('show');
        },

        stopLoading: function () {
            $('#loading').modal('hide');
        },

        getStaticOptions: function (selItem, callback) {
            var options = (selItem.options || ['not-options']).map(function (o) {
                if ($.isString(o) || $.isNumeric(o)) return { id: o, text: o };
                if ($.isBoolean(o)) return { id: o, text: o ? 'true' : 'false' };
                if ($.isPlainObject(o)) return {
                    id: o.value == undefined ? o.id : o.value,
                    text: o.label == undefined ? o.text : o.label
                }
            });

            callback(options);
        },

        getRemoteOptions: function (setting) {
            return {
                ajax: {
                    url: "/selectionItemOptions",
                    method: 'POST',
                    dataType: 'json',
                    data: setting,
                    delay: 250,
                    data: function (params) {
                        setting.q = params.term;
                        setting.page = params.page;
                        console.log(setting);
                        return setting;
                    },
                    processResults: function (data, params) {
                        console.log(data);
                        params.page = params.page || 1;
                        return {
                            results: data.items,
                            pagination: {
                                more: (params.page * 30) < data.total_count
                            }
                        };
                    },
                    cache: true
                },
                escapeMarkup: function (markup) { return markup; },
                minimumInputLength: 1,
                //     templateResult: formatRepo, // omitted for brevity, see the source of this page
                // templateSelection: formatRepoSelection // omitted for brevity, see the source of this page
            };
        }
    };

    $.isString = function (v) {
        return 'string' == typeof v
    };

    $.isBoolean = function (v) {
        return 'boolean' == typeof v
    };

    $.fn.serializeObject = function () {
        var obj = {},
            a = this.serializeArray();

        $.each(a, function () {
            if (obj[this.name]) {
                if (!obj[this.name].push) obj[this.name] = [obj[this.name]];
                obj[this.name].push(this.value || '');
            } else {
                obj[this.name] = this.value || '';
            }
        });
        return obj;
    };

    // Extending String class with format method.
    String.prototype.format = function () {
        var args = arguments;

        return this.replace(/\{\d+\}/g, function (item) {
            var index = parseInt(item.substring(1, item.length - 1));
            return args[index];
        });
    };

    // Extending String class with toUnderscoreCase method.
    String.prototype.toUnderscoreCase = function () {
        return this.replace(/(?:^|\.?)([A-Z])/g, function (x, y) {
                return "_" + y.toLowerCase()
            }
        ).replace(/^_/, "");
    };

    $(document).ready(function (e) {
        // Connect submit action with CenitIO.saveFormData.
        $('form#formc').off('submit').on('submit', function (e) {
            var formData = $(this).serializeObject();

            CenitIO.startLoading();
            CenitIO.saveFormData(formData, function (status, msg) {
                CenitIO.stopLoading();
                alert(msg);
            });

            e.preventDefault();
        });

        // Create selection boxes.
        CenitIO.startLoading();
        CenitIO.createSelectionBoxes(function (status, msg, finish) {
            if (msg) alert(msg);
            if (finish) CenitIO.stopLoading();
        });
    });


}(jQuery));