define([
    'preact',
    'htm',

    'css!./Notifications.css'
], (
    preact,
    htm
) => {

    const {h, Component } = preact;
    const html = htm.bind(h);

    class Notifications extends Component {
        constructor(props) {
            super(props);
        }

        renderSummaryItem(name) {
            const summary = this.props.summary[name];
            const activeClass = summary ? ' -has-items' : '';
            return html`
                <div class=${`-item -${name}${activeClass}`}>
                    <div class="-count">     
                        ${summary}
                    </div>
                    <div class="-label">
                        ${name}
                    </div>
                </div>
            `;
        }

        renderSummary() {
            return html`
                <div class="-summary"
                     onClick=${this.doToggleNotifications.bind(this)}>
                    ${this.renderSummaryItem('success')}
                    ${this.renderSummaryItem('info')}
                    ${this.renderSummaryItem('warning')}
                    ${this.renderSummaryItem('error')}
                </div>
            `;
        }

        doCloseNotifications() {
            this.props.closeNotifications();
        }

        doClearNotification(notification) {
            this.props.clearNotification(notification);
        }

        doToggleNotifications() {
            this.props.toggleNotifications();
        }

        renderNotifications() {
            return this.props.notifications.map((notification) => {
                const typeClass = (() => {
                    switch (notification.type) {
                    case 'success': return '-success';
                    case 'info': return '-info';
                    case 'warning': return '-warning';
                    case 'error': return '-error';
                    }
                })();
                return html`
                    <div className=${'-notification ' + typeClass}>
                        <a className="-button -close-button"
                           title="Clear this notification"
                           onClick=${() => {this.doClearNotification(notification);}}>
                           <span class="fa fa-times"></span>
                        </a>
                        <div class="-message"
                             title=${notification.description}>
                            ${notification.message}
                        </div>
                     </div>
                `;
            });
        }

        renderNotificationDisplay() {
            const activeStyle = (this.props.show ? ' -active' : '');
            return html`
                <div className=${'-container' + activeStyle}>
                    <div className=${'-notification-set' + (this.props.show ? '' : ' hidden')}>
                        <div className="-pointer">
                            <svg  viewBox='0 0 25 25'
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='25px'
                                    height='25px'>
                                <polygon points='0 0, 0 20, 20 10'
                                        fill='gray'>
                                </polygon>
                            </svg>
                        </div>
                        <div style=${{display: 'inline-block'}}>
                            <a className="-button"
                               onClick=${this.doCloseNotifications.bind(this)}
                               style=${{
        padding: '2px 4px',
        display: 'inline-block',
        marginTop: '2px',
        marginBottom: '3px'
    }}>
                                close
                            </a>
                        </div>
                        <div className="notifications-container">
                            ${this.renderNotifications()}
                        </div>
                    </div>
                </div>
            `;
        }

        render() {
            if (!this.props.notifications || this.props.notifications.length === 0) {
                return;
            }
            return html`
                <div className="Notifications"
                     data-k-b-testhook-component="notifications">
                    ${this.renderSummary()}
                    ${this.renderNotificationDisplay()}
                </div>
            `;
        }
    }

    return Notifications;
});