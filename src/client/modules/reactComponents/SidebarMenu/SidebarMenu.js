define([
    'preact',
    'htm',
    'jquery',

    // for effect
    'bootstrap',
    'css!./SidebarMenu.css'
], (
    preact,
    htm, 
    $
) => {

    const {h, Component, createRef} = preact;
    const html = htm.bind(h);

    class SidebarMenu extends Component {
        constructor(props) {
            super(props);

            props.runtime.db().subscribe(
                {
                    path: 'feeds'
                },
                (feeds) => {
                    this.processFeeds(feeds);
                }
            );

            this.ref = createRef();

            this.state = {
                feedsNotificationCount: null,
                feedsError: null
            };
        }

        componentDidMount() {
            const feeds = this.props.runtime.db().get('feeds');
            this.processFeeds(feeds);
            $(this.ref.current).tooltip({selector: '[data-toggle="tooltip"]'});
        }

        processFeeds(feeds) {
            if (feeds.error) {
                // this.notificationError(feeds.error);
                console.error('Feeds Error', feeds.error);
                return;
            }
            // this.notificationError(null);
            this.setState({
                feedsNotificationCount: feeds.unseenNotificationsCount,
                feedsError: feeds.error
            });
        }

        onNavClick(path) {
            const oldHref = window.location.href;
            window.location.href = '/#' + path;
            if (oldHref === window.location.href) {
                window.dispatchEvent(new HashChangeEvent('hashchange'));
            }
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
            const style = {
                position: 'absolute',
                top: '0',
                right: '0',
                color: 'rgb(193, 119, 54)',
                textAlign: 'center',
                fontWeight: 'bold',
                fontStyle: 'italic'
            };
            return html`
                <div style=${style}>
                    beta
                </div>
            `;
        }

        renderBadge(menuItem) {
            if (menuItem.id !== 'feeds') {
                return;
            }
            const notificationCount = this.state.feedsNotificationCount;
            const notificationError = this.state.feedsError;
            let content;
            if (notificationCount > 0) {
                content = html`
                    <span>
                        ${notificationCount}
                    </span>
                `;
            } else if (notificationError) {
                content = html`
                    <span className="fa fa-ban"></span>
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

        renderButton(menuItem) {
            const activeClass = menuItem.isActive ? ' -active' : '';
            console.warn('menu item', menuItem);
            return html`
                <a className=${'SidebarMenu -button' + activeClass}
                   data-k-b-testhook-element="menu-item"
                   data-k-b-testhook-button=${menuItem.id}
                   data-toggle="tooltip" 
                   data-placement="right"
                   title=${menuItem.tooltip || ''}
                   onClick=${() => {this.onNavClick(menuItem.path);}}>
                   ${this.renderIcon(menuItem)}
                   <div>${menuItem.label}</div>
                   ${this.renderBeta(menuItem)}
                   ${this.renderBadge(menuItem)}
                </a>
            `;
        }

        render() {
            const buttons = this.props.menu.map((menuItem) => {
                return this.renderButton(menuItem);
            });
            return html`
                <div ref=${this.ref}>
                    ${buttons}
                </div>
            `;
        }
    }

    return SidebarMenu;
});