import { Component } from 'react';
import { AuthenticationState } from '../../contexts/Auth';
import { Config } from '../../types/config';
import AboutService from './AboutService/AboutServiceMain';
import { SERVICES } from './ServiceDescription';

export interface AboutCoreServicesProps {
    config: Config;
    setTitle: (title: string) => void;
    authState: AuthenticationState;
}

interface AboutCoreServicesState {}

export default class AboutCoreServices extends Component<
    AboutCoreServicesProps,
    AboutCoreServicesState
> {
    render() {
        const rows = SERVICES.map((service) => {
            return (
                <tr key={service.module}>
                    <td>{service.title}</td>
                    <AboutService
                        service={service}
                        config={this.props.config}
                    />
                </tr>
            );
        });
        return (
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th style={{ width: '12em' }}>Service</th>
                        <th>Version</th>
                        <th>Perf (ms/call)</th>
                        <th>Perf calls (ms/call)</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </table>
        );
    }
}
