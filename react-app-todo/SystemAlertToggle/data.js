define([
    'bluebird',
    'knockout',
    'uuid',
    '../../lib/searchApi',
    'yaml!../../data/stopWords.yml'
], function (
    Promise,
    ko,
    Uuid,
    SearchAPI,
    stopWordsDb
) {
    'use strict';

    function isStopWord(word) {
        if (stopWordsDb.warn.indexOf(word) >= 0) {
            return true;
        }
        if (stopWordsDb.ignore.indexOf(word) >= 0) {
            return true;
        }
        return false;
    }

    // TODO: configure this somewhere
    function isBlacklistedHighlightField(fieldName) {
        return ['tags'].includes(fieldName);
    }

    function encodeHTML(possibleHTML) {
        const node = document.createElement('div');
        node.innerHTML = possibleHTML;
        return node.innerText;
    }


    // For now, this fakes the search...
    function factory(params) {
        const maxSearchResults = params.maxSearchItems;

        const types = params.types;

        const searchConfig = {
            // max number of search result items to hold in the buffer
            // before we start removing those out of view
            maxBufferSize: params.maxBufferSize || 100,
            // number of search items to fetch at one time.
            fetchSize: params.pageSize || 20
        };

        function objectToViewModel(obj) {
            const type = types.getTypeForObject(obj);
            if (!type) {
                console.error('ERROR cannot type object', obj);
                throw new Error('Cannot type this object');
            }

            const icon = type.getIcon(type);

            const ref = type.getRef();
            const detail = type.detail();
            const detailMap = detail.reduce(function (m, field) {
                m[field.id] = field;
                return m;
            }, {});

            const matches = Object.keys(obj.highlight).reduce((matches, field) => {
                if (isBlacklistedHighlightField(field)) {
                    console.warn('highlight field ' + field + ' ignored');
                    return matches;
                }

                let label = type.getSearchFieldLabel(field);
                if (!label) {
                    label = field;
                    console.warn('highlight field ' + field + ' not found in type spec', obj);
                }

                const emStart = new Uuid(4).format();
                const emFinish = new Uuid(4).format();

                matches
                    .push({
                        id: field,
                        label: label,
                        highlights: obj.highlight[field]
                            .map((highlight) => {
                                const safe1 = highlight.replace('<em>', emStart).replace('</em>', emFinish);
                                const safe2 = encodeHTML(safe1);
                                const safe3 = safe2.replace(emStart, '<em>').replace(emFinish, '</em>');
                                console.log('safe3', safe3);
                                return {
                                    highlight: safe3
                                };
                            })
                    });
                return matches;
            }, []);

            // Uncomment to re-enable highlights merging into details
            // detail.forEach(function (field) {
            //     if (matchMap[field.id]) {
            //         field.highlights = matchMap[field.id].highlights;
            //     }
            // });

            const vm = {
                type: {
                    id: obj.type,
                    label: type.getLabel(),
                    icon: icon
                },
                // TODO: I don't remember why I named this "matchClass", but it confuses me now.
                matchClass: {
                    id: type.getUIClass(),
                    copyable: type.isCopyable(),
                    viewable: type.isViewable(),
                    ref
                },

                // Detail, type-specific
                detail: detail,

                url: window.location.origin + '#dataview/' + ref.workspaceId + '/' + ref.objectId + '/' + ref.version,

                // should be different per object type? E.g. narrative - nice name, others object name??
                // Generic fields
                name: obj.object_name,
                date: new Date(obj.modified_at),
                scientificName: detailMap.scientificName ? detailMap.scientificName.value || '' : '',

                matches: matches,
                selected: ko.observable(),
                showMatches: ko.observable(false),
                showDetails: ko.observable(false),
                active: ko.observable(false)
            };
            return vm;
        }

        function search(query) {
            const searchApi = SearchAPI.make({
                runtime: params.runtime
            });
            return Promise.all([
                searchApi.referenceObjectSearch({
                    query: query.terms.join(' '),
                    page: query.start || 0,
                    pageSize: searchConfig.fetchSize
                }),
                searchApi.typeSearch({
                    query: query.terms.join(' '),
                    withPrivateData: 0,
                    withPublicData: 1,
                    dataSource: 'referenceData'
                })
            ])
                .then(([objectResults, typeResults]) => {
                    const objects = objectResults.objects.map((object) => {
                        return objectToViewModel(object);
                    });
                    const totalByType = Object.keys(typeResults.type_to_count).map(function (typeName) {
                        return {
                            id: typeName.toLowerCase(),
                            count: typeResults.type_to_count[typeName]
                        };
                    });
                    let totalSearchHits;
                    if (objectResults.total > maxSearchResults) {
                        totalSearchHits = maxSearchResults;
                    } else {
                        totalSearchHits = objectResults.total;
                    }
                    return {
                        items: objects,
                        first: query.start,
                        isTruncated: true,
                        summary: {
                            totalByType: totalByType,
                            totalSearchHits: totalSearchHits,
                            totalSearchSpace: objectResults.total,
                            isTruncated: totalSearchHits < objectResults.total
                        },
                        stats: {
                            objectSearch: objectResults.search_time,
                            typeSearch: typeResults.search_time
                        }
                    };
                });
        }

        return {
            search,
            isStopWord
        };
    }

    return {
        make: factory
    };
});
