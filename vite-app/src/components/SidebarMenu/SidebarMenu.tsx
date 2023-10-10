import { changeHash2 } from 'lib/navigation';
import { Component, createRef } from 'react';
import { Nav } from 'react-bootstrap';
import { MenuItem, MenuItemExternal, MenuItemInternal } from '../../types/menu';
import { FeedsBadgeWrapper } from './FeedsBadgeWrapper';
import './SidebarMenu.css';
import styles from './SidebarMenu.module.css';

export interface SidebarMenuProps {
    menu: Array<MenuItem>;
    path: string;
    showLabel?: boolean;
}

interface SidebarMenuState {
}

export interface MenuButton {
    icon: string;
    beta: boolean;
}

export default class SidebarMenu extends Component<SidebarMenuProps, SidebarMenuState> {
    ref: React.RefObject<HTMLDivElement>;

    constructor(props: SidebarMenuProps) {
        super(props);

        this.ref = createRef<HTMLDivElement>();

        this.state = {
            activeKey: null,
        };
    }

    onNavClick(path: string) {
        // Explain ourselves here ... is this the problem?
        // I don't think so, because simple external links would fail...
        // but perhaps after the router rewrite it is ??
        changeHash2("/" + path)
    }

    renderIcon(button: MenuItem) {
        return <div className={styles.iconWrapper}>
            <span className={`fa fa-3x fa-${button.icon}`} />
        </div>;
    }

    renderBadge(menuItem: MenuItemInternal) {
        switch (menuItem.name) {
            case 'feeds':
                // Yes, this is hardcoded. But as this codebase is going nowhere, let
                // us keep it simple.
                return <FeedsBadgeWrapper />
            default:
                return;
        }
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
                    className={styles.navLink}
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
        // Determine if the current menu item is a prefix for the current browser (hash) path.
        for (const item of this.props.menu) {
            if (item.type === 'internal') {
                if (this.props.path.startsWith(item.path)) {
                    return item.name;
                }
            }
        }
        return null;
    }

    render() {
        const [menu, handlers] = this.renderMenu();
        const activeKey = this.getActiveKey();
        return (
            <Nav
                className={`flex-column SidebarMenuBSTweaks ${styles.main}`}
                // NOTE: the api allows activeKey of null to indicate no active key,
                // but the TS typing does not allow null, so we fool TS into by saying 
                // it is always a string.
                // TODO: file a ticket with the bootstrap-react project.
                activeKey={activeKey as string}
                onSelect={(selectedKey: string | null) => {
                    if (selectedKey) {
                        const handler = handlers.get(selectedKey);
                        if (handler) {
                            handler();
                        }
                    }
                }}
            >
                {menu}
            </Nav>
        );
    }
}
