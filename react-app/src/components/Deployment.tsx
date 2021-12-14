import { Component } from 'react';
import { Config } from '../types/config';
import './Deployment.css';

export interface DeploymentProps {
    config: Config;
}

interface DeploymentState {}

export default class Deployment extends Component<
    DeploymentProps,
    DeploymentState
> {
    render() {
        const {
            deploy: { environment, icon },
        } = this.props.config;
        if (environment === 'prod') {
            return;
        }
        return (
            <div
                className="Deployment"
                data-k-b-testhook-component="deployment"
            >
                <div className="Deployment-Label">
                    {environment.toUpperCase()}
                </div>
                <div className="Deployment-Icon">
                    <span className={'fa fa-2x fa-' + icon}></span>
                </div>
            </div>
        );
    }
}
