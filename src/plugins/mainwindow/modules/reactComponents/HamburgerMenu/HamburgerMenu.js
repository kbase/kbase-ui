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

    class HamburgerMenu extends Component {
        constructor(props) {
            super(props);
        }

        renderSection(menuItems) {
            return menuItems.map((menuItem) => {
                let icon = null;
                if (menuItem.icon) {
                    icon = html`
                        <div className="navbar-icon">
                            <span className=${`fa fa-${menuItem.icon}`}></span>
                        </div>
                    `;
                }
                return html`
                    <li>
                        <a href=${menuItem.uri ? menuItem.uri : '/#' + menuItem.path}
                           target=${menuItem.newWindow ? '_blank' : null}>
                            ${icon}
                            <span>${menuItem.label}</span>
                        </a>
                    </li>
                `;
            });
        }

        renderSectionWithDivider(menuItems) {
            if (menuItems.length === 0) {
                return null;
            }
            return html`
                <li role="presentation"
                    className="divider"></li>
                ${this.renderSection(menuItems)}
            `;
        }

        renderSections() {
            return this.props.menu.section.map((section) => {
                return this.renderSection(section);
            });
        }

        render() {
            return html`
                <div className="navbar HamburgerMenu">
                    <button id="kb-nav-menu"
                            className="btn btn-default navbar-btn kb-nav-btn"
                            data-toggle="dropdown"
                            aria-haspopup="true">
                        <span className="fa fa-navicon"></>
                    </button>
                    <ul className="dropdown-menu"
                        role="menu"
                        aria-labeledby="kb-nav-menu">
                        ${this.renderSection(this.props.menu.main)}
                        ${this.renderSectionWithDivider(this.props.menu.developer)}
                        ${this.renderSectionWithDivider(this.props.menu.help)}
                        </ul>
                    
                </div>
            `;
        }
    }

    return HamburgerMenu;
});