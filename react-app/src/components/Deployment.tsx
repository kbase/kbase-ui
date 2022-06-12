import { Component } from 'react';
import { Config } from '../types/config';
import styles from './Deployment.module.css';

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
            deploy: { environment, name, icon },
        } = this.props.config;
        if (environment === 'prod') {
            return;
        }
        return (
            <div
                className={styles.main}
                data-k-b-testhook-component="deployment"
            >
                <div className={styles.label} title={name}>
                    {environment}
                </div>
                <div className={styles.icon}>
                    <span className={'fa fa-2x fa-' + icon}></span>
                </div>
            </div>
        );
    }
}
