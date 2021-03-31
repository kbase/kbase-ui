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
                <div class="-navbar"
                    style=${{padding: '0'}}>
                    <div class="-cell -menu">
                        <${HamburgerMenu} ...${props} />
                    </div>
                    <div class="-cell -logo">
                        <${Logo} ...${props} />
                    </div>
                    <div class="-cell -title">
                        <${Title} ...${props} />
                    </div>
                    <div class="-buttons">
                        <${ButtonBar} ...${props} />
                    </div>
                    ${this.renderSystemAlertToggle()}
                    <div class="-notification">
                        <${Notification} ...${props} />
                    </div>
                    <div class="-cell -deployment">
                        <${Deployment} ...${props} />
                    </div>
                    <div class="-login -cell">
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
                <div class="-cell -alerts">
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
                <div class="MainWindow"
                     data-k-b-testhook-component="mainwindow">
                    <div class="-header">
                        ${this.renderHeader()}
                    </div>
                    <div class="-body">
                        <div class="-nav">
                            <${Sidebar} ...${props} />
                        </div>
                        <div class="-content-area">
                            ${this.renderSystemAlertBanner()}
                            <div class="-plugin-content">
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