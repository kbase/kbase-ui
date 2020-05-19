define([
    'preact',
    'htm',
    './reactComponents/MainWindow/view',
    'kb_plugin_mainWindow',
    'css!./Main.css'
], function (
    preact,
    htm,
    MainWindow,
    Plugin
) {
    'use strict';

    const {h, render} = preact;
    const html = htm.bind(h);


    class Main {
        constructor({ runtime }) {
            this.runtime = runtime;
            this.hostNode = null;
            this.container = null;
        }

        render() {
            const props = {
                runtime:this.runtime,
                plugin: Plugin.plugin
            };
            const content = html`
                <${MainWindow} ...${props} />
            `;
            render(content, this.container);
        }

        attach(node) {
            this.hostNode = node;
            this.container = this.hostNode.appendChild(document.createElement('div'));
            this.container.classList.add('plugin-mainwindow', 'widget-mainwindow', '-main');
            this.container.setAttribute('data-k-b-testhook-plugin', 'mainwindow');

            this.render();
        }

        start() {
            return null;
        }

        stop() {
            return null;
        }

        detach() {
            if (this.container) {
                this.container = '';
                if (this.container.parentNode) {
                    this.container.parentNode.removeChild(this.container);
                }
            }
        }
    }

    return Main;
});
