import { Component, createRef } from 'react';
import { MenuItem, MenuItemExternal, MenuItemInternal } from '../../types/menu';
import { Nav } from 'react-bootstrap';
import './SidebarMenu.css';
import { changeHash } from '../../apps/Navigator/utils/navigation';

export interface SidebarMenuProps {
    menu: Array<MenuItem>;
    path: string;
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

        this.ref = createRef<HTMLDivElement>();

        this.state = {
            activeKey: null,
        };
    }

    componentDidMount() {
        this.updateActiveKey();

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
        changeHash("/" + path)
    }

    renderIcon(button: MenuItem) {
        return <div className={'fa fa-3x fa-' + button.icon} />;
    }
    renderBadge(menuItem: MenuItemInternal) {
        if (!menuItem.renderBadge) {
            return null;
        }
        return menuItem.renderBadge(menuItem);
    }

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
                <div className="-icon">
                    {this.renderIcon(menuItem)}
                    <div className="-badge">{this.renderBadge(menuItem)}</div>
                </div>
                <div>{menuItem.label}</div>
            </button>
        );
    }

    renderInternalItem(menuItem: MenuItemInternal) {
        return (
            <Nav.Item key={menuItem.name}>
                <Nav.Link eventKey={menuItem.name}>
                    <div className="-icon">
                        {this.renderIcon(menuItem)}
                        <div className="-badge">{this.renderBadge(menuItem)}</div>
                    </div>
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
