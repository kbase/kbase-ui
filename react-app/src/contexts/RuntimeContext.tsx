import React, { PropsWithChildren } from 'react';
import { Messenger, SubscriptionRef } from '../lib/messenger';
import { Config } from '../types/config';
import { AuthenticationState } from './Auth';
import * as uuid from 'uuid';
import { ConnectionStatus, PingStatKind, PingStats } from '../lib/ConnectionStatus';


export interface NotificationsSummary {
    info: number,
    success: number,
    warning: number,
    error: number
}



export enum NotificationKind {
    NORMAL = 'NORMAL',
    AUTODISMISS = 'AUTODISMISS'
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationBase {
    kind: NotificationKind;
    type: NotificationType;
    message: string;
    id: string;
    description?: string;
    icon?: string;
}

export interface NotificationNormal extends NotificationBase {
    kind: NotificationKind.NORMAL
}


export interface NotificationAutodismiss extends NotificationBase {
    kind: NotificationKind.AUTODISMISS;
    startedAt: number;
    dismissAfter: number;
}

export type Notification = NotificationNormal | NotificationAutodismiss;

export interface NotificationState {
    notifications: Array<Notification>;
    summary: NotificationsSummary
}


/**
 * Holds the current config information
 */
// export interface RuntimeInfo {
//     title: string;
//     setTitle: (title: string) => void;
//     config: Config;
//     authState: AuthenticationState;
// }

// export type RuntimeState = SyncProcess<RuntimeInfo>

export interface RuntimeState {
    title: string;
    setTitle: (title: string) => void;
    messenger: Messenger;
    config: Config;
    authState: AuthenticationState;
    notificationState: NotificationState;
    addNotification: (n: Notification) => void;
    removeNotification: (n: Notification) => void;
    pingStats: PingStats
}


// const demoNotificationState: NotificationState = {
//     notifications: [

//         {
//             kind: NotificationKind.NORMAL,
//             type: 'info',
//             id: '123',
//             icon: 'flask',
//             description: 'test notification',
//             message: 'hello, i am a notification'

//         },
//         {
//             kind: NotificationKind.NORMAL,
//             type: 'error',
//             id: '1234',
//             icon: 'ban',
//             description: 'error notification',
//             message: 'hello, i am a notification'

//         }
//     ], summary: {
//         info: 1,
//         success: 2,
//         warning: 3,
//         error: 4,
//     }
// }

const AUTODISMISSER_INTERVAL = 1000;

export class AutoDismisser {
    timeout: number | null;
    runner: () => boolean;
    constructor({ runner }: { runner: () => boolean }) {
        this.runner = runner;
        this.timeout = null;
    }

    run() {
        try {
            if (this.runner()) {
                this.loop();
            } else {
                this.timeout = null;
            }
        } catch (ex) {
            console.error('Error running autodismisser', ex);
        }
    }

    loop() {
        this.timeout = window.setTimeout(() => {
            this.run();
        }, AUTODISMISSER_INTERVAL);
    }

