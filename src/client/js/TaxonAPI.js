/*global define */
/*jslint
 white: true, browser: true
 */
define([
    'taxon',
    'thrift',
    'bluebird',
    'utils',
    'error'
], function (taxon, Thrift, Promise, utils, error) {
    // API Implementation
    /*
     * Taxon wrapps a single instance of "taxon".
     * thrift api does not work this way, it is a set of functions
     */
   
    var taxonFactory = function (config) {
        var objectReference,
            dataAPIUrl,
            authToken,
            transport,
            protocol,
            client,
            runtime;

        if (!config) {
            throw error.makeErrorObject(2);
        }
        
//        runtime = config.runtime;
//        if (!runtime) {
//            throw error.getErrorObject({
//                name: 'MissingRuntimeArg',
//                message: 'At present, the runtime object is required',
//                url: 'some url here'
//            });
//        }

        // Params
        objectReference = config.ref;
        if (!objectReference) {
            throw error.makeErrorObject(1);           
        }

        dataAPIUrl = config.serviceUrl; // || runtime.getConfig('service.data_api.url');
        if (!dataAPIUrl) {
            throw error.getErrorObject({
                name: 'MissingServiceUrlArg',
                message: 'Cannot find a url for the data api',
                suggestion: 'The url should be provided as an argument as "serviceUrl" or configured under "service.data_api.url"'
            });
            
        }

        authToken = config.token; // || runtime.getAuthToken();
        if (!authToken) {
            throw error.getErrorObject({
                name: 'MissingAuthArg',
                message: 'No Authorization found; Authorization is required for the data api',
                suggestion: 'The authorization may be provided in the "token" argument, or in the "runtime.getAuthToken()" method'
            });
        }

        transport = new Thrift.TXHRTransport(dataAPIUrl);
        protocol = new Thrift.TJSONProtocol(transport);
        client = new taxon.thrift_serviceClient(protocol);


        function get_parent() {
            return Promise.resolve(client.get_parent(authToken, objectReference));
        }
        function get_children() {
            return Promise.resolve(client.get_children(authToken, objectReference));
        }
        function get_genome_annotations() {
            return Promise.resolve(client.get_genome_annotations(authToken, objectReference));
        }
        function get_scientific_lineage() {
            return Promise.resolve(client.get_scientific_lineage(authToken, objectReference))
                .then(function(data) {
                    return data.split(';').map(function(x){return x.trim(' ');})
                });
        }
        function get_scientific_name() {
            return Promise.resolve(client.get_scientific_name(authToken, objectReference));
        }
        function get_taxonomic_id() {
            return Promise.resolve(client.get_taxonomic_id(authToken, objectReference));
        }
        function get_kingdom() {
            return Promise.resolve(client.get_kingdom(authToken, objectReference));
        }
        function get_domain() {
            return Promise.resolve(client.get_domain(authToken, objectReference));
        }
        function get_genetic_code() {
            return Promise.resolve(client.get_genetic_code(authToken, objectReference));
        }
        function get_aliases() {
            return Promise.resolve(client.get_aliases(authToken, objectReference));
        }
        
        // API
        return {
            get_parent: get_parent,
            get_children: get_children,
            get_genome_annotations: get_genome_annotations,
            get_scientific_lineage: get_scientific_lineage,
            get_scientific_name: get_scientific_name,
            get_taxonomic_id: get_taxonomic_id,
            get_kingdom: get_kingdom,
            get_domain: get_domain,
            get_genetic_code: get_genetic_code,
            get_aliases: get_aliases
        };

    };

    return taxonFactory;

});