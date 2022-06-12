import {Component} from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Body from '../Body';
import HamburgerMenu from '../HamburgerMenu/HamburgerMenuMain';
import {AuthenticationState} from '../../contexts/Auth';
import {Config} from '../../types/config';
import Title from '../Title';
import Deployment from '../Deployment';
import Signin from '../Signin/SigninMain';
import {RuntimeContext} from '../../contexts/RuntimeContext';
import {Logo} from '../Logo/Logo';
// import './style.css';
import styles from './style.module.css';

export interface MainWindowProps {
    authState: AuthenticationState;
    config: Config;
    setTitle: (title: string) => void;
}

interface MainWindowState {
}

export default class MainWindow extends Component<MainWindowProps,
    MainWindowState> {
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

    renderHeader() {
        return (
            <div className={styles.navbar} style={{padding: '0'}}>
                <div>
                    <HamburgerMenu {...this.props} />
                </div>
                <div className={styles.cellLogo}>
                    <Logo {...this.props} />
                </div>
                <div className={styles.cellTitle}>
                    <RuntimeContext.Consumer>
                        {(value) => {
                            if (value) {
                                return <Title title={value.title}/>;
                            }
                        }}
                    </RuntimeContext.Consumer>
                </div>
                {/* <div className="-buttons">
                    <ButtonBar ...${props} />
                </div> */}
                {/* ${this.renderSystemAlertToggle()} */}
                {/* <div className="-notification">
                    <${Notification} ...${props} />
                </div> */}
                <div className={styles.cellDeployment}>
                    <Deployment {...this.props} />
                </div>
                <div className={styles.cellLogin}>
                    <Signin {...this.props} />
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

    render() {
        return (
            <div
                className={styles.main}
                data-k-b-testhook-component="mainwindow"
            >
                <div className={styles.header}>{this.renderHeader()}</div>
                <div className={styles.body}>
                    <div className="-nav">
                        <Sidebar {...this.props} />
                    </div>
                    <div className={styles.contentArea}>
                        {/* ${this.renderSystemAlertBanner()} */}
                        <div className={styles.content}>
                            <RuntimeContext.Consumer>
                                {(value) => {
                                    if (value) {
                                        return (
                                            <Body
                                                {...this.props}
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