    start(force?: boolean) {
        if (this.timeout && !force) {
            return;
        }
        this.run();
    }
}


// Context

/**
 * The RuntimeContext is the basis for propagating auth state
 * throughout the app.
 */

export const RuntimeContext = React.createContext<RuntimeState | null>(null);

// Runtime Wrapper Component

export type RuntimeWrapperProps = PropsWithChildren<{
    config: Config;
    authState: AuthenticationState;
}>;

type RuntimeWrapperState = {
    title: string;
    notificationState: NotificationState;
    pingStats: PingStats;
};

// export interface RuntimeDB {
//     title: string;
// }
//
// const db = new Observed<RuntimeDB>({
//     title: '',
// });
//
// export function setTitle(title: string) {
//     db.setValue({
//         title,
//     });
// }

const $GlobalMessageBus = new Messenger();

export interface NotificationMessage {
    type: NotificationType;
    message: string;
    autodismiss?: number;
    id?: string;
}

/**
 * Wraps a component tree, ensuring that authentication status is
 * resolved and placed into the AuthContext. The auth state in the
 * context can then be used by descendants to do "the right thing".
 * In this app, the right thing is to show an error message if
 * there is lack of authentication (no token, invalid token), and to
 * proceed otherwise.
 *
 * Also note that the auth state is itself wrapped into an AsyncProcess,
 * which ensures that descendants can handle the async behavior of
 * determining the auth state (because we may need to call the auth service),
 * which includes any errors encountered.
 */
export default class RuntimeWrapper extends React.Component<
    RuntimeWrapperProps,
    RuntimeWrapperState
> {
    autoDismisser: AutoDismisser;
    subscriptions: Array<SubscriptionRef>;
    connectionStatus: ConnectionStatus;
    constructor(props: RuntimeWrapperProps) {
        super(props);
        this.autoDismisser = new AutoDismisser({
            runner: this.autodismissRunner.bind(this),
        });
        this.subscriptions = [];
        this.connectionStatus = new ConnectionStatus({
            onPing: this.onPing.bind(this)
        });
        this.state = {
            title: '',
            notificationState: {
                notifications: [],
                summary: {
                    info: 0,
                    warning: 0,
                    error: 0,
                    success: 0
                }
            },
            pingStats: {
                kind: PingStatKind.NONE
            }
        };
    }

    onPing(pingStats: PingStats) {
        this.setState({
            pingStats
        });
    }

    componentDidMount() {
        this.subscriptions.push($GlobalMessageBus.receive({
            channel: 'notification',
            message: 'notify',
            handler: async ({ type, message, autodismiss, id }: NotificationMessage) => {
                if (typeof autodismiss !== 'undefined') {
                    return this.addNotification({
                        id: id || uuid.v4(),
                        type,
                        message,
                        kind: NotificationKind.AUTODISMISS,
                        dismissAfter: autodismiss,
                        startedAt: Date.now()
                    });
                } else {
                    return this.addNotification({
                        id: id || uuid.v4(),
                        type,
                        message,
                        kind: NotificationKind.NORMAL,
                    });
                }
            }
        }));

        // this.connectionStatus.start();

        // window.setTimeout(() => {
        //     $GlobalMessageBus.send({
        //         channel: 'notification',
        //         message: 'notify',
        //         payload: {
        //             type: 'info',
        //             message: 'Well, hello',
        //             autodismiss: 3000
        //         }
        //     });
        //     // console.log('umm...');
        //     // this.addNotification({
        //     //     kind: NotificationKind.AUTODISMISS,
        //     //     type: 'info',
        //     //     id: uuid.v4(),
        //     //     message: 'Well, hello',
        //     //     dismissAfter: 3000,
        //     //     startedAt: Date.now()
        //     // })
        // }, 1000);
    }

    setTitle(title: string): void {
        this.setState({
            title,
        });
        document.title = `${title} | KBase`;
    }

    componentWillUnmount() {
        this.subscriptions.forEach((subscription) => {
            $GlobalMessageBus.unreceive(subscription);
        });
        this.connectionStatus.stop();
    }

    async addNotification(notification: Notification) {
        return new Promise((resolve) => {
            const { summary, notifications: existingNotifications } = this.state.notificationState;
            const notifications = existingNotifications.slice();
            notifications.push(notification);
            summary[notification.type] += 1;
            this.setState({
                notificationState: {
                    ...this.state.notificationState,
                    notifications,
                    summary
                }
            }, () => {
                if (notification.kind === NotificationKind.AUTODISMISS) {
                    this.autoDismisser.start();
                }
                resolve(null);
            });
        })
    }

    removeNotification(notification: Notification) {
        const { summary, notifications } = this.state.notificationState;
        summary[notification.type] -= 1;
        this.setState({
            notificationState: {
                ...this.state.notificationState,
                notifications: notifications.filter(({ id }) => id !== notification.id),
                summary
            }
        })
    }

    removeNotifications(notificationsToRemove: Array<Notification>) {
        const { summary, notifications: existingNotifications } = this.state.notificationState;
        const notifications = existingNotifications.filter(({ id }) => {
            return (!(notificationsToRemove.find((notificationToRemove) => {
                return notificationToRemove.id === id;
            })));
        });
        existingNotifications.forEach((notificationToRemove) => {
            summary[notificationToRemove.type] -= 1;
        })

        this.setState({
            notificationState: {
                ...this.state.notificationState,
                notifications,
                summary
            }
        })
    }

    autodismissRunner(): boolean {
        const toRemove: Array<Notification> = [];
        const now = new Date().getTime();
        let autodismissLeft = 0;
        this.state.notificationState.notifications.forEach((item) => {
            if (item.kind === NotificationKind.AUTODISMISS) {
                const elapsed = now - item.startedAt;
                if (item.dismissAfter < elapsed) {
                    toRemove.push(item);
                } else {
                    autodismissLeft += 1;
                }
            }
        });

        if (toRemove.length > 0) {
            this.removeNotifications(toRemove);
        }

        // Return true to keep on truckin'
        return autodismissLeft > 0;
    }


    render() {
        const contextValue: RuntimeState = {
            title: this.state.title,
            setTitle: this.setTitle.bind(this),
            messenger: $GlobalMessageBus,
            authState: this.props.authState,
            config: this.props.config,
            notificationState: this.state.notificationState,
            addNotification: this.addNotification.bind(this),
            removeNotification: this.removeNotification.bind(this),
            pingStats: this.state.pingStats
        };
        return (
            <RuntimeContext.Provider value={contextValue}>
                {this.props.children}
            </RuntimeContext.Provider>
        );
    }
}
