import { Component } from 'react';
import { MenuItem } from '../../types/menu';
import { Dropdown } from 'react-bootstrap';
import logo from './kbase_logo.png';
import styles from './HamburgerMenuLogo.module.css';


export interface HamburgerMenuProps {
    menu: {
        narrative: Array<MenuItem>;
        search: Array<MenuItem>;
        developer: Array<MenuItem>;
        help: Array<MenuItem>;
    };
}

interface HamburgerMenuState {
}

export default class HamburgerMenu extends Component<HamburgerMenuProps,
    HamburgerMenuState> {
    renderSection(menu: Array<MenuItem>) {
        return menu.map((menuItem) => {
            let icon = null;
            if (menuItem.icon) {
                icon = (
                    <div className={styles.navbarIconWrapper} key={menuItem.name}>
                        <span className={`fa fa-${menuItem.icon} ${styles.navbarIcon}`} />
                    </div>
                );
            }
            if (menuItem.type === 'internal') {
                return (
                    <div key={menuItem.name}>
                        <Dropdown.Item
                            key={menuItem.name}
                            href={`#${menuItem.path}`}
                            target={menuItem.newWindow ? '_blank' : undefined}
                            rel="noreferrer"
                        >
                            {icon}
                            <span>{menuItem.label}</span>
                        </Dropdown.Item>
                    </div>
                );
            } else {
                return (
                    <div key={menuItem.name}>
                        <Dropdown.Item
                            eventKey={menuItem.name}
                            href={menuItem.url}
                            target={menuItem.newWindow ? '_blank' : undefined}
                            rel="noreferrer"
                        >
                            {icon}
                            <span>{menuItem.label}</span>
                        </Dropdown.Item>
                    </div>
                );
            }
        });
    }

    renderDivider(id: string) {
        return (
            <div key={id}>
                <Dropdown.Divider key={id} />
            </div>
        );
    }

    render() {
        const menuContent: Array<JSX.Element> = [];
        let isPreviousSection = false;
        [
            this.props.menu.narrative,
            this.props.menu.search,
            this.props.menu.developer,
            this.props.menu.help,
        ].forEach((menu, index) => {
            if (menu.length > 0) {
                if (isPreviousSection) {
                    menuContent.push(this.renderDivider(String(index)));
                    isPreviousSection = false;
                }
                for (const item of this.renderSection(menu)) {
                    menuContent.push(item);
                }
                isPreviousSection = true;
            }
        });

        return (
            <Dropdown>
                <Dropdown.Toggle variant="default" className={styles.button}>
                    <img src={logo} alt="KBase Logo" />
                </Dropdown.Toggle>
                <Dropdown.Menu>{menuContent}</Dropdown.Menu>
            </Dropdown>
        );
    }
}
