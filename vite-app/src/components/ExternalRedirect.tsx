import { Component } from 'react';

export enum RedirectKind {
    NEW_WINDOW = 'NEW_WINDOW',
    REPLACE = 'REPLACE',
    NORMAL = 'NORMAL',
}

export interface ExternalRedirectProps {
    url: string;
    kind?: RedirectKind;
}

interface ExternalRedirectState {}

export default class ExternalRedirect extends Component<
    ExternalRedirectProps,
    ExternalRedirectState
> {
    render() {
        switch (this.props.kind) {
            case RedirectKind.NEW_WINDOW:
                window.open(this.props.url, '_blank');
                break;
            case RedirectKind.REPLACE:
                window.location.replace(this.props.url);
                break;
            case RedirectKind.NORMAL:
            default:
                window.location.href = this.props.url;
        }
        return null;
    }
}
