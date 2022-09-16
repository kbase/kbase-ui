import { Component, createRef } from 'react';
import { MenuItem, MenuItemExternal, MenuItemInternal } from '../../types/menu';
import { Nav } from 'react-bootstrap';
import { changeHash2 } from '../../apps/Navigator/utils/navigation';
import './SidebarMenu.css';
import styles from './SidebarMenu.module.css';

export interface SidebarMenuProps {
    menu: Array<MenuItem>;
    path: string;
    showLabel?: boolean;
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

    hashListener: () => void;
    constructor(props: SidebarMenuProps) {
        super(props);

        this.ref = createRef<HTMLDivElement>();

        this.state = {
            activeKey: null,
        };
        this.hashListener = this.onHashChange.bind(this);
    }

    componentDidMount() {
        this.updateActiveKey();

        window.addEventListener("hashchange", this.hashListener);
    }

    componentWillUnmount() {
        window.removeEventListener("hashchange", this.hashListener);
    }

    onHashChange() {
        // In order to highlight the correct menu item.
        // Perhaps hook into a context for this instead?
        this.updateActiveKey();
    }

    updateActiveKey() {
        this.setState({
            activeKey: this.getActiveKey(),
        });
    }

    onNavClick(path: string) {
        // Explain ourselves here ... is this the problem?
        // I don't think so, because simple external links would fail...
        // but perhaps after the router rewrite it is ??

        // OLD
        // const oldHref = window.location.href;
        // window.location.href = '/#' + path;
        // if (oldHref === window.location.href) {
        //     window.dispatchEvent(new HashChangeEvent('hashchange'));
        // }

        // NEW
        // Umm, was this it the whole time???
        // Next: rewind the custom router (leave new code in place, just restore the code
        // in Body.tsx ... see if this, or a better fix perhaps in "changehash" fixes safari)
        changeHash2("/" + path)
    }

    renderIcon(button: MenuItem) {
        return <div className={styles.iconWrapper}>
            <span className={`fa fa-3x fa-${button.icon}`} />
        </div>;
    }
    renderBadge(menuItem: MenuItemInternal) {
        if (!menuItem.renderBadge) {
            return null;
        }
        return menuItem.renderBadge(menuItem);
    }

    showLabel() {
        return (this.props.showLabel !== false);
    }

    renderButton(menuItem: MenuItemInternal) {
        const label = (() => {
            if (this.showLabel()) {
                return <div>{menuItem.label}</div>
            }
            return null;
        })();
        return (
            <button
                className={styles.button}
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
                <div className={styles.icon}>
                    {this.renderIcon(menuItem)}
                    <div className={styles.badge}>{this.renderBadge(menuItem)}</div>
                </div>
                {label}
            </button>
        );
    }

    renderInternalItem(menuItem: MenuItemInternal) {
        const label = (() => {
            if (this.showLabel()) {
                return <div className={styles.label}>{menuItem.label}</div>
            }
            return null;
        })();
        return (
            <Nav.Item key={menuItem.name}>
                <Nav.Link eventKey={menuItem.name} className={styles.navLink}>
                    <div className={styles.icon}>
                        {this.renderIcon(menuItem)}
                        <div className={styles.badge}>{this.renderBadge(menuItem)}</div>
                    </div>
                    {label}
                </Nav.Link>
            </Nav.Item>
        );
    }

    renderExternalItem(menuItem: MenuItemExternal) {
        const label = (() => {
            if (this.showLabel()) {
                return <div>{menuItem.label}</div>
            }
            return null;
        })();
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
                    {label}
                </Nav.Link>
            </Nav.Item>
        );
    }

    renderMenu(): [Array<JSX.Element>, Map<string, () => void>] {
        const buttons: Array<JSX.Element> = [];
        const handlers: Map<string, () => void> = new Map();
        for (const item of this.props.menu) {
            // if (item.requiresAuth && 
            //     this.props.authState.status !== AuthenticationStatus.AUTHENTICATED) {
            //     continue;
            // }
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
                className={`flex-column SidebarMenuBSTweaks ${styles.main}`}
                // NOTE: the api allows activeKey of null to indicate no active key,
                // but the TS typing does not allow null, so we fool TS into by saying 
                // it is always a string.
                // TODO: file a ticket with the bootstrap-react project.
                activeKey={this.state.activeKey as string}
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
