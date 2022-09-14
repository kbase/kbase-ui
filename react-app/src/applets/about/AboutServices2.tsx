import { Component } from 'react';
import DataBrowser, { ColumnDef } from '../../components/DataBrowser';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import { AuthenticationState } from '../../contexts/Auth';
import { AsyncProcess, AsyncProcessError, AsyncProcessStatus } from '../../lib/AsyncProcess';
import { Config } from '../../types/config';
import { ServiceDescription, SERVICES } from './ServiceDescription';
import ServicePerformance from './ServicePerformance';

const ITERATIONS = 5;

export interface AboutServicesProps {
    config: Config;
    setTitle: (title: string) => void;
    authState: AuthenticationState;
}

export interface ServiceDescriptionWithPerformance {
    description: ServiceDescription;
    version: string;
    average: number;
    measures: Array<number>;
}

interface AboutServicesState {
    loadState: AsyncProcess<Array<ServiceDescriptionWithPerformance>, string>
}

export default class AboutServices extends Component<
    AboutServicesProps,
    AboutServicesState
> {

    constructor(props: AboutServicesProps) {
        super(props);
        this.state = {
            loadState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }
    componentDidMount() {
        this.props.setTitle('About KBase Core Services');
        this.performMeasurements();
    }

    async performMeasurements() {
        const measurements = await Promise.all(SERVICES.map(async (service) => {
            const measurer = new ServicePerformance({
                config: this.props.config,
                service,
                iterations: ITERATIONS
            });
            const [version, measurement] = await measurer.measure();
            return {
                description: service,
                version,
                ...measurement
            }
        }));
        this.setState({
            loadState: {
                status: AsyncProcessStatus.SUCCESS,
                value: measurements
            }
        });
    }

    renderServices(services: Array<ServiceDescriptionWithPerformance>) {
        const columns: Array<ColumnDef<ServiceDescriptionWithPerformance>> = [
            {
                id: 'module',
                label: 'Module',
                style: {},
                render: (service: ServiceDescriptionWithPerformance) => {
                    // TODO: should manage to get the service's git url 
                    return <a href="" target="_blank">{service.description.module}</a>;
                },
                sorter: (a: ServiceDescriptionWithPerformance, b: ServiceDescriptionWithPerformance) => {
                    return a.description.module.localeCompare(b.description.module);
                },
            },
            {
                id: 'version',
                label: 'Version',
                style: {},
                render: (service: ServiceDescriptionWithPerformance) => {
                    return <span>{service.version}</span>;
                },
                sorter: (a: ServiceDescriptionWithPerformance, b: ServiceDescriptionWithPerformance) => {
                    return a.version.localeCompare(b.version);
                },
            },
            {
                id: 'type',
                label: 'Type',
                style: {},
                render: (service: ServiceDescriptionWithPerformance) => {
                    return <span>{service.description.type}</span>;
                },
                sorter: (a: ServiceDescriptionWithPerformance, b: ServiceDescriptionWithPerformance) => {
                    return a.description.type.localeCompare(b.description.type);
                },
            },
            {
                id: 'perf',
                label: 'Perf (ms/call)',
                style: {},
                render: (service: ServiceDescriptionWithPerformance) => {
                    return <span>{Intl.NumberFormat('en-US', {
                        useGrouping: true,
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                    }).format(service.average)}</span>;
                },
                sorter: (a: ServiceDescriptionWithPerformance, b: ServiceDescriptionWithPerformance) => {
                    return a.average - b.average;
                },
            }
        ];

        return (
            <DataBrowser
                columns={columns}
                heights={{ header: 50, row: 50 }}
                dataSource={services}
            />
        );
    }

    renderLoading() {
        return (
            <Loading
                message="Measuring services..."
                type="inline"
                size="small"
            />
        );
    }

    renderError(state: AsyncProcessError<string>) {
        return <ErrorAlert message={state.error} />;
    }

    renderState() {
        switch (this.state.loadState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.loadState);
            case AsyncProcessStatus.SUCCESS:
                return this.renderServices(this.state.loadState.value);
        }
    }

    render() {
        return <div className="well main">
            <div className="well-body">
                {this.renderState()}
            </div>
        </div>
    }
}
