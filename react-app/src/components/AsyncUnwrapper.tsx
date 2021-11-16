import { Component } from 'react';
import { AsyncProcess, AsyncProcessStatus } from '../lib/AsyncProcess';

export interface AsyncUnwrapperProps<T> {
    value: AsyncProcess<T, string>;
}

interface AsyncUnwrapperState {}

export default class AsyncUnwrapper<T> extends Component<
    AsyncUnwrapperProps<T>,
    AsyncUnwrapperState
> {
    render() {
        switch (this.props.value.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <div>Loading...</div>;
            case AsyncProcessStatus.ERROR:
                return <div>Error! {this.props.value.error}</div>;
            case AsyncProcessStatus.SUCCESS:
                // TODO: render children with value passed...
                return <div>here...</div>;
        }
    }
}
