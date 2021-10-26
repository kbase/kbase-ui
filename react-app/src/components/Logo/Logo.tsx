import { Component } from 'react';
import { Config } from '../../types/config';
import logo from './kbase_logo.png';

export interface LogoProps {
    config: Config;
}

interface LogoState {}

export class Logo extends Component<LogoProps, LogoState> {
    logoURL: string;
    constructor(props: LogoProps) {
        super(props);
        this.logoURL = logo;
    }

    render() {
        const { url, title } = this.props.config.ui.urls.marketing;
        return (
            <a
                href={url}
                title={title}
                className="-logo"
                data-k-b-testhook-component="logo"
            >
                <img src={this.logoURL} alt="KBase Logo" />
            </a>
        );
    }
}
