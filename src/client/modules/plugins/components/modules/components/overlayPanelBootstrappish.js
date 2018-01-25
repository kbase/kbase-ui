/*
overlayPanel
A generic full-height translucent panel which overlays the entire page to about 75% of the width.
It is a container component, and expects to be passed a component to render and a viewmodel
to pass along.
it offers a close function for the sub-component to use, in addition to invoking close
from a built-in close button (?)
*/
define([
    'knockout-plus',
    'kb_common/html',
    '../nanoBus',
], function (
    ko,
    html,
    NanoBus
) {
    'use strict';

    var t = html.tag,        
        span = t('span'),
        div = t('div');

    function viewModel(params) {
        var showPanel = ko.observable();

        var bus = NanoBus.make();

        var openMessage = null;
        bus.on('close', function (message) {
            if (message && message.open) {
                openMessage = message.open;
                showPanel(false);
            } else {
                showPanel(false);                
            }
        });
        bus.on('clear', function () {
            component(null);
            embeddedComponentName(null);
        });

        bus.on('open', function(message) {
            if (showPanel()) {
                bus.send('close', {open: message});
                return;
            } 

            showPanel(true);
            embeddedComponentName(message.name);
            
            embeddedParams('{' + Object.keys(message.params || {}).map(function (key) {
                return key + ':' + message.params[key];
            }).join(', ') + '}');

            var newVm = Object.keys(message.viewModel).reduce(function (accum, key) {
                accum[key] = message.viewModel[key];
                return accum;
            }, {});
            newVm.onClose = doClose;
            embeddedViewModel(newVm);        
        });

        function doClose() {
            bus.send('close');
        }

        var panelStyle = ko.pureComputed(function() {
            if (showPanel() === undefined) {
                // the initial state;
                return;
            }
            if (showPanel()) {
                return styles.classes.panelin;
            } else {
                return styles.classes.panelout;
            }
        });

        // var type = ko.observable(params.type || 'info');

        var typeBackgroundColor = ko.pureComputed(function() {
            if (!params.component()) {
                return;
            }
            switch (params.component().type) {                     
            case 'error':
                return 'rgba(145, 91, 91, 0.8)';
            case 'info':
            default:
                // return 'rgba(0, 0, 0, 0.8)';
                return 'rgba(64, 89, 140, 0.8)';       
            }            
        });

        var embeddedComponentName = ko.observable();
        var embeddedParams = ko.observable();
        var embeddedViewModel = ko.observable({});
        
        embeddedParams.onClose = 'doClose';

        // The viewmodel for the embedded component

        params.component.subscribe(function (newValue) {
            if (newValue) {
                bus.send('open', newValue);                
            } else {
                if (showPanel()) {
                    bus.send('close');
                    // showPanel(false);
                    // embeddedComponentName(null);
                    // embeddedParams(null);
                    // embeddedViewModel(null);
                }
            }
        });

        function onPanelAnimationEnd(data, ev) {
            if (ev.target.classList.contains(styles.classes.panelout)) {
                bus.send('clear');
                // HACK ALERT: since we are using knockout event listener, set 
                // persistently on the node, we don't have any context for this
                // animation end ... so if this was a close with open, the
                // open message will have been set ...
                if (openMessage) {
                    bus.send('open', openMessage);
                    openMessage = null;
                }
            }
        }

        return {
            showPanel: showPanel,
            panelStyle: panelStyle,
            typeBackgroundColor: typeBackgroundColor,
            doClose: doClose,
            component: params.component,

            embeddedComponentName: embeddedComponentName,
            embeddedParams: embeddedParams,
            embeddedViewModel: embeddedViewModel,

            onPanelAnimationEnd: onPanelAnimationEnd
        };
    }

    var styles = html.makeStyles({
        classes: {
            container: {
                css: {
                    position: 'absolute',
                    top: '0',
                    // left: '0',
                    left: '-100%',
                    bottom: '0',
                    right: '0',
                    width: '100%',
                    zIndex: '3',
                    backgroundColor: 'rgba(0,0,0,0.6)'
                }
            },
            panel: {
                css: {
                    position: 'absolute',
                    top: '0',
                    // left: '0',
                    left: '12.5%',
                    bottom: '0',
                    width: '75%',
                    zIndex: '3'
                }
            },
            panelBody: {
                css: {
                    position: 'absolute',
                    top: '30px',
                    left: '0',
                    bottom: '30px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }
            },
            panelButton: {
                css: {
                    position: 'absolute',
                    top: '38px',
                    right: '8px',
                    color: 'rgba(150,150,150,1)',
                    cursor: 'pointer',
                    // border: '2px transparent solid',
                    zIndex: '4'
                },
                pseudo: {
                    hover: {
                        // border: '2px rgba(255, 84, 84,0.5) solid',
                        color: 'rgba(75,75,75,1)'
                    },
                    active: {
                        // border: '2px rgba(255, 84, 84,0.5) solid',
                        // backgroundColor: 'rgba(75,75,75,1)',
                        color: 'rgba(0,0,0,1)'
                    }
                }
            },
            panelin: {
                css: {
                    animationDuration: '0.5s',
                    animationName: 'slidein',
                    animationIterationCount: '1',
                    animationDirection: 'normal',
                    left: '0'
                }
            },
            panelout: {
                css: {
                    animationDuration: '0.5s',
                    animationName: 'slideout',
                    animationIterationCount: '1',
                    animationDirection: 'normal',
                    left: '-100%'
                }
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
        }, 
        rules: {
            keyframes: {
                slidein: {
                    from: {
                        left: '-100%'
                    },
                    to: {
                        left: '0'
                    }
                },
                slideout: {
                    from: {
                        left: '0'
                    },
                    to: {
                        left: '-100%'
                    }
                }
            }
        }
    });

    function template() {
        return div({
            dataBind: {
                css: 'panelStyle',
                event: {
                    animationend: 'onPanelAnimationEnd'
                }
            },
            class: styles.classes.container
        }, div({
            // dataBind: {
            //     style: {
            //         'background-color': 'typeBackgroundColor'
            //     }
            // },
            class: styles.classes.panel
        }, [
            styles.sheet,
            div({
                dataBind: {
                    click: 'doClose'
                },
                class: styles.classes.panelButton
            }, span({class: 'fa fa-times'})),
            div({
                class: styles.classes.panelBody
            }, [
                '<!-- ko if: embeddedComponentName() -->',
                '<!-- ko with: embeddedViewModel() -->',                
                div({
                    dataBind: {
                        component: {
                            name: '$component.embeddedComponentName',
                            params: '$data',
                        }
                    },
                    style: {
                        flex: '1 1 0px',
                        display: 'flex',
                        flexDirection: 'column'
                    }
                }),
                '<!-- /ko -->',
                '<!-- /ko -->'
            ])
        ]));
    }

    function component() {
        return {
            viewModel: viewModel,
            template: template()
        };
    }

    return component;
});
