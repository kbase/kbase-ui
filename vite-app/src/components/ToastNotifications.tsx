/**
 * Provides a bootstrap Toast driven notification interface.
 */

import { $GlobalMessenger } from "contexts/EuropaContext";
import { SubscriptionRef } from "lib/messenger";
import { Component } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { Variant } from "react-bootstrap/esm/types";
import { v4 as uuidv4 } from 'uuid';

export interface NotificationsProps {
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    createdAt: number;
    closeAfter?: number;
    variant: Variant
}

interface NotificationsState {
    notifications: Array<Notification>
}

export default class ToastNotifications extends Component<NotificationsProps, NotificationsState> {
    messageSubscriptions: Array<SubscriptionRef>;
    constructor(props: NotificationsProps) {
        super(props);
        this.state = {
            notifications: []
        }
        this.messageSubscriptions = [];
    }

    componentDidMount() {
        this.messageSubscriptions.push($GlobalMessenger.on('notification', 'notify', (payload: any) => {
            // Just trust for now...
            const {title, message, autodismiss, variant} = payload;
            this.setState({
                notifications: [
                    ...this.state.notifications,
                    {
                        id: uuidv4(),
                        title, message, closeAfter: autodismiss, variant,
                        createdAt: Date.now()
                    }
                ]
            });
        }));
    }

    componentWillUnmount() {
        for (const subscriptionRef of this.messageSubscriptions) {
            $GlobalMessenger.drop(subscriptionRef);
        }
    }

    removeItem(idToRemove: string) {
        this.setState({
            notifications: this.state.notifications.filter(({id}) => {
                return (id !== idToRemove);
            })
        })
    }

    render() {
        const now = Date.now();
        return <div className="position-fixed-top">
                <ToastContainer position="top-end">
                {this.state.notifications.map(({id, title, message, createdAt, closeAfter, variant}) => {
                    if (closeAfter && (now - createdAt > closeAfter)) {
                        return;
                    }
                    return  <Toast 
                        key={id}
                        autohide={!!closeAfter} 
                        delay={closeAfter} 
                        onClose={() => {this.removeItem(id)}}
                        bg={variant}
                    >
                        <Toast.Header>
                            <span className="me-auto">{title}</span>
                        </Toast.Header>
                        <Toast.Body>
                            {message}
                        </Toast.Body>
                    </Toast>
                })}
                    
                </ToastContainer>
            </div>
    }
}
