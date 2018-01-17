define([
    'knockout-plus',
    'marked',
    'kb_common/html'
], function (
    ko,
    marked,
    html
) {
    'use strict';
    var t = html.tag,
        div = t('div'),
        a = t('a'),
        ul = t('ul'),
        li = t('li');

    function viewModel(params) {
        var helpDb = params.helpDb;

        var topicsIndex = {};
        helpDb.topics.forEach(function (topic) {
            topicsIndex[topic.id] = topic;
        });

        var currentTopicId = ko.observable();

        var currentTopic = ko.observable();

        currentTopicId.subscribe(function () {
            currentTopic(topicsIndex[currentTopicId()]);
        });

        // ACTIONS
        function doSelectTopic(topic) {
            currentTopicId(topic.id);
        }

        currentTopicId(params.topic || 'overview');

        return {
            topics: helpDb.topics,
            references: helpDb.references,
            currentTopicId: currentTopicId,
            doSelectTopic: doSelectTopic,
            currentTopic: currentTopic
        };
    }

    var styles = html.makeStyles({
        classes: {
            component: {
                css: {
                    paddingTop: '12px'
                }
            },
            index: {
                css: {
                    display: 'inline-block',
                    width: '30%',
                    border: '1px rgb(221,221,221) solid',
                    padding: '6px',
                    verticalAlign: 'top'
                }
            },
            indexList: {
                css: {                    
                    listStyle: 'none',
                    padding: '0'
                }
            },
            indexListItem: {
                css: {                    
                    display: 'block',
                    padding: '4px'
                }
            },
            indexListItemLink: {
                css: {                                        
                    padding: '4px',
                    display: 'block'
                },
                pseudo: {
                    hover: {
                        backgroundColor: '#DDD'
                    }
                }
            },
            active: {
                css: {
                    backgroundColor: '#DDD'
                }
            },
            body: {
                css: {
                    display: 'inline-block',
                    width: '70%',
                    padding: '6px 6px 6px 12px',
                    verticalAlign: 'top'
                }
            },
            title: {
                css: {
                    fontWeight: 'bold'
                }
            },
            references: {
                css: {
                    marginTop: '12px'
                }
            }
        }
    });

    ko.bindingHandlers.htmlMarkdown = {
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var markdown = marked(valueAccessor());
            element.innerHTML = markdown;
            // console.log(valueAccessor, bindingContext);
            // element.innerHTML = 'hi!';
        }
    };

    function template() {
        return div({
            class: styles.classes.component
        }, [
            styles.sheet,
            div({
                class: styles.classes.index
            }, [
                div({
                    style: {
                        fontWeight: 'bold'
                    }
                }),
                ul({
                    dataBind: {
                        foreach: 'topics'
                    },
                    class: styles.classes.indexList
                }, li(a({
                    dataBind: {
                        text: 'title',
                        click: '$component.doSelectTopic',
                        css: 'id === $component.currentTopicId() ? "' + styles.classes.active + '": ""'
                    },
                    class: styles.classes.indexListItem
                })))
            ]),
            div({
                dataBind: {
                    with: 'currentTopic'
                },
                class: styles.classes.body
            }, [
                div({
                    dataBind: {
                        text: 'title'
                    },
                    class: styles.classes.title
                }),
                div({
                    dataBind: {
                        htmlMarkdown: 'content'
                    },
                    class: 'kb-help-markdown'
                })
                // div({
                //     dataBind: {
                //         foreach: 'content'
                //     },
                //     class: '-content'
                // }, p({
                //     dataBind: {
                //         text: '$data'
                //     }
                // }))
            ]),
            '<!-- ko if: $data.references && references.length > 0 -->',
            div({
                class: styles.classes.references
            }, [
                div({
                    class: styles.classes.title
                }, 'References'),
                ul({
                    dataBind: {
                        foreach: 'references'
                    }
                }, li(a({
                    dataBind: {
                        attr: {
                            href: 'url',
                            target: 'external ? "_blank" : ""'
                        },
                        text: 'title'
                    }
                })))
            ]),
            '<!-- /ko -->'
        ]);
    }

    function component() {
        return {
            viewModel: viewModel,
            template: template()
        };
    }
    return component;
});