import Well from 'components/Well';
import { NA } from 'components/helpers';
import { SimpleError } from 'lib/SimpleError';
import { Component } from 'react';
import DataBrowser, { ColumnDef } from '../../components/DataBrowser';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading';
import { AuthenticationState } from '../../contexts/EuropaContext';
import { AsyncProcess, AsyncProcessStatus } from '../../lib/AsyncProcess';
import { Config } from '../../types/config';
import { SERVICES, ServiceDescription } from './ServiceDescription';
import ServicePerformance, { PerformanceMeasurementsStatus } from './ServicePerformance';

const ITERATIONS = 5;

export interface AboutServicesProps {
    config: Config;
    setTitle: (title: string) => void;
    authState: AuthenticationState;
}

export enum ServiceMeasurementSummaryStatus {
    OK = 'OK',
    ERROR = 'ERROR'
}

export interface ServiceMeasurementSummaryBase {
    status: ServiceMeasurementSummaryStatus
    description: ServiceDescription;
}

export interface ServiceMeasurementSummaryOK extends ServiceMeasurementSummaryBase {
    status: ServiceMeasurementSummaryStatus.OK,
    version: string;
    average: number;
    measures: Array<number>;
}

export interface ServiceMeasurementSummaryError extends ServiceMeasurementSummaryBase {
    status: ServiceMeasurementSummaryStatus.ERROR
    message: string;
}

export type ServiceMeasurementSummary = ServiceMeasurementSummaryOK | ServiceMeasurementSummaryError;

interface AboutServicesState {
    loadState: AsyncProcess<Array<ServiceMeasurementSummary>, SimpleError>
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
        try {
            const measurements: Array<ServiceMeasurementSummary> = await Promise.all(SERVICES.map(async (service) => {
                const measurer = new ServicePerformance({
                    config: this.props.config,
                    service,
                    iterations: ITERATIONS
                });
                const result = await measurer.measure();
                switch (result.status) {
                    case PerformanceMeasurementsStatus.SUCCESS: {
                        const {version, measurements } = result;
                        return {
                            status: ServiceMeasurementSummaryStatus.OK,
                            description: service,
                            version,
                            ...measurements
                        }
                    }
                    case PerformanceMeasurementsStatus.ERROR:
                        return {
                            status: ServiceMeasurementSummaryStatus.ERROR,
                            description: service,
                            message: result.message
                        }
                }
            }));
            this.setState({
                loadState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: measurements
                }
            })
           
        } catch (ex) {
            this.setState({
                loadState: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message: ex instanceof Error ? ex.message : 'Unknown error'
                    }
                }
            });
        }
    }

    renderServices(services: Array<ServiceMeasurementSummary>) {
        const columns: Array<ColumnDef<ServiceMeasurementSummary>> = [
            {
                id: 'module',
                label: 'Module',
                style: {},
                render: (service: ServiceMeasurementSummary) => {
                    // TODO: should manage to get the service's git url 
                    return <a href={`${service.description.repoURL}`} target="_blank">{service.description.module}</a>;
                },
                sorter: (a: ServiceMeasurementSummary, b: ServiceMeasurementSummary) => {
                    return a.description.module.localeCompare(b.description.module);
                },
            },
            {
                id: 'version',
                label: 'Version',
                style: {},
                render: (service: ServiceMeasurementSummary) => {
                    if (service.status === ServiceMeasurementSummaryStatus.ERROR) {
                        return <div className="text-danger">{service.message}</div>;
                    }
                    return <span>{service.version}</span>;
                },
                sorter: (a: ServiceMeasurementSummary, b: ServiceMeasurementSummary) => {
                    if (a.status === ServiceMeasurementSummaryStatus.ERROR) {
                        if (b.status  === ServiceMeasurementSummaryStatus.ERROR) {
                            return 0;
                        } else {
                            return -1;
                        }
                    } else {
                        if (b.status  === ServiceMeasurementSummaryStatus.ERROR) {
                            return 1;
                        } else {
                            return a.version.localeCompare(b.version);
                        }
                    }
                },
            },
            {
                id: 'type',
                label: 'Type',
                style: {},
                render: (service: ServiceMeasurementSummary) => {
                    return <span>{service.description.type}</span>;
                },
                sorter: (a: ServiceMeasurementSummary, b: ServiceMeasurementSummary) => {
                    return a.description.type.localeCompare(b.description.type);
                },
            },
            {
                id: 'perf',
                label: 'Perf (ms/call)',
                style: {},
                render: (service: ServiceMeasurementSummary) => {
                    if (service.status === ServiceMeasurementSummaryStatus.ERROR) {
                        return NA();
                    }
                    return <span>{Intl.NumberFormat('en-US', {
                        useGrouping: true,
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                    }).format(service.average)}</span>;
                },
                sorter: (a: ServiceMeasurementSummary, b: ServiceMeasurementSummary) => {
                    if (a.status === ServiceMeasurementSummaryStatus.ERROR) {
                        if (b.status  === ServiceMeasurementSummaryStatus.ERROR) {
                            return 0;
                        } else {
                            return -1;
                        }
                    } else {
                        if (b.status  === ServiceMeasurementSummaryStatus.ERROR) {
                            return 1;
                        } else {
                            return a.average - b.average;
                        }
                    }
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

    renderError({message}: SimpleError) {
        return <ErrorAlert message={message} />;
    }

    renderState() {
        switch (this.state.loadState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.loadState.error);
            case AsyncProcessStatus.SUCCESS:
                return this.renderServices(this.state.loadState.value);
        }
    }

    render() {
        const stretch = this.state.loadState.status === AsyncProcessStatus.SUCCESS;
        return <Well variant="secondary" stretch={stretch}>
            <Well.Body>
                {this.renderState()}
            </Well.Body>
        </Well>
    }
}
