import { faBan, faCheck, faExclamationTriangle, faExternalLink, faEye, faEyeSlash, faInfoCircle, faPersonCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { navigationPathToURL } from 'contexts/RouterContext';
import { FeedNotification } from "lib/clients/Feeds";
import { Component, PropsWithChildren, ReactNode } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Variant } from "react-bootstrap/esm/types";
import styles from './Notification.module.css';


/**
* Converts JS Date object to <time unit> ago.
* Like "29 seconds ago" or whatever.
* @param {Date} date - a Date object
*/
export interface TimeAgoProps {
    time: number;
    nowText?: string;
}
interface TimeAgoState {
    started: boolean;
    currentTime: number;
    timeSinceStarted: number;
    pollingInterval: number;
    timer: number | null;
}

/**
 * Divides a millisecond time duration into days, hours, minutes, and seconds.
 * @param time 
 */
const MINUTE_LENGTH = 1000 * 60;
const HOUR_LENGTH = MINUTE_LENGTH * 60;
const DAY_LENGTH = HOUR_LENGTH * 24;

export function divideDuration(time: number) {
    const days = Math.floor(time / DAY_LENGTH);
    let rest = time % DAY_LENGTH;
    const hours = Math.floor(rest / HOUR_LENGTH);
    rest = time % HOUR_LENGTH;
    const minutes = Math.floor(rest / MINUTE_LENGTH);
    const seconds = rest % MINUTE_LENGTH;

    return [days, hours, minutes, seconds];
}

export function durationToPollingInterval(duration: number) {
    const [days, hours, minutes, _seconds] = divideDuration(duration);

    if (days > 0) {
        return DAY_LENGTH / 4;
    } else if (hours > 0) {
        return HOUR_LENGTH / 4;
    } else if (minutes > 0) {
        return MINUTE_LENGTH / 4;
    } else {
        return 250;
    }
}


export class TimeAgo extends Component<TimeAgoProps, TimeAgoState> {
    // pollingInterval: number;
    constructor(props: TimeAgoProps) {
        super(props);
        // this.timer = null;
        // this.pollingInterval = 250;
        const [timeSinceStarted, _currentTime] = this.calcTimeSinceStarted();
        this.state = {
            started: false,
            currentTime: Date.now(),
            timeSinceStarted,
            pollingInterval: durationToPollingInterval(timeSinceStarted),
            timer: null
        }
    }

    componentDidMount() {
        this.startPolling();
        this.updateTime();
    }
    componentWillUnmount() {
        this.stopPolling();
    }

    calcTimeSinceStarted() {
        const currentTime = Date.now();
        const timeSinceStarted = currentTime - this.props.time;
        return [timeSinceStarted, currentTime];
    }

    updateTime() {
        const [timeSinceStarted, currentTime] = this.calcTimeSinceStarted();

        const pollingInterval = durationToPollingInterval(timeSinceStarted);

        if (pollingInterval !== this.state.pollingInterval) {
            console.warn(`updateTime: polling enabled changing from ${this.state.pollingInterval} to ${pollingInterval}!`)
            // If we are over a minute, only update the clock every
            // 15 seconds.
            this.stopPolling();
            this.setState({
                currentTime,
                pollingInterval
            }, () => {
                this.startPolling();
            });
        } else {
            this.setState({
                started: true,
                currentTime,
                timeSinceStarted,
            });
        }
    }

    startPolling() {
        const timer = window.setInterval(() => {
            this.updateTime();
        }, this.state.pollingInterval);
        this.setState({timer});
    }


    // changePolling(interval: number) {
    //     this.stopPolling();
    //     this.startPolling(interval);
    // }

    stopPolling() {
        if (this.state.timer) {
            window.clearInterval(this.state.timer);
            this.setState({timer: null});
            // this.timer = null;
        }
    }
    renderNow() {
        return <span>{this.props.nowText || 'just now'}</span>;
    }
    render() {
        if (!this.state.started) {
            return ;
        }
        const dateFilter = [{
            'div': 86400000,
            'interval': ' day'
        }, {
            'div': 3600000,
            'interval': ' hour'
        }, {
            'div': 60000,
            'interval': ' minute'
        }, {
            'div': 1000,
            'interval': ' second'
        }];
        // const diffMs = Math.abs(this.state.currentTime - this.props.time);
        // let diff;
        if (this.state.currentTime < this.props.time) {
            return this.renderNow()
        }
        for (let i = 0; i < dateFilter.length; i++) {
            const diff = Math.floor(this.state.timeSinceStarted / dateFilter[i].div);
            if (diff > 0) {
                return <span>{`${diff}${dateFilter[i].interval}${diff > 1 ? 's' : ''} ago`}</span>;
            }
        }
        return this.renderNow();
    }
}
// function dateToAgo(date: Date) {
//     const dateFilter = [{
//         'div': 86400000,
//         'interval': ' day'
//     }, {
//         'div': 3600000,
//         'interval': ' hour'
//     }, {
//         'div': 60000,
//         'interval': ' minute'
//     }, {
//         'div': 1000,
//         'interval': ' second'
//     }];
//     const now = new Date();
//     const diffMs = Math.abs(now.getTime() - date.getTime());
//     let diff;
//     if (now < date) {
//         return 'just now';
//     }
//     for (let i=0; i<dateFilter.length; i++) {
//         diff = Math.floor(diffMs / dateFilter[i].div);
//         if (diff > 0) {
//             const s = (diff > 1) ? 's' : '';
//             return diff + dateFilter[i].interval + s + ' ago';
//         }
//     }
//     return 'just now';
// }


