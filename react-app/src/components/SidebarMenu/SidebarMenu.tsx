import {Component, createRef} from 'react';
// import { FeedsNotification } from '../../services/feeds';
import {MenuItem, MenuItemExternal, MenuItemInternal} from '../../types/menu';
import {Nav} from 'react-bootstrap';
import './SidebarMenu.css';

export interface SidebarMenuProps {
    menu: Array<MenuItem>;
    path: string;
    // feedStatus: FeedsNotification;
}

interface SidebarMenuState {
    activeKey: string | null;
}

export interface MenuButton {
    icon: string;
    beta: boolean;
}

export default class SidebarMenu extends Component<SidebarMenuProps,
    SidebarMenuState> {
    ref: React.RefObject<HTMLDivElement>;

    constructor(props: SidebarMenuProps) {
        super(props);

        // props.runtime.db().subscribe(
        //     {
        //         path: 'feeds',
        //     },
        //     (feeds: unknown) => {
        //         this.processFeeds(feeds as FeedsNotification);
        //     }
        // );

        this.ref = createRef<HTMLDivElement>();

        this.state = {
            activeKey: null,
        };

        // this.state = {
        //     feedsNotificationCount: null,
        //     feedsError: null,
        // };
    }

    componentDidMount() {
        this.updateActiveKey();
        // const feeds = this.props.runtime.db().get('feeds', null);
        // this.processFeeds(feeds);
        // (this.ref.current).tooltip({ selector: '[data-toggle="tooltip"]' });
        window.addEventListener("hashchange", this.onHashChange.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener("hashchange", this.onHashChange.bind(this));
    }

    onHashChange() {
        this.updateActiveKey();
    }

    updateActiveKey() {
        this.setState({
            activeKey: this.getActiveKey(),
        });
    }

    // processFeeds(feeds: FeedsNotification) {
    //     this.setState({
    //         feedsNotificationCount: feeds.unseenNotificationsCount || null,
    //         feedsError: feeds.error || null,
    //     });
    // }

    onNavClick(path?: string) {
        const oldHref = window.location.href;
        window.location.href = '/#' + path;
        if (oldHref === window.location.href) {
            window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
    }

    renderIcon(button: MenuItem) {
        return <div className={'fa fa-3x fa-' + button.icon}/>;
    }

    // renderBadge(menuItem: MenuItemInternal) {
    //     if (menuItem.name !== 'feeds') {
    //         return;
    //     }
    //     const notificationCount =
    //         this.props.feedStatus.unseenNotificationsCount;
    //     const notificationError = this.props.feedStatus.error;
    //     let content;
    //     if (notificationCount) {
    //         content = <span> {notificationCount} </span>;
    //     } else if (notificationError) {
    //         content = <span className="fa fa-ban"></span>;
    //     } else {
    //         return;
    //     }

    //     return (
    //         <div
    //             style={{
    //                 position: 'absolute',
    //                 top: '0',
    //                 right: '0',
    //             }}
    //         >
    //             <div
    //                 style={{
    //                     padding: '4px',
    //                     color: 'white',
    //                     backgroundColor: 'rgba(255, 0, 0, 0.8)',
    //                     textAlign: 'center',
    //                     fontWeight: 'bold',
    //                     fontStyle: 'italic',
    //                     borderRadius: '3px',
    //                 }}
    //             >
    //                 ${content}
    //             </div>
    //         </div>
    //     );
    // }

    renderButton(menuItem: MenuItemInternal) {
        return (
            <button
                className="SidebarMenu -button"
                data-k-b-testhook-element="menu-item"
                data-k-b-testhook-button={menuItem.name}
                data-toggle="tooltip"
                data-placement="right"
                title={menuItem.tooltip || ''}
                key={menuItem.name}
                onClick={() => {
                    this.onNavClick(menuItem.path);
                }}
            >
                {this.renderIcon(menuItem)}
                <div>{menuItem.label}</div>
                {/* {this.renderBadge(menuItem)} */}
            </button>
        );
    }

    renderInternalItem(menuItem: MenuItemInternal) {
        return (
            <Nav.Item key={menuItem.name}>
                <Nav.Link eventKey={menuItem.name}>
                    {this.renderIcon(menuItem)}
                    <div>{menuItem.label}</div>
                </Nav.Link>
            </Nav.Item>
        );
    }

    renderExternalItem(menuItem: MenuItemExternal) {
        return (
            <Nav.Item key={menuItem.name}>
                <Nav.Link
                    eventKey={menuItem.name}
                    onSelect={() => {
                        if (menuItem.newWindow) {
                            window.open(menuItem.url, '_blank');
                        } else {
                            window.location.href = menuItem.url;
                        }
                        // this.onNavClick(menuItem.url);
                    }}
                >
                    {this.renderIcon(menuItem)}
                    <div>{menuItem.label}</div>
                </Nav.Link>
            </Nav.Item>
        );
    }

    renderMenu(): [Array<JSX.Element>, Map<string, () => void>] {
        const buttons: Array<JSX.Element> = [];
        const handlers: Map<string, () => void> = new Map();
        for (const item of this.props.menu) {
            if (item.type === 'internal') {
                buttons.push(this.renderInternalItem(item));
                handlers.set(item.name, () => {
                    this.onNavClick(item.path);
                });
            } else {
                buttons.push(this.renderExternalItem(item));
                handlers.set(item.name, () => {
                    if (item.newWindow) {
                        window.open(item.url, '_blank');
                    } else {
                        window.location.href = item.url;
                    }
                });
            }
        }
        return [buttons, handlers];
    }

    getActiveKey(): string | null {
        // Fetch the "path" in the hash
        const path = document.location.hash.substring(1).replace(/^\/+/, '');

        // Determine if the current menu item is a prefix for the current browser (hash) path.
        for (const item of this.props.menu) {
            if (item.type === 'internal') {
                if (path.startsWith(item.path)) {
                    return item.name;
                }
            }
        }
        return null;
    }

    render() {
        const [menu, handlers] = this.renderMenu();
        return (
            <Nav
                className="flex-column SidebarMenu"
                activeKey={this.state.activeKey || undefined}
                onSelect={(selectedKey: string | null) => {
                    if (selectedKey) {
                        const handler = handlers.get(selectedKey);
                        if (handler) {
                            handler();
                        }
                        this.updateActiveKey();
                    }
                }}
            >
                {menu}
            </Nav>
        );
    }
}
