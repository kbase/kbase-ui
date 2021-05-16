define([
    'preact',
    'htm',
    '../Title',
    '../Notifications/NotificationsMain',
    '../SystemAlertToggle/data',
    '../HamburgerMenu/HamburgerMenuMain',
    '../Logo',
    '../ButtonBar',
    '../Deployment',
    '../Signin/SigninMain',
    '../SystemAlertBanner/data',
    '../Sidebar/Sidebar',
    '../Body',
    'css!./style.css'
], (
    preact,
    htm,
    Title,
    Notification,
    SystemAlertToggle,
    HamburgerMenu,
    Logo,
    ButtonBar,
    Deployment,
    Signin,
    SystemAlertBanner,
    Sidebar,
    Body
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class MainWindow extends Component {
        constructor(props) {
            super(props);
            this.state = {
                title: this.props.title
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
            const props = {
                runtime: this.props.runtime,
                plugin: this.props.plugin
            };
            return html`
                <div className="-navbar"
                    style=${{padding: '0'}}>
                    <div className="-cell -menu">
                        <${HamburgerMenu} ...${props} />
                    </div>
                    <div className="-cell -logo">
                        <${Logo} ...${props} />
                    </div>
                    <div className="-cell -title">
                        <${Title} ...${props} />
                    </div>
                    <div className="-buttons">
                        <${ButtonBar} ...${props} />
                    </div>
                    ${this.renderSystemAlertToggle()}
                    <div className="-notification">
                        <${Notification} ...${props} />
                    </div>
                    <div className="-cell -deployment">
                        <${Deployment} ...${props} />
                    </div>
                    <div className="-login -cell">
                        <${Signin} ...${props} />
                    </div>
                </div>
            `;
        }

        renderSystemAlertToggle() {
            const props = {
                runtime: this.props.runtime,
                plugin: this.props.plugin
            };
            if (!this.props.runtime.featureEnabled('system_alert_notification')) {
                return;
            }
            return html`
                <div className="-cell -alerts">
                    <${SystemAlertToggle} ...${props} />
                </div>
            `;
        }

        renderSystemAlertBanner() {
            // if (!this.props.runtime.featureEnabled('system_alert_notification')) {
            //     return;
            // }
            const props = {
                runtime: this.props.runtime
            };
            return html`
                <${SystemAlertBanner} ...${props} />
            `;
        }

        render() {
            const props = {
                runtime: this.props.runtime
            };
            return html`
                <div className="MainWindow"
                     data-k-b-testhook-component="mainwindow">
                    <div className="-header">
                        ${this.renderHeader()}
                    </div>
                    <div className="-body">
                        <div className="-nav">
                            <${Sidebar} ...${props} />
                        </div>
                        <div className="-content-area">
                            ${this.renderSystemAlertBanner()}
                            <div className="-plugin-content">
                                <${Body} ...${props} />
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    return MainWindow;
});