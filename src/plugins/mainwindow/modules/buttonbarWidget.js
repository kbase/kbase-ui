define([
    'kb_lib/html',
    'kb_lib/domEvents'
], function (
    html,
    domEvents
) {
    'use strict';

    const t = html.tag,
        div = t('div'),
        span = t('span'),
        button = t('button'),
        a = t('a');

    class ButtonBarWidget {
        constructor(config) {
            this.runtime = config.runtime;

            this.hostNode = null;
            this.container = null;
            this.buttonList = [];
            this.buttonMap = {};
            this.listeners = [];
        }

        clearButtons() {
            // remove the button definitions
            this.buttonList = [];
            this.buttonMap = {};
            this.render();
        }

        addButton(buttonDef) {
            buttonDef.type = 'button';
            if (buttonDef.external) {
                buttonDef.target = '_blank';
            }
            if (buttonDef.place === 'end') {
                this.buttonList.push(buttonDef);
                if (buttonDef.name) {
                    this.buttonMap[buttonDef.name] = buttonDef;
                }
            } else {
                this.buttonList.unshift(buttonDef);
                if (buttonDef.name) {
                    this.buttonMap[buttonDef.name] = buttonDef;
                }
            }
            this.render();
        }

        buildButton(events, buttonDef) {
            const labelStyle = {};

            let label;

            if (buttonDef.label) {
                label = div({class: 'kb-nav-btn-txt'}, buttonDef.label);
            } else {
                label = '';
                labelStyle.fontSize = '150%';
            }

            const buttonAttribs = {
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

            // a button with an event handler provided as "callback"
            const event = new domEvents.DOMEvent({
                type: 'click',
                handler:  (e) => {
                    e.preventDefault();
                    try {
                        buttonDef.callback();
                    } catch (ex) {
                        console.error('Error running button callback');
                        console.error(ex);
                        console.error(buttonDef);
                    }
                }
            });
            buttonAttribs.id = events.addEvent(event);
            return button(buttonAttribs, [
                div({
                    class: 'fa fa-' + buttonDef.icon,
                    style: labelStyle
                }),
                label
            ]);
        }

        render() {
            const events = new domEvents.DOMEvents({node: this.container});
            this.container.innerHTML = span({
                class: 'navbar-buttons kb-widget-buttonbar btn-toolbar'
            }, this.buttonList.map((buttonDef) => {
                switch (buttonDef.type) {
                case 'button':
                    return this.buildButton(events, buttonDef);
                    // disable for now -- not used, the current code couldn't work!
                    // case 'dropdown':
                    //     return renderDropdown(w, buttonDef).content;
                }
            }));
            // don't worry about removing events for now...
            events.attachEvents();
        }

        enableButton(w, id) {
            const button = this.buttonMap[id];
            if (!button) {
                return;
            }
            button.disabled = false;
            button.node.setAttribute('disabled', false);
        }

        disableButton(w, id) {
            const button = this.buttonMap[id];
            if (!button) {
                return;
            }
            button.disabled = true;
            button.node.setAttribute('disabled', true);
        }

        on(channel, event, handler) {
            this.listeners.push(this.runtime.receive(channel, event, handler));
        }

        offAll() {
            this.listeners.forEach((listener) => {
                this.runtime.drop(listener);
            });
            this.listeners = [];
        }

        // LIFECYCLE API

        attach(node) {
            this.hostNode = node;
            this.container = this.hostNode.appendChild(document.createElement('div'));
        }

        start() {
            this.on('ui', 'addButton', (data) => {
                this.addButton(data);
            });
            this.on('ui', 'clearButtons', () => {
                this.clearButtons();
            });
            this.on('ui', 'enableButton', ({name}) => {
                this.enableButton(name);
            });
            this.on('ui', 'disableButton', ({name}) => {
                this.disableButton(name);
            });
            // this.receive('ui', 'addDropdown', function (data) {
            //     addDropdown(widget, data);
            // });
        }

        stop() {
            this.clearButtons();
            this.offAll();
        }

        detach() {
            if (this.hostNode && this.container) {
                this.hostNode.removechild(this.container);
            }
        }
    }
    return {Widget: ButtonBarWidget};
});