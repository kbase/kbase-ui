/*global define */
/*jslint white: true, browser: true */
define([
    'kb_widgetBases_standardWidget',
    'kb_common_html'
],
    function (standardWidgetFactory, html) {
        'use strict';
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
                var buttons = w.get('buttons');
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
                var label,
                    button, buttonAttribs = {}, labelStyle = {},
                    div = html.tag('div'),
                    a = html.tag('a'),
                    button = html.tag('button'),
                    id = html.genId(),
                    events = [];

                if (buttonDef.label) {
                    label = div({class: 'kb-nav-btn-txt'}, buttonDef.label);
                } else {
                    label = '';
                    labelStyle.fontSize = '150%';
                }

                if (buttonDef.url) {
                    // a link style button
                    buttonAttribs = {
                        dataButton: buttonDef.name,
                        disabled: buttonDef.disabled,
                        class: ['btn', 'btn-' + (buttonDef.style || 'default'), 'navbar-btn', 'kb-nav-btn'].join(' '),
                        href: buttonDef.url
                    };
                    if (buttonDef.target) {
                        buttonAttribs.target = buttonDef.target;
                    }
                    button = a(buttonAttribs, [
                        div({class: 'fa fa-' + buttonDef.icon, style: labelStyle}),
                        label
                    ]);

                } else {
                    buttonAttribs = {
                        dataButton: buttonDef.name,
                        id: w.addDomEvent('click', function (e) {
                            e.preventDefault();
                            try {
                                buttonDef.callback();
                            } catch (ex) {
                                console.error('Error running button callback');
                                console.error(ex);
                                console.error(buttonDef);
                            }
                        }),
                        disabled: buttonDef.disabled,
                        class: ['btn', 'btn-' + (buttonDef.style || 'default'), 'navbar-btn', 'kb-nav-btn'].join(' ')
                    };
                    button = button(buttonAttribs, [
                        div({class: 'fa fa-' + buttonDef.icon, style: labelStyle}),
                        label
                    ]);
                }
                return {
                    content: button,
                    events: events
                };
            }

            function renderButtonBar(w) {
                var span = html.tag('span'),
                    content = span({class: 'navbar-buttons'}, [
                        w.get('buttons').list.map(function (buttonDef) {
                            return renderButton(w, buttonDef).content;
                        }).join('')
                    ]);
                return content;
            }

            function enableButton(w, id) {
                var buttons = w.get('buttons');
                if (buttons.map[id]) {
                    buttons.map[id].disabled = false;
                }
                console.log(buttons);
                w.set('buttons', buttons);
            }

            function disableButton(w, id) {
                var buttons = w.get('buttons');
                if (buttons.map[id]) {
                    buttons.map[id].disabled = true;
                }
                w.set('buttons', buttons);
            }

//            function findButton(name) {
//                return this.container.find('.navbar-buttons [data-button="' + name + '"]');
//            }
//            function addDropdown(cfg) {
//                // var button = $('<button type="button" class="btn btn-' + cfg.style + ' dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' + cfg.label + ' <span class="caret"></span></button>');
//                var iconStyle = '';
//                var label = '';
//                if (cfg.label) {
//                    label = '<div class="kb-nav-btn-txt">' + cfg.label + ' <span class="caret"></span></div>';
//                } else {
//                    label = cfg.label + ' <span class="caret"></span>';
//                    iconStyle += 'font-size: 150%;';
//                }
//                var button = $('<button  class="btn btn-' + (cfg.style || 'default') + ' navbar-btn kb-nav-btn dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
//                    '  <div class="fa fa-' + cfg.icon + '" style="' + iconStyle + '"></div>' + label + '</button>');
//                if (cfg.disabled) {
//                    button.prop('disabled', true);
//                }
//
//                var menu = $('<ul class="dropdown-menu" role="menu"></ul>');
//                if (cfg.items) {
//                    for (var i = 0; i < cfg.items.length; i++) {
//                        var item = cfg.items[i];
//                        if (item.type === 'divider') {
//                            menu.append('<li class="divider"></li>');
//                        } else {
//                            var menuItem = $('<li></li>');
//
//                            if (item.url) {
//                                var link = $('<a></a>')
//                                    .attr('href', item.url)
//                                    .attr('data-menu-item', item.name);
//                            } else if (item.callback) {
//                                var link = $('<a></a>')
//                                    .attr('href', '#')
//                                    .attr('data-menu-item', item.name)
//                                    .on('click', item.callback);
//                            }
//                            if (item.external) {
//                                link.attr('target', '_blank');
//                            }
//
//                            var icon = $('<div class="navbar-icon" style=""></div>');
//                            if (item.icon) {
//                                icon.append($('<span class="fa fa-' + item.icon + '"  class="navbar-icon"></span>'));
//                            }
//
//                            menu.append(menuItem.append(link.append(icon).append(item.label)));
//                        }
//                    }
//                }
//                var dropdown = $('<div class="dropdown" style="display: inline-block;"></div>').append(button).append(menu);
//                if (cfg.place === 'end') {
//                    this.container.find('.navbar-buttons').append(dropdown);
//                } else {
//                    this.container.find('.navbar-buttons').prepend(dropdown);
//                }
//                if (cfg.widget) {
//                    var widgetName = cfg.widget;
//                    var panel = $('<div>');
//                    menu.append($('<li></li>').append(panel));
//                    var widget = panel[widgetName]({dropdown: dropdown, navbar: this, params: cfg.params});
//                }
//                return this;
//            }

            return standardWidgetFactory.make({
                runtime: config.runtime,
                on: {
                    init: function (w) {
                        console.log('INIT');
                        w.set('buttons', {
                           list: [],
                           map: {}
                        });
                    },
                    start: function (w) {
                        // Listen for a setTitle message sent to the ui.
                        // We use the widget convenience function in order to 
                        // get automatic event listener cleanup. We could almost
                        // as easily do this ourselves.
//                        w.recv('title', 'set', function (data) {
//                            w.setHtml(render(data));
//                        });
                        w.recv('ui', 'addButton', function (data) {
                            addButton(w, data);
                        });
                        w.recv('ui', 'clearButtons', function () {
                            clearButtons(w);
                        });
                        w.recv('ui', 'enableButton', function (data) {
                            enableButton(w, data.name);
                        });
                        w.recv('ui', 'disableButton', function (data) {
                            disableButton(w, data.name);
                        });

                    },
                    render: function (w) {
                        return renderButtonBar(w);
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