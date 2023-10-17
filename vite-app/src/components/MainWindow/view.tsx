import { Component } from 'react';
import { Form } from 'react-bootstrap';
import { AuthenticationState } from '../../contexts/Auth';
import { RuntimeContext } from '../../contexts/RuntimeContext';
import { Config } from '../../types/config';
import Body from '../Body';
import Deployment from '../Deployment';
import HamburgerMenu from '../HamburgerMenu/HamburgerMenuMain';
import { Logo } from '../Logo/Logo';
import Notifications from '../Notifications/NotificationsMain';
import Sidebar from '../Sidebar/Sidebar';
import Signin from '../Signin/SigninMain';
import Title from '../Title';
import styles from './style.module.css';
// import { Ping } from '../Ping';

export interface MainWindowProps {
    authState: AuthenticationState;
    config: Config;
    hideUI?: boolean;
    hideHeader: boolean;
    hideNavigation: boolean;
    setTitle: (title: string) => void;
}

export default class MainWindow extends Component<MainWindowProps> {
    constructor(props: MainWindowProps) {
        super(props);
        this.state = {
            title: 'Loading...',
        };
    }

    componentDidUpdate() {
        // TODO: add hooks for updating system notifications
        // probably in the system notification components themselves...
    }

    // renderSystemAlerts() {
    //     // if (!this.props.runtime.featureEnabled('system_alert_notification')) {
    //     //     return;
    //     // }
    //     const props = {
    //         runtime: this.props.runtime
    //     };
    //     return html`
    //         <div className="-cell -alerts">
    //             <${SystemAlertToggle} ...${props} />
    //         </div>
    //     `;
    // }

    renderLogo() {
        if (this.props.config.ui.defaults.integratedHamburgerAndLogo) {
            return;
        }
        return <div className={styles.cellLogo}>
            <Logo {...this.props} />
        </div>
    }

    renderHeader() {
        if (this.props.hideUI || this.props.hideHeader) {
            return;
        }
        return (
            <div className={styles.header}>
                <div className={styles.navbar} style={{ padding: '0' }}>
                    <div className={styles.hamburgerMenu}>
                        <HamburgerMenu {...this.props} />
                    </div>
                    {this.renderLogo()}
                    <div className={styles.cellTitle}>
                        <RuntimeContext.Consumer>
                            {(value) => {
                                if (value) {
                                    return <Title title={value.title} />;
                                }
                            }}
                        </RuntimeContext.Consumer>
                    </div>
                    {/* <div className="-buttons">
                    <ButtonBar ...${props} />
                </div> */}
                    {/* ${this.renderSystemAlertToggle()} */}
                    <div className={styles.cellNotification}>
                        <RuntimeContext.Consumer>
                            {(value) => {
                                if (!value) {
                                    return;
                                }
                                return (
                                    <Notifications
                                        notificationState={value.notificationState}
                                        addNotification={value.addNotification}
                                        removeNotification={value.removeNotification}
                                    />
                                );
                            }}
                        </RuntimeContext.Consumer>
                    </div>
                    {/* <div className={styles.connectionStatus}>
                    <ConnectionStatus />
                </div> */}
                    {/* <div className={styles.connectionStatus}>
                    <RuntimeContext.Consumer>
                        {(value) => {
                            if (!value) {
                                return;
                            }
                            return <Ping pingStats={value.pingStats} />
                        }}
                    </RuntimeContext.Consumer>
                </div> */}
                    <div className={styles.cellDeployment}>
                        <Deployment {...this.props} />
                    </div>
                    <div className={styles.cellLogin}>
                        <Signin {...this.props} />
                    </div>
                </div>
            </div>
        );
    }

    // renderSystemAlertToggle() {
    //     const props = {
    //         runtime: this.props.runtime,
    //         plugin: this.props.plugin,
    //     };
    //     if (!this.props.runtime.featureEnabled('system_alert_notification')) {
    //         return;
    //     }
    //     return html`
    //         <div className="-cell -alerts">
    //             <${SystemAlertToggle} ...${props} />
    //         </div>
    //     `;
    // }

    // renderSystemAlertBanner() {
    //     // if (!this.props.runtime.featureEnabled('system_alert_notification')) {
    //     //     return;
    //     // }
    //     const props = {
    //         runtime: this.props.runtime,
    //     };
    //     return html` <${SystemAlertBanner} ...${props} /> `;
    // }


    renderNavigation() {
        if (this.props.hideUI || this.props.hideNavigation) {
            return;
        }
        return <div className={styles.navArea}>
            <Sidebar {...this.props} />
        </div>;
    }

    renderMenuSearch() {
        return <div className={styles.menuSearch}>
            <div className={styles.menuSearchSearchbar}>
                <Form.Control type="text" />
            </div>
            <div className={styles.menuSearchSearchresults}></div>
        </div>
    }

    render() {
        return (
            <div className={styles.main} data-k-b-testhook-component="mainwindow">
                {/* {this.renderMenuSearch()} */}
                {this.renderHeader()}
                <div className={styles.body}>
                    {this.renderNavigation()}
                    <div className={styles.contentArea}>
                        {/* ${this.renderSystemAlertBanner()} */}
                        <div className={styles.content}>
                            <RuntimeContext.Consumer>
                                {(value) => {
                                    // Try not to spam the Body with runtime state
                                    // changes.
                                    if (value) {
                                        return (
                                            <Body
                                                {...this.props}
                                                pluginsInfo={value.pluginsInfo}
                                                setTitle={value.setTitle}
                                            />
                                        );
                                    }
                                }}
                            </RuntimeContext.Consumer>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
