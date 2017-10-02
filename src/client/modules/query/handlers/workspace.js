define([
    'bluebird',
    'kb_common/jsonRpc/genericClient',
    'kb_service/utils',
    '../cacher'
], function (
    Promise,
    GenericClient,
    serviceUtils,
    Cacher
) {
    function factory(config) {
        var runtime = config.runtime;

        var workspace = new GenericClient({
            url: runtime.config('services.workspace.url'),
            module: 'Workspace',
            token: runtime.service('session').getAuthToken()
        });

        var objectCache = Cacher();

        function objectQuery(refSpecs) {
            var resultsMap = {};
            var objectsNeeded = [];
            refSpecs.forEach(function (refSpec) {
                if (objectCache.has(refSpec.ref)) {
                    resultsMap[refSpec.ref] = objectCache.get(refSpec.ref);
                } else {
                    objectsNeeded.push(refSpec);
                }
            });
            // Everything is cached?
            if (objectsNeeded.length === 0) {
                return refSpecs.map(function (refSpec) {
                    return resultsMap[refSpec.ref];
                });
            }

            // Otherwise bundle up the object id specs for one request.
            return workspace.callFunc('get_object_info3', [{
                objects: objectsNeeded.map(function (obj) { return obj.spec; }),
                includeMetadata: 1
            }]).spread(function (result) {
                result.infos.forEach(function (info, index) {
                    var object = serviceUtils.objectInfoToObject(info);
                    var ref = objectsNeeded[index].ref;
                    // TODO: resolve this - duplicates appearing.
                    if (objectCache.has(ref)) {
                        console.warn('Duplicate object detected: ' + ref);
                    } else {
                        objectCache.add(ref, object);
                    }
                    resultsMap[ref] = object;
                });
                // unpack the results back into an array with the same shape.
                // TODO: just accept a map, since we don't want duplicate refs anyway.
                return refSpecs.map(function (refSpec) {
                    return resultsMap[refSpec.ref];
                });
            });
        }

        var workspaceCache = Cacher();

        function workspaceQuery(ids) {
            var resultsMap = {};

            var needed = [];
            ids.forEach(function (id) {
                var sid = String(id);
                if (workspaceCache.has(sid)) {
                    resultsMap[sid] = workspaceCache.get(sid);
                } else {
                    needed.push(id);
                }
            });

            return Promise.all(needed.map(function (id) {
                return workspace.callFunc('get_workspace_info', [{
                    id: id
                }]).spread(function (info) {
                    var workspaceInfo = serviceUtils.workspaceInfoToObject(info);
                    workspaceCache.add(String(id), workspaceInfo);
                    resultsMap[String(id)] = workspaceInfo;
                });
            })).then(function () {
                return resultsMap;
            });
        }

        var queryFuns = {
            objectInfo: objectQuery,
            workspaceInfo: workspaceQuery
        };

        function query(spec) {
            // We operate over a flattened array of queries.
            var queryMap = {};
            Object.keys(spec).forEach(function (queryKey) {
                var queryInput = spec[queryKey];
                var queryFun = queryFuns[queryKey];
                if (!queryFun) {
                    throw new Error('Sorry, query method not supported: ' + queryKey);
                }
                queryMap[queryKey] = queryFun(queryInput);
            });
            return Promise.props(queryMap);
        }

        return {
            query: query
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});