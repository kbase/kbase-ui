define([
    'bluebird',
    'ajv',
    'kb_common_ts/HttpClient'
], function (
    Promise,
    Ajv,
    HttpClient
) {
    'use strict';

    function factory() {
        var schemas = {};
        var ajv = new Ajv();

        function addSchema(def) {
            if (schemas[def.name]) {
                throw new Error('Schema already loaded: ' + def.name);
            }
            var httpClient = new HttpClient.HttpClient();
            return httpClient.request({
                method: 'GET',
                url: def.url
            })
                .then(function (result) {
                    var schemaJson;
                    var schemaCompiled;
                    try {
                        schemaJson = JSON.parse(result.response);
                    } catch (ex) {
                        console.error('Error json-decoding json spec', ex, def, result);
                        throw new Error('Error json-decoding json spec: ' + def.name);
                    }
                    try {
                        schemaCompiled = ajv.compile(schemaJson);
                    } catch (ex) {
                        console.error('Error compiling json spec', ex, def, schemaJson);
                        throw new Error('Error compiling json spce: ' + def.name);
                    }
                    def.source = result.response;
                    def.json = schemaJson;
                    def.validator = schemaCompiled;
                    schemas[def.name] = def;
                });
        }

        function hasSchema(name) {
            return (name in schemas);
        }

        function getSchema(name) {
            if (!hasSchema(name)) {
                throw new Error('Schema not found: ' + name);
            }
            return schemas[name];
        }

        function listSchemas() {
            return Object.keys(schemas).map(function (name) {
                var schema = schemas[name];
                return {
                    name: schema.name,
                    description: schema.description,
                    validator: schema.validator
                };
            });
        }

        function pluginHandler(serviceConfigs, pluginConfig) {
            // iterate through configs
            if (!serviceConfigs) {
                return;
            }

            return Promise.all(serviceConfigs.map(function (config) {
                config.url = window.location.origin + [pluginConfig.resourcesRoot, config.path].join('/');
                return addSchema(config);
            }));
        }

        function start() {}

        function stop() {}

        return {
            // client api
            getSchema: getSchema,
            listSchemas: listSchemas,

            // plugin-service api
            pluginHandler: pluginHandler,

            // service api
            start: start,
            stop: stop
        };
    }

    return {
        make: factory
    };
});
