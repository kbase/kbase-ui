define([
    'preact',
    'htm',

    // for effect
    'bootstrap'
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
            `
        }

        renderIcon(button) {
            switch (button.icon) {
                case 'public-search':
                    return this.renderPublicSearchIcon()
                default:
                    return html`
                      <div className=${"fa fa-3x fa-" + button.icon}></div>
                    `
            }
        }

        renderBadge() {

        }

        renderButton(button) {
            const activeClass = this.props.active ? "-active" : "";
            return html`
                <a className=${"SidebarMenu-button" + activeClass}}
                   data-k-b-testhook-element="menu-item"
                   data-k-b-testhook-button=${button.id}
                   onClick=${() => {this.onNavClick(button.path)}}>
                   ${this.renderIcon(button)}
                   <div>${button.label}</div>
                   ${this.renderBadge(button)}
                </a>
            `;
        }

        render() {
            const buttons = this.props.buttons.map((button) => {
                return this.renderButton(button);
            })
            return html`
                <div>
                    ${buttons}
                </div>
            `;
        }
    }

    return SidebarMenu
}