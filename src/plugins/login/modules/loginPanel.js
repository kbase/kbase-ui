define(['preact', 'bluebird', 'kb_lib/html', '../components/tokenStuffer'], function (
    Preact,
    Promise,
    html,
    TokenStuffer
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        p = t('p'),
        h2 = t('h2');

    class LoginPanel {
        constructor({ runtime }) {
            this.runtime = runtime;

            this.hostNode = null;
            this.container = null;
        }

        buildLayout() {
            const id = html.genId();
            const layout = div([
                h2('Sign In to KBase'),
                p('Enter Token Here'),
                div({
                    id: id
                })
            ]);
            return [id, layout];
        }

        attach(node) {
            this.hostNode = node;
            this.container = this.hostNode.appendChild(document.createElement('div'));
            const [id, layout] = this.buildLayout();
            this.container.innerHTML = layout;
            Preact.render(Preact.h(TokenStuffer, null), document.getElementById(id));
        }

        start() {
            this.runtime.send('ui', 'setTitle', 'Sign In to KBase');
        }

        stop() {
            return null;
        }

        detach() {
            if (this.hostNode && this.container) {
                this.hostNode.removeChild(this.container);
            }
        }
    }

    return { Widget: LoginPanel };
});
