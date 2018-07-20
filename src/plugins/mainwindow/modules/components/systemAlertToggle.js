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
            this.alertSummary = params.alertSummary;
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
        button: {
            css: {
                border: '1px silver solid',
                padding: '3px',
                margin: '2px',
                cursor: 'pointer'
            },
            pseudo: {
                hover: {
                    backgroundColor: 'rgba(200,200,200,0.5)'
                }
            }
        }
    });

    const t  = html.tag,
        div = t('div'),
        span = t('span');

    function buildButton() {
        return div({
            class: styles.classes.button,
            dataBind: {
                click: 'function(d,e){$component.toggle.call($component,d,e);}'
            }
        }, [
            div({
                style: {
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                }
            }, [
                gen.if('alertCount() > 0',
                    span({
                        style: {
                            fontWeight: 'bold'
                        },
                        dataBind: {
                            text: 'alertCount'
                        }
                    }),
                    'no'),
                ' ',
                gen.plural('alertCount()', 'alert', 'alerts')
            ]),
            gen.if('alertCount() > 0',
                gen.if('alertSummary()',
                    [
                        gen.if('alertSummary().present > 0',
                            div({
                                style: {
                                    textAlign: 'center'
                                }
                            }, span({
                                class: ['fa', 'fa-2x', 'fa-' + 'exclamation-triangle', 'fa-color-danger']
                            })),
                            gen.if('alertSummary().future > 0',
                                div({
                                    style: {
                                        textAlign: 'center',
                                        cursor: 'pointer'
                                    },
                                    dataBind: {
                                        click: 'function(d,e){$component.toggle.call($component,d,e);}'
                                    }
                                }, span({
                                    class: ['fa', 'fa-2x', 'fa-' + 'clock-o', 'fa-color-warning']
                                }))))
                    ]),
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