export interface NotificationProps extends PropsWithChildren {
    currentUserId: string;
    notification: FeedNotification;
    toggleSeen: (notification: FeedNotification) => void;
}

export default class Notification extends Component<NotificationProps> {
    renderLevelBackgroundVariant(): Variant {
        if (this.props.notification.seen) {
            return ''
        }
        switch (this.props.notification.level) {
            case 'error': return 'bg-danger-subtle';
            case 'success': return 'bg-success-subtle';
            case 'request': return 'bg-success-subtle';
            case 'warning': return 'bg-warning-subtle';
            case 'alert': return 'bg-info-subtle';
        }
    }

    renderLevelBorderVariant(): Variant {
        switch (this.props.notification.level) {
            case 'error': return 'border border-danger';
            case 'success': return 'border border-success';
            case 'request': return 'border border-success';
            case 'warning': return 'border border-warning';
            case 'alert': return 'border border-info';
        }
    }

    renderLevelTextVariant(): Variant {
        switch (this.props.notification.level) {
            case 'error': return 'text-danger';
            case 'success': return 'text-success';
            case 'request': return 'text-success';
            case 'warning': return 'text-warning';
            case 'alert': return 'text-info';
        }
    }


    renderLevelIcon(): ReactNode {
        const icon = (() => {
            switch (this.props.notification.level) {
                case 'error': return <FontAwesomeIcon icon={faBan} />;
                case 'request': return <FontAwesomeIcon icon={faPersonCircleQuestion} />;
                case 'warning': return <FontAwesomeIcon icon={faExclamationTriangle} />;
                case 'alert': return <FontAwesomeIcon icon={faInfoCircle} />;
                case 'success': return <FontAwesomeIcon icon={faCheck} />;
            }
        })();
        function Tip (tooltip: string, icon: JSX.Element) {
            return <OverlayTrigger overlay={<Tooltip>{tooltip}</Tooltip>}>
                {icon}
            </OverlayTrigger>
        }
        switch (this.props.notification.level) {
            case 'error': return Tip('Error', icon);;
            case 'request': return Tip('Request', icon);
            case 'warning': return Tip('Warning', icon);
            case 'alert': return Tip('Alert', icon);
            case 'success': return Tip('Success', icon);
        }
    }

    renderNotificationTime() {
        const date = new Date(this.props.notification.created);
        // const timeAgo = dateToAgo(date); // niceElapsed(date.getTime()); // Util.dateToAgo(date);
        const tooltip = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        // return small({
        //     class: 'feed-timestamp',
        //     dataToggle: 'tooltip',
        //     dataPlacement: 'right',
        //     title: tooltip
        // }, [timeAgo]);
        return <OverlayTrigger overlay={<Tooltip>{tooltip}</Tooltip>}>
            <TimeAgo time={this.props.notification.created} />
        </OverlayTrigger>
    }

    renderSeenButton() {
        const icon = this.props.notification.seen ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />
        const tooltip = this.props.notification.seen ? 'mark unseen' : 'mark seen';
        return <OverlayTrigger overlay={<Tooltip>{tooltip}</Tooltip>}>
            <Button
                onClick={() => this.props.toggleSeen(this.props.notification)}
                size="sm"
                // bootstrap buttons don't have
                className="border-0"
                // style={{border: 'none'}}
                variant="outline-secondary"
            >
                {icon}
            </Button>
        </OverlayTrigger>
    }

    renderObjectLinkButton() {
        const url = (() => {
            switch (this.props.notification.source) {
                case 'narrativeservice':
                    switch (this.props.notification.verb) {
                        case 'requested':
                        case 'invited':
                            return navigationPathToURL({ type: 'europaui', path: `narrative/${this.props.notification.object.id}` }, true)
                        default:
                            return;
                    }
                case 'groupsservice':
                    switch (this.props.notification.verb) {
                        case 'requested':
                        case 'invited':
                            return navigationPathToURL({ type: 'kbaseui', path: `orgs/${this.props.notification.object.id}` }, true)
                    }
            }
        })();

        const objectLabel = (() => {
            switch (this.props.notification.object.type) {
                case 'user': return 'User';
                case 'narrative': return 'Narrative';
                case 'group': return 'Org';
                default: return this.props.notification.object.type;
            }
        })();

        if (!url) {
            return;
        }
        return <OverlayTrigger overlay={<Tooltip>Open this {objectLabel}</Tooltip>}>
            <Button
                variant="outline-secondary"
                href={url.toString()}
                target="_blank"
                size="sm"
                className="border-0"
            >
                <FontAwesomeIcon icon={faExternalLink} />
            </Button>
        </OverlayTrigger>

    }

    render() {
        const classNames: Array<string> = [
            styles.Notification,
            `${this.renderLevelBackgroundVariant()}`,
            `${this.renderLevelBorderVariant()}`,
            `${this.renderLevelTextVariant()}`
        ]
        return <div className={classNames.join(' ')}>
            <div className={styles.NotificationIcon}>
                {this.renderLevelIcon()}
            </div>
            <div className={styles.NotificationControls}>
                {this.renderSeenButton()}
                {this.renderObjectLinkButton()}
            </div>
            <div className={styles.NotificationMessage}>
                <div className={styles.NotificationTypeMessage}>
                    {this.props.children}
                </div>
                <div className={styles.NotificationTime}>
                    {this.renderNotificationTime()}
                </div>
            </div>
        </div>
    }
}