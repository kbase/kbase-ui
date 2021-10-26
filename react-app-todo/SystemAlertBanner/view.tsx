import UserProfileClient from '@kbase/ui-lib/lib/comm/coreServices/UserProfile';
import { Component } from 'react';

import CountdownClock from '../CountdownClock';

// define([
//     'preact',
//     'htm',
//     '../CountdownClock',
//     'css!./style.css'
// ], (
//     preact,
//     htm,
//     CountdownClock
// ) => {

//     const {h, Component } = preact;
//     const html = htm.bind(h);

function plural(amount: number, singular: string, plural: string) {
    if (amount === 1) {
        return singular;
    }
    return plural;
}

export interface AlertInfo {
    startAt: number;
    endAt: number;
    title: string;
    message: string;
    hash: string;
    now: number;
}

export class Alert {
    startAt: Date;
    endAt: Date | null;
    title: string;
    message: string;
    hash: string;
    now: number;
    read: boolean;
    showMessage: boolean;
    constructor({ startAt, endAt, title, message, hash, now }: AlertInfo) {
        this.startAt = new Date(startAt);
        if (endAt === null || endAt === undefined) {
            this.endAt = null;
        } else {
            this.endAt = new Date(endAt);
        }
        this.title = title;
        this.message = message;
        this.hash = hash;
        this.now = now;

        this.read = false;
        this.showMessage = false;

        this.countdownToStart = (() => {
            if (!this.now()) {
                return null;
            }
            return this.startAt - this.now();
        })();

        this.countdownToEnd = (() => {
            if (!this.now()) {
                return null;
            }
            if (this.endAt === null) {
                return Infinity;
            }
            return this.endAt - this.now();
        })();
    }

    toggleMessage() {
        this.showMessage(!this.showMessage());
    }
}

export default class SystemAlertBanner extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {}

    doShowHidden() {
        // this.props.alerts.forEach((alert) => {
        //     alert.read(false);
        // });
    }

    doHide() {}

    renderHiddenCount() {
        if (!this.props.hiddenAlertCount) {
            return;
        }
        return (
            <span>
                <span>${this.props.hiddenAlertCount})</span>$ hidden
                <button
                    type="button"
                    className="btn btn-default btn-kbase-subtle btn-kbase-compact"
                    onClick={this.doShowHidden.bind(this)}
                >
                    show$ ${plural(this.props.hiddenAlertCount, 'it', 'them')}
                </button>
            </span>
        );
    }

    renderHeader() {
        return (
            <div className="bg-danger text-danger -header">
                <div
                    style={{
                        flex: '1 1 0px',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <span style={{ fontWeight: 'bold' }}>
                        System${' '}
                        {plural(this.props.alerts.length, 'Alert', 'Alerts')}
                    </span>
                </div>
                <div style={{ textAlign: 'right', flex: '1 1 0px' }}>
                    <span>{this.props.alerts.length}</span>{' '}
                    {plural(this.props.alerts.length, 'alert', 'alerts')}{' '}
                    {this.renderHiddenCount()}
                    <button
                        className="btn btn-default btn-kbase-subtle btn-kbase-compact"
                        style={{ marginLeft: '8px' }}
                        type="button"
                        onClick={this.doHide.bind(this)}
                    >
                        hide{' '}
                        {plural(this.props.alerts.length, 'alert', 'alerts')}
                    </button>
                </div>
            </div>
        );
    }

    renderAlertIcon(alert) {
        const now = Date.now();
        const startsIn = alert.startAt - now;
        const endsIn = alert.endsAt === null ? Infinity : alert.endsAt - now;
        const iconClass = (() => {
            if (startsIn > 0) {
                return 'fa-clock-o';
            } else if (startsIn <= 0 && endsIn > 0) {
                return 'fa-exclamation-triangle';
            }
        })();
        const iconColor = (() => {
            if (startsIn > 0) {
                return 'fa-color-warning';
            } else if (startsIn <= 0 && endsIn > 0) {
                return 'fa-color-danger';
            }
        })();
        return (
            <span className="-icon">
                <span className={`fa ${iconClass} ${iconColor}`}></span>
            </span>
        );
    }

    renderAlert(alert) {
        return (
            <div className="-alert">
                <div className="-row">
                    <div className="-col1 title2">
                        <div style={{ fontWeight: 'bold' }}>
                            {alert.title || '** untitled **'}
                        </div>
                    </div>
                    <div className="-col2">
                        {this.renderAlertIcon(alert)}
                        <div style={{ flex: '1 1 0px' }}>
                            <CountdownClock
                                startAt={alert.startAt}
                                endAt={alert.endAt}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderAlerts() {
        if (
            !this.props.alerts.some((alert) => {
                return !alert.read;
            })
        ) {
            return;
        }
        const alerts = this.props.alerts.map((alert) => {
            return this.renderAlert(alert);
        });
        return <div class="itemsWrapper">{alerts}</div>;
    }

    renderAlertsPanel() {
        if (this.props.alerts && this.props.alerts.length > 0) {
            return (
                <div className="wrapper">
                    {this.renderHeader()}
                    {this.renderAlerts()}
                </div>
            );
        }
    }

    render() {
        return (
            <div class="SystemAlert" data-k-b-testhook-component="systemalert">
                {this.renderAlertsPanel()}
            </div>
        );
    }
}
