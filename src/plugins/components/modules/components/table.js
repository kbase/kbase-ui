define([
    'knockout-plus',
    'kb_common/html'
], function (
    ko,
    html
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        span = t('span'),
        p = t('p'),
        a = t('a');

    var styles = html.makeStyles({
        component: {
            flex: '1 1 0px',
            display: 'flex',
            flexDirection: 'column'
        },
        header: {
            flex: '0 0 50px'
        },
        body: {
            flex: '1 1 0px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            minWidth: '40em'
        },
        headerRow: {
            flex: '0 0 35px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            // backgroundColor: 'gray',
            // color: 'white'
            fontWeight: 'bold',
            color: 'gray'
        },
        tableBody: {
            css: {
                flex: '1 1 0px',
                display: 'flex',
                flexDirection: 'column'
            }
        },
        itemRows: {
            css: {
                flex: '1 1 0px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }
        },
        itemRow: {
            css: {
                flex: '0 0 35px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center'
            },
            pseudo: {
                hover: {
                    backgroundColor: '#CCC',
                    cursor: 'pointer'
                }
            }
        },
        itemRowActive: {
            backgroundColor: '#DDD'
        },
        searchLink: {
            css: {
                textDecoration: 'underline'
            },
            pseudo: {
                hover: {
                    textDecoration: 'underline',
                    backgroundColor: '#EEE',
                    cursor: 'pointer'
                }
            }
        },
        cell: {
            flex: '0 0 0px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            // border: '1px silver solid',
            borderBottom: '1px #DDD solid',
            height: '35px',
            padding: '4px 4px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
        },
        headerCell: {
            css: {
                flex: '0 0 0px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                // border: '1px silver solid',
                borderTop: '1px #DDD solid',
                borderBottom: '1px #DDD solid',
                height: '35px',
                padding: '4px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center'
            }
        },
        innerCell: {
            flex: '1 1 0px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
        },
        innerSortCell: {
            flex: '1 1 0px',
            // overflow: 'hidden'
            whiteSpace: 'nowrap',
            display: 'flex',
            flexDirection: 'row',
            overflow: 'hidden'
        },
        sortableCell: {
            css: {
                cursor: 'pointer',
            },
            pseudo: {
                hover: {
                    backgroundColor: 'rgba(200,200,200,0.8)'
                }
            }
        },
        sortedCell: {
            backgroundColor: 'rgba(200,200,200,0.5)'
        },
        sortIndicator: {
            display: 'inline'
        },
        sectionHeader: {
            padding: '4px',
            fontWeight: 'bold',
            color: '#FFF',
            backgroundColor: '#888'
        },
        selected: {
            backgroundColor: '#CCC'
        },
        private: {
            backgroundColor: 'green'
        },
        miniButton: {
            css: {
                padding: '2px',
                border: '2px transparent solid',
                cursor: 'pointer'
            },
            pseudo: {
                hover: {
                    border: '2px white solid'
                },
                active: {
                    border: '2px white solid',
                    backgroundColor: '#555',
                    color: '#FFF'
                }
            }
        }
    });

    function viewModel(params, componentInfo) {
        var subscriptions = ko.kb.SubscriptionManager.make();

        var slowLoadingThreshold = 300;

        var table = params.table;
        var columns = table.columns;
        // calculate widths...
        var totalWidth = columns.reduce(function (tw, column) {
            return tw + column.width;
        }, 0);
        columns.forEach(function (column) {
            var width = String(100 * column.width / totalWidth) + '%';

            // Header column style
            var s = column.headerStyle || {};
            s.flexBasis = width;
            column.headerStyle = s;

            // Row column style
            s = column.rowStyle || {};
            s.flexBasis = width;
            column.rowStyle = s;
        });

        var sortColumn = ko.observable('timestamp');

        var sortDirection = ko.observable('descending');

        /*
            Sorting is managed here in the table, and we
            communicate changes via the table.sortColumn() call.
             We don't know whether the implementation supports
             single or multiple column sorts, etc.
             In turn, the sorted property may be set to asending,
             descending, or falsy.
        */
        function doSort(column) {
            table.sortBy(column);
        }

        // AUTO SIZING

        // we hinge upon the height, which is updated when we start and when the ...
        var height = ko.observable();

        function calcHeight() {
            return componentInfo.element.querySelector('.' + styles.classes.tableBody).clientHeight;
        }

        // A cheap delay to avoid excessive resizing.
        var resizerTimeout = 200;
        var resizerTimer = null;
        function resizer() {
            if (resizerTimer) {
                return;
            }
            resizerTimer = window.setTimeout(function () {
                resizerTimer = null;
                height(calcHeight());
            }, resizerTimeout);
        }
        var resizeListener = window.addEventListener('resize', resizer, false);

        // TODO: bind this to the table styles
        var rowHeight = 35;

        subscriptions.add(height.subscribe(function (newValue) {
            if (!newValue) {
                table.pageSize(null);
            }


            var rowCount = Math.floor(newValue / rowHeight);

            table.pageSize(rowCount);
        }));

        // Calculate the height immediately upon component load
        height(calcHeight());

        function doOpenUrl(data) {
            if (!data.url) {
                console.warn('No url for this column, won\'t open it');
                return;
            }
            window.open(data.url, '_blank');
        }

        var doRowAction;
        if (table.rowAction) {
            doRowAction = function (data) {
                if (table.rowAction) {
                    table.rowAction(data);
                } else {
                    console.warn('No row action...', table, data);
                }
            };
        } else {
            doRowAction = null;
        }



        var isLoadingSlowly = ko.observable(false);

        var loadingTimer;
        function timeLoading() {
            loadingTimer = window.setTimeout(function () {
                if (table.isLoading()) {
                    isLoadingSlowly(true);
                }
                loadingTimer = null;
            }, slowLoadingThreshold);
        }
        function cancelTimeLoading() {
            if (loadingTimer) {
                window.clearTimeout(loadingTimer);
                loadingTimer = null;
            }
            isLoadingSlowly(false);
        }

        subscriptions.add(table.isLoading.subscribe(function (loading) {
            if (loading) {
                timeLoading();
            } else {
                cancelTimeLoading();
            }
        }));

        function openLink(url) {
            if (url) {
                window.open(url, '_blank');
            }
        }


        // LIFECYCLE

        function dispose() {
            if (resizeListener) {
                window.removeEventListener('resize', resizer, false);
            }
            subscriptions.dispose();
        }

        return {
            rows: table.rows,
            isLoading: table.isLoading,
            isLoadingSlowly: isLoadingSlowly,
            columns: columns,
            doSort: doSort,
            sortColumn: sortColumn,
            sortDirection: sortDirection,
            state: table.state,
            doOpenUrl: doOpenUrl,
            doRowAction: doRowAction,
            openLink: openLink,
            // thread env for useful plugin-level hooks.
            env: table.env,
            actions: table.actions,
            // lifecycle hooks
            dispose: dispose
        };
    }

    function obj(aa) {
        return aa.reduce(function (acc, prop) {
            acc[prop[0]] = prop[1];
            return acc;
        }, {});
    }

    function buildResultsHeader() {
        return  div({
            class: styles.classes.headerRow,
            dataBind: {
                foreach: {
                    data: '$component.columns',
                    as: '"column"'
                }
            }
        }, div({
            dataBind: {
                style: 'column.headerStyle',
                css: obj([
                    [styles.classes.sortableCell, 'column.sort ? true : false'],
                    [styles.classes.sortedCell, 'column.sort && column.sort.active() ? true : false']
                ]),
                event: {
                    click: 'column.sort ? function () {$component.doSort(column);} : false'
                }
            },
            class: [styles.classes.headerCell]
        }, [
            '<!-- ko if: column.sort -->',
            div({

                class: [styles.classes.innerSortCell]
            }, [
                // header label
                div({
                    class: [styles.classes.innerCell]
                }, [
                    span({
                        dataBind: {
                            text: 'column.label'
                        },
                        style: {

                            marginRight: '2px'
                        },
                    })
                ]),

                // sort indicator
                div({
                    class: [styles.classes.sortIndicator]
                }, [
                    '<!-- ko if: !column.sort.active() -->',
                    span({
                        class: 'fa fa-sort'
                    }),
                    '<!-- /ko -->',
                    '<!-- ko if: column.sort.active() -->',
                    '<!-- ko if: column.sort.direction() === "descending" -->',
                    span({
                        class: 'fa fa-sort-desc'
                    }),
                    '<!-- /ko -->',
                    '<!-- ko if: column.sort.direction() === "ascending" -->',
                    span({
                        class: 'fa fa-sort-asc'
                    }),
                    '<!-- /ko -->',
                    '<!-- /ko -->'
                ])
            ]),
            '<!-- /ko -->',

            '<!-- ko ifnot: column.sort -->',
            div({
                class: [styles.classes.innerCell]
            }, [
                span({
                    dataBind: {
                        text: 'column.label'
                    }
                }),
            ]),
            '<!-- /ko -->'
        ]));
    }

    function buildColValue() {
        return [
            '<!-- ko if: row[column.name].action -->',
            span({
                dataBind: {
                    typedText: {
                        value: 'row[column.name].value',
                        type: 'column.type',
                        format: 'column.format',
                        click: '$component[rowl[column.name].action]'
                    },
                    attr: {
                        title: 'row[column.name].info'
                    }
                }
            }),
            '<!-- /ko -->',

            '<!-- ko ifnot: row[column.name].action -->',

            '<!-- ko if: row[column.name].url -->',
            a({
                dataBind: {
                    typedText: {
                        value: 'row[column.name].value',
                        type: 'column.type',
                        format: 'column.format'
                    },
                    attr: {
                        title: 'row[column.name].info'
                    },
                    click: 'function () {$component.doOpenUrl(row[column.name]);}',
                    clickBubble: 'false'
                }
            }),
            '<!-- /ko -->',

            '<!-- ko ifnot: row[column.name].url -->',
            span({
                dataBind: {
                    typedText: {
                        value: 'row[column.name].value',
                        type: 'column.type',
                        format: 'column.format'
                    },
                    attr: {
                        title: 'row[column.name].info'
                    }
                }
            }),
            '<!-- /ko -->',

            '<!-- /ko -->',
        ];
    }

    function  buildActionFnCol() {
        return [
            '<!-- ko if: row[column.name] -->',
            a({
                dataBind: {
                    typedText: {
                        value: 'row[column.name].value',
                        type: 'column.type',
                        format: 'column.format'
                    },
                    click: 'function () {column.action.fn(row[column.name], row);}',
                    clickBubble: false,
                    attr: {
                        title: 'row[column.name].info'
                    }
                },
                style: {
                    cursor: 'pointer'
                }
            }),
            '<!-- /ko -->',

            // NO column value, show the column action label or icon
            '<!-- ko ifnot: row[column.name] -->',


            '<!-- ko if: column.action.label -->',
            a({
                dataBind: {
                    text: 'column.action.label',
                    // click: 'function () {column.action(row);}',
                    // clickBubble: false
                },
                style: {
                    cursor: 'pointer'
                }
            }),
            '<!-- /ko -->',

            '<!-- ko ifnot: column.action.label -->',
            a({
                dataBind: {
                    css: 'column.action.icon',
                    click: 'function () {column.action.fn(row);}',
                    clickBubble: false,
                    // attr: {
                    //     title: 'row[column.name].info'
                    // }
                },
                style: {
                    cursor: 'pointer'
                },
                class: 'fa'
            }),
            '<!-- /ko -->',

            '<!-- /ko -->'
        ];
    }

    function  buildActionNameCol() {
        return [
            '<!-- ko if: row[column.name] -->',
            a({
                dataBind: {
                    typedText: {
                        value: 'row[column.name].value',
                        type: 'column.type',
                        format: 'column.format'
                    },
                    click: 'function () {$component.actions[column.action.name]({row: row, col: row[column.name]});}',
                    clickBubble: false,
                    attr: {
                        title: 'row[column.name].info'
                    }
                },
                style: {
                    cursor: 'pointer'
                }
            }),
            '<!-- /ko -->',

            // NO column value, show the column action label or icon
            '<!-- ko ifnot: row[column.name] -->',

            // By label
            '<!-- ko if: column.action.label -->',
            a({
                dataBind: {
                    text: 'column.action.label',
                    click: 'function () {$component.actions[column.action.name]({row: row, col: null});}',
                    clickBubble: false,
                },
                style: {
                    cursor: 'pointer'
                }
            }),
            '<!-- /ko -->',

            // By icon
            '<!-- ko ifnot: column.action.label -->',
            a({
                dataBind: {
                    css: 'column.action.icon',
                    click: 'function () {$component.actions[column.action.name]({row: row, col: null});}',
                    clickBubble: false,
                },
                style: {
                    cursor: 'pointer'
                },
                class: 'fa'
            }),
            '<!-- /ko -->',

            '<!-- /ko -->'
        ];
    }

    function  buildActionLinkCol() {
        return [
            '<!-- ko if: row[column.name] -->',

            '<!-- ko if: row[column.name].url -->',
            a({
                dataBind: {
                    typedText: {
                        value: 'row[column.name].value',
                        type: 'column.type',
                        format: 'column.format'
                    },
                    click: 'function () {$component.openLink(row[column.name].url);}',
                    // click: 'function () {column.action.fn(row[column.name], row);}',
                    clickBubble: false,
                    attr: {
                        title: 'row[column.name].info'
                    }
                },
                style: {
                    cursor: 'pointer'
                }
            }),
            '<!-- /ko -->',

            '<!-- ko ifnot: row[column.name].url -->',
            span({
                dataBind: {
                    typedText: {
                        value: 'row[column.name].value',
                        type: 'column.type',
                        format: 'column.format'
                    },
                    attr: {
                        title: 'row[column.name].info'
                    }
                }
            }),
            '<!-- /ko -->',


            '<!-- /ko -->',

            // Case of a column definition containing a link, but no corresponding
            // row value. E.g. a per-row action.

            // NO column value, show the column action label or icon
            '<!-- ko ifnot: row[column.name] -->',


            '<!-- ko if: column.action.label -->',
            a({
                dataBind: {
                    text: 'column.action.label',
                    // click: 'function () {column.action(row);}',
                    // clickBubble: false
                },
                style: {
                    cursor: 'pointer'
                }
            }),
            '<!-- /ko -->',

            '<!-- ko ifnot: column.action.label -->',
            a({
                dataBind: {
                    css: 'column.action.icon',
                    click: 'function () {$module.openLink(row[column.name], row);}',
                    clickBubble: false,
                    // attr: {
                    //     title: 'row[column.name].info'
                    // }
                },
                style: {
                    cursor: 'pointer'
                },
                class: 'fa'
            }),
            '<!-- /ko -->',

            '<!-- /ko -->'
        ];
    }

    function buildResultsRows() {
        var rowClass = {};
        return div({
            dataBind: {
                foreach: {
                    data: 'rows',
                    as: '"row"'
                }
            },
            class: styles.classes.itemRows
        }, [
            div({
                dataBind: {
                    foreach: {
                        data: '$component.columns',
                        as: '"column"'
                    },
                    css: rowClass,
                    click: '$component.doRowAction'
                },
                class: styles.classes.itemRow
            }, [
                div({
                    dataBind: {
                        style: 'column.rowStyle'
                    },
                    class: [styles.classes.cell]
                },  div({
                    class: [styles.classes.innerCell]
                }, [
                    // ACTION COLUMN
                    '<!-- ko if: column.action -->',

                    '<!-- ko if: column.action.fn -->',
                    buildActionFnCol(),
                    '<!-- /ko -->',

                    '<!-- ko if: column.action.name -->',
                    buildActionNameCol(),
                    '<!-- /ko -->',

                    '<!-- ko if: column.action.link -->',
                    buildActionLinkCol(),
                    '<!-- /ko -->',

                    '<!-- /ko -->',

                    // NOT ACTION COLUMN
                    // (but maybe has action invocation in the col value!)
                    '<!-- ko ifnot: column.action -->',

                    // COMPONENT
                    '<!-- ko if: column.component -->',
                    div({
                        dataBind: {
                            component: {
                                name: 'column.component',
                                params: {
                                    field: 'row[column.name]',
                                    row: 'row',
                                    env: '$component.env'
                                }
                            }
                            // text: 'column.component'
                        },
                        style: {
                            flex: '1 1 0px',
                            display: 'flex',
                            flexDirection: 'column'
                        }
                    }),
                    '<!-- /ko -->',


                    '<!-- ko ifnot: column.component -->',

                    '<!-- ko if: row[column.name]  -->',
                    buildColValue(),
                    '<!-- /ko -->',

                    // '<!-- ko ifnot: column.type -->',
                    // span({
                    //     dataBind: {
                    //         text: 'row[column.name].value',
                    //         attr: {
                    //             title: 'row[column.name].info'
                    //         }
                    //     }
                    // }),
                    '<!-- /ko -->',

                    '<!-- /ko -->',
                    // '<!-- ko ifnot: typeof row[column.name] === "object" && row[column.name] !== null  -->',
                    // span({
                    //     dataBind: {
                    //         text: 'row[column.name]'
                    //     }
                    // }),
                    // '<!-- /ko -->',
                    // '<!-- /ko -->'
                ]))
            ])
        ]);
    }

    function buildLoading() {
        return [
            '<!-- ko if: $component.isLoading -->',
            div({
                style: {
                    position: 'absolute',
                    left: '0',
                    right: '0',
                    top: '0',
                    bottom: '0',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '300%',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: '5'
                }
            }, [
                div({
                    style: {
                        flex: '1 1 0px',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }
                }, [
                    '<!-- ko if: $component.isLoadingSlowly -->',
                    html.loading(),
                    '<!-- /ko -->'
                ])
            ]),
            '<!-- /ko -->'
        ];
    }

    function buildNoActiveSearch() {
        return div([
            '<!-- ko if: $component.isLoading -->',
            p('Running your search! Going from Zero to Hero ... ' + html.loading()),
            '<!-- /ko -->',

            '<!-- ko ifnot: $component.isLoading -->',
            p('NO ACTIVE SEARCH - PLACEHOLDER'),
            '<!-- /ko -->'
        ]);
    }

    function buildNoResults() {
        return div([
            '<!-- ko if: $component.isLoading -->',
            p('Running your search! Going from Zero to Hero ... ' + html.loading()),
            '<!-- /ko -->',

            '<!-- ko ifnot: $component.isLoading -->',
            p('NO RESULTS FROM SEARCH - PLACEHOLDER'),
            '<!-- /ko -->'
        ]);
    }

    function template() {
        return div({
            class: styles.classes.body
        }, [
            styles.sheet,
            buildResultsHeader(),
            // '<!-- ko if: search.isError -->',
            // buildError(),
            // '<!-- /ko -->',

            div({
                class: styles.classes.tableBody
            }, [
                // Handle case of a search having been run, but nothing found.
                '<!-- ko switch: $component.state() -->',

                '<!-- ko case: "notfound" -->',
                div({
                    style: {
                        padding: '12px',
                        backgroundColor: 'silver',
                        textAlign: 'center'
                    }
                }, buildNoResults()),
                '<!-- /ko -->',

                // Handle case of no active search. We don't want to confuse the user
                // by indicating that nothing was found.
                '<!-- ko case: "none" -->',
                div({
                    style: {
                        padding: '12px',
                        backgroundColor: 'silver',
                        textAlign: 'center'
                    }
                }, buildNoActiveSearch()), // buildNoActiveSearch()),
                '<!-- /ko -->',

                // Handle case of a search being processed - "inprogress"

                '<!-- ko case: $default -->',

                div({
                    style: {
                        flex: '1 1 0px',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                    }
                }, [
                    buildLoading(),
                    '<!-- ko if: $component.rows().length > 0 -->',
                    buildResultsRows(),
                    '<!-- /ko -->',
                ]),

                '<!-- /ko -->',

                '<!-- /ko -->'
            ])
        ]);
    }

    function component() {
        return {
            viewModel: {
                createViewModel: viewModel
            },
            template: template()
        };
    }

    return component;
});