define([
    'kb_common/html',
    'kb_knockout/registry',
    'kb_knockout/lib/generators'
], function (
    html,
    reg,
    gen
) {
    'use strict';

    class ViewModel {
        constructor(params) {
            this.alertCount = params.alertCount;
            this.hideAlerts = params.hideAlerts;
        }

        toggle() {
            this.hideAlerts(!this.hideAlerts());
        }

        close() {
            this.hideAlerts(false);
        }
    }

    const styles = html.makeStyles({

    });

    const t  = html.tag,
        div = t('div'),
        span = t('span');

    function buildButton() {
        return div({
            style: {
                border: '1px silver solid',
                padding: '3px',
                margin: '2px'
            }
        }, [
            div({
                style: {
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                    // fontWeight: 'bold',
                }
            }, [
                span({
                    style: {
                        fontWeight: 'bold'
                    },
                    dataBind: {
                        text: 'alertCount'
                    }
                }),
                ' ',
                gen.plural('alertCount()', 'alert', 'alerts')
            ]),
            gen.if('alertCount() > 0',
                div({
                    style: {
                        textAlign: 'center',
                        cursor: 'pointer'
                    },
                    dataBind: {
                        click: 'function(d,e){$component.toggle.call($component,d,e);}'
                    }
                }, span({
                    class: ['fa', 'fa-2x', 'fa-' + 'exclamation-triangle', 'fa-color-warning']
                })),
                div({
                    style: {
                        textAlign: 'center',
                        cursor: 'pointer'
                    },
                    dataBind: {
                        click: 'function(d,e){$component.close.call($component,d,e);}'
                    }
                }, span({
                    class: ['fa', 'fa-2x', 'fa-' + 'thumbs-up', 'fa-color-success']
                })))
        ]);
    }

    function template() {
        return div(gen.if('hideAlerts', buildButton(), ''));
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template(),
            stylesheet: styles.sheet
        };
    }

    return reg.registerComponent(component);
});