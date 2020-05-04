define([
    'preact',
    'htm',

    // for effect
    'bootstrap',
    './SidebarMenu.css'
], (
    preact,
    htm
) => {
    'use strict';

    const { h, Component } = preact;
    const html = htm.bind(h);

    class SidebarMenu extends Component {
        constructor(props) {
            super(props);
        }

        onNavClick(path) {
            console.log('clicked!', path);
        }

        renderPublicSearchIcon() {
            return html`
                <div className="fa-stack fa-2x"
                     style=${{marginBotom: '-12px'}}
                     ariaHidden="true">
                     <div className="fa fa-stack-2x fa-search"
                          style=${{fontSize: '1.6em'}}>

                    </div>
                    <div className="fa fa-stack-1x fa-globe"
                        style=${{fontSize: '85%',
        top: '-7px',
        left: '-3px'}}>
                    </div>
                </div>
            `;
        }

        renderIcon(button) {
            switch (button.icon) {
            case 'public-search':
                return this.renderPublicSearchIcon();
            default:
                return html`
                      <div className=${'fa fa-3x fa-' + button.icon}></div>
                    `;
            }
        }

        renderBeta(button) {
            if (!button.beta) {
                return;
            }
            return html`
                <div style=${{
        position: 'absolute',
        top: '0',
        right: '0',
        color: 'rgb(193, 119, 54)',
        textAlign: 'center',
        fontWeight: 'bold',
        fontStyle: 'italic'
    }}>
                    beta
                </div>
            `;
        }

        renderBadge(button) {
            if (!button.id !== 'feeds') {
                return;
            }
            const notificationCount = 1;
            const notificationError = false;
            let content;
            if (notificationCount > 0) {
                content = html`
                    <span>
                        ${notificationCount}
                    </span>
                `;
            } else if (notificationError) {
                content = html`
                    <span className="fa fa-ban"
                `;
            } else {
                return;
            }

            return html`
                <div style=${{
        position: 'absolute',
        top: '0',
        right: '0'
    }}>
                    <div style=${{
        padding: '4px',
        color: 'white',
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        textAlign: 'center',
        fontWeight: 'bold',
        fontStyle: 'italic',
        borderRadius: '3px'
    }}>
                    ${content}
                    </div>
                </div>
            `;
        }

        renderButton(button) {
            const activeClass = this.props.active ? '-active' : '';
            return html`
                <a className=${'SidebarMenu-button' + activeClass}}
                   data-k-b-testhook-element="menu-item"
                   data-k-b-testhook-button=${button.id}
                   onClick=${() => {this.onNavClick(button.path);}}>
                   ${this.renderIcon(button)}
                   <div>${button.label}</div>
                   ${this.renderBeta(button)}
                   ${this.renderBadge(button)}
                </a>
            `;
        }

        render() {
            const buttons = this.props.buttons.map((button) => {
                return this.renderButton(button);
            });
            return html`
                <div>
                    ${buttons}
                </div>
            `;
        }
    }

    return SidebarMenu;
});