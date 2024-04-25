import React from 'react';

export interface UILinkProps {
    path: string;
    openIn: 'same-window' | 'new-tab';
}

interface UILinkState {

}

export default class UILink extends React.Component<UILinkProps, UILinkState> {
    render() {
        const href = `/#${this.props.path}`;
        switch (this.props.openIn) {
            case 'same-window':
                return <a href={href} target='_parent'>
                    {this.props.children}
                </a>;
            case 'new-tab':
                return <a href={href} target='_blank' rel="noopener noreferrer">
                    {this.props.children}
                </a>;
        }
    }
}