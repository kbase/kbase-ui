import {Component} from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Body from '../Body';
import HamburgerMenu from '../HamburgerMenu/HamburgerMenuMain';
import {AuthenticationState} from '../../contexts/Auth';
import {Config} from '../../types/config';
import Title from '../Title.';
import Deployment from '../Deployment';
import Signin from '../Signin/SigninMain';
import './style.css';
import {RuntimeContext} from '../../contexts/RuntimeContext';

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
            <div className="-navbar" style={{padding: '0'}}>
                <div className="-cell -menu">
                    <HamburgerMenu {...this.props} />
                </div>
                {/* <div className="-cell -logo">
                    <Logo {...this.props} />
                </div> */}
                <div className="-cell -title">
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
                <div className="-cell -deployment">
                    <Deployment {...this.props} />
                </div>
                <div className="-login -cell">
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
                className="MainWindow"
                data-k-b-testhook-component="mainwindow"
            >
                <div className="-header">{this.renderHeader()}</div>
                <div className="-body">
                    <div className="-nav">
                        <Sidebar {...this.props} />
                    </div>
                    <div className="-content-area">
                        {/* ${this.renderSystemAlertBanner()} */}
                        <div className="-content">
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
