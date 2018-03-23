define([
    'kb_widget/bases/simpleWidget',
    'kb_common/html'
], function (
    SimpleWidgetFactory, 
    html
) {
    'use strict';

    let t = html.tag,
        div = t('div'),
        span = t('span'),
        button = t('button'),
        a = t('a');

    function myWidget(config) {
        function clearButtons(w) {
            // remove the button definitions
            w.set('buttons', {
                list: [],
                map: {}
            });

            return this;
        }
        function addButton(w, buttonDef) {
            let buttons = w.get('buttons');
            buttonDef.type = 'button';
            if (buttonDef.external) {
                buttonDef.target = '_blank';
            }
            if (buttonDef.place === 'end') {
                buttons.list.push(buttonDef);
                if (buttonDef.name) {
                    buttons.map[buttonDef.name] = buttonDef;
                }
            } else {
                buttons.list.unshift(buttonDef);
                if (buttonDef.name) {
                    buttons.map[buttonDef.name] = buttonDef;
                }
            }
            w.set('buttons', buttons);
        }
        function renderButton(w, buttonDef) {
            let label,
                labelStyle = {},
                events = [];

            if (buttonDef.label) {
                label = div({class: 'kb-nav-btn-txt'}, buttonDef.label);
            } else {
                label = '';
                labelStyle.fontSize = '150%';
            }
                
            let buttonAttribs = {
                dataButton: buttonDef.name,
                disabled: buttonDef.disabled,
                class: ['btn', 'btn-' + (buttonDef.style || 'default'), 'navbar-btn', 'kb-nav-btn'].join(' ')
            };
            if (buttonDef.toggle) {
                buttonAttribs.dataToggle = 'button';
            }

            if (buttonDef.url) {
                // a link style button
                buttonAttribs.href = buttonDef.url;
                if (buttonDef.target) {
                    buttonAttribs.target = buttonDef.target;
                }
                return {
                    content: a(buttonAttribs, [
                        div({class: 'fa fa-' + buttonDef.icon, style: labelStyle}),
                        label
                    ]),
                    events: events
                };

            }
            buttonAttribs.id = w.addDomEvent('click', function (e) {
                e.preventDefault();
                try {
                    buttonDef.callback();
                } catch (ex) {
                    console.error('Error running button callback');
                    console.error(ex);
                    console.error(buttonDef);
                }
            });
            return {
                content: button(buttonAttribs, [
                    div({
                        class: 'fa fa-' + buttonDef.icon, 
                        style: labelStyle
                    }),
                    label
                ]),
                events: events
            };
        }

        function renderButtonBar(w) {
            let content = span({class: 'navbar-buttons kb-widget-buttonbar'}, [
                w.get('buttons').list.map(function (buttonDef) {
                    switch (buttonDef.type) {
                    case 'button':
                        return renderButton(w, buttonDef).content;
                        // disable for now -- not used, the current code couldn't work!
                        // case 'dropdown':
                        //     return renderDropdown(w, buttonDef).content;
                    }
                }).join('')
            ]);
            return content;
        }

        function enableButton(w, id) {
            let buttons = w.get('buttons');
            if (buttons.map[id]) {
                buttons.map[id].disabled = false;
            }
            w.set('buttons', buttons);
        }

        function disableButton(w, id) {
            let buttons = w.get('buttons');
            if (buttons.map[id]) {
                buttons.map[id].disabled = true;
            }
            w.set('buttons', buttons);
        }

        //            function findButton(name) {
        //                return this.container.find('.navbar-buttons [data-button="' + name + '"]');
        //            }
        // function addDropdown(w, buttonDef) {
        //     var buttons = w.get('buttons');
        //     buttonDef.type = 'dropdown';
        //     if (buttonDef.place === 'end') {
        //         buttons.list.push(buttonDef);
        //         if (buttonDef.name) {
        //             buttons.map[buttonDef.name] = buttonDef;
        //         }
        //     } else {
        //         buttons.list.unshift(buttonDef);
        //         if (buttonDef.name) {
        //             buttons.map[buttonDef.name] = buttonDef;
        //         }
        //     }
        //     w.set('buttons', buttons);
        // }
        // function renderMenuItem(w, itemDef) {
        //     var div = html.tag('div'),
        //         span = html.tag('span'),
        //         li = html.tag('li'),
        //         a = html.tag('a'),
        //         itemButton;
                
        //     if (itemDef.icon) {
        //         itemButton = li([
        //             div({class: 'navbar-icon'}, [
        //                 span({class: 'fa fa-' + itemDef.icon + ' navbar-icon'}),
        //                 itemDef.label
        //             ])
        //         ]);
        //     } else {
        //         itemButton = li([
        //             div({class: 'navbar-icon'}, [
        //                 itemDef.label
        //             ])
        //         ]);
        //     }
                
        //     if (itemDef.url) {
        //         // a link style button
        //         return a({
        //             dataMenuItem: itemDef.name,
        //             disabled: itemDef.disabled,
        //             href: itemDef.url,
        //             target: itemDef.target
        //         }, itemButton);
        //     } 
        //     return a({
        //         href: '#',
        //         dataMenuItem: itemDef.name,
        //         id: w.addDomEvent('click', function (e) {
        //             e.preventDefault();
        //             try {
        //                 itemDef.callback();
        //             } catch (ex) {
        //                 console.error('Error running menu item callback');
        //                 console.error(ex);
        //                 console.error(itemDef);
        //             }
        //         })
        //     }, itemButton);
        // }
        // function renderDropdown(w, buttonDef) {
        //     var label,
        //         labelStyle = {},
        //         div = html.tag('div'),
        //         button = html.tag('button'),
        //         span = html.tag('span');

        //     if (buttonDef.label) {
        //         label = div({class: 'kb-nav-btn-txt'}, [
        //             buttonDef.label,
        //             span({class: 'caret'})
        //         ]);
        //     } else {
        //         label = span({class: 'caret'});
        //         labelStyle.fontSize = '150%';
        //     }

        //     var btnClass = [
        //             'btn',
        //             'btn-' + (buttonDef.style || 'default'),
        //             'navbar-btn',
        //             'kb-nav-btn',
        //             'dropdown-toggle'
        //         ],
        //         btnAttribs = {
        //             class: btnClass.join(' '),
        //             dataToggle: 'dropdown',
        //             ariaExpanded: 'false'
        //         };
        //     if (buttonDef.disabled) {
        //         btnAttribs.disabled = true;
        //     }

        //     var menu = ul({class: 'dropdown-menu', role: 'menu'}, [
        //         buttonDef.items.map(function (item) {
        //             switch (item.type) {
        //             case 'divider':
        //                 return li({class: 'divider'});
        //             default:
        //                 return renderMenuItem(w, item);
        //             }
        //         })
        //     ]);
                
        //     var dropdown = div({class: 'dropdown', stlyle: {display: 'inline-block'}}, [
        //         button,
        //         menu
        //     ]);

        //     if (cfg.widget) {
        //         var widgetName = cfg.widget;
        //         var panel = $('<div>');
        //         menu.append($('<li></li>').append(panel));
        //         var widget = panel[widgetName]({dropdown: dropdown, navbar: this, params: cfg.params});
        //     }
        //     return this;
        // }

        return SimpleWidgetFactory.make({
            runtime: config.runtime,
            on: {
                init: function () {
                    this.set('buttons', {
                        list: [],
                        map: {}
                    });
                },
                start: function () {
                    let widget = this;
                    this.recv('ui', 'addButton', function (data) {
                        addButton(widget, data);
                    });
                    this.recv('ui', 'clearButtons', function () {
                        clearButtons(widget);
                    });
                    this.recv('ui', 'enableButton', function (data) {
                        enableButton(widget, data.name);
                    });
                    this.recv('ui', 'disableButton', function (data) {
                        disableButton(widget, data.name);
                    });
                    // this.recv('ui', 'addDropdown', function (data) {
                    //     addDropdown(widget, data);
                    // });

                },
                render: function () {
                    return renderButtonBar(this);
                }
            }
        });
    }

    return {
        make: function (config) {
            return myWidget(config);
        }
    };
});