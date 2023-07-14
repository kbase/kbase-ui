import { Component, Fragment } from 'react';

export interface AboutServiceProps {
    version: string;
    measures: Array<number>;
    average: number;
}

interface AboutServiceState {}

export default class AboutService extends Component<
    AboutServiceProps,
    AboutServiceState
> {
    render() {
        return (
            <Fragment>
                <td>{this.props.version}</td>
                <td>
                    <div style={{ textAlign: 'right', width: '6em' }}>
                        {Intl.NumberFormat('en-US', {
                            useGrouping: true,
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1,
                        }).format(this.props.average)}
                    </div>
                </td>
                <td>{this.props.measures.join(', ')}</td>
            </Fragment>
        );
    }
}
