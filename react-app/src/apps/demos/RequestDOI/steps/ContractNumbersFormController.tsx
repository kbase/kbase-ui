import { Component } from 'react';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Model } from 'apps/ORCIDLink/Model';
import ContractNumbersForm from './ContractNumbersForm';
import { ContractNumbers } from 'apps/ORCIDLink/ORCIDLinkClient';

export interface ContractNumbersFormControllerProps {
    model: Model;
    setTitle: (title: string) => void;
    onDone: (contractNumbers: ContractNumbers) => void;
}


export type DataState = AsyncProcess<ContractNumbers, { message: string }>

interface ContractNumbersFormControllerState {
    dataState: DataState
}

export default class ContractNumbersFormController extends Component<ContractNumbersFormControllerProps, ContractNumbersFormControllerState> {
    constructor(props: ContractNumbersFormControllerProps) {
        super(props);

        this.state = {
            dataState: {
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    doe: [],
                    other: []
                }
            }
        }
    }

    componentDidMount() {
        this.props.setTitle('ORCID® Link  - Demos - DOI Form - Step 5: Contract Numbers');
    }

    // Actions

    addDOEContractNumber() {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    doe: this.state.dataState.value.doe.slice().concat([''])
                }
            }
        })
    }
    removeDOEContractNumber(index: number) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        const doe = this.state.dataState.value.doe.slice();
        doe.splice(index, 1);
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    doe
                }
            }
        })
    }
    updateDOEContractNumber(index: number, contractNumber: string) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        const doe = this.state.dataState.value.doe.slice();
        doe[index] = contractNumber;
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    doe
                }
            }
        })
    }
    addOtherContractNumber() {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    other: this.state.dataState.value.other.slice().concat([''])
                }
            }
        })
    }
    removeOtherContractNumber(index: number) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        const other = this.state.dataState.value.other.slice();
        other.splice(index, 1);
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    other
                }
            }
        })
    }
    updateOtherContractNumber(index: number, contractNumber: string) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        const other = this.state.dataState.value.other.slice();
        other[index] = contractNumber;
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    other
                }
            }
        })
    }

    // Model interaction

    // Renderers

    renderLoading() {
        return <Loading message="Loading your public narratives ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess(contractNumbers: ContractNumbers) {
        return <ContractNumbersForm
            addDOEContractNumber={this.addDOEContractNumber.bind(this)}
            removeDOEContractNumber={this.removeDOEContractNumber.bind(this)}
            updateDOEContractNumber={this.updateDOEContractNumber.bind(this)}
            addOtherContractNumber={this.addOtherContractNumber.bind(this)}
            removeOtherContractNumber={this.removeOtherContractNumber.bind(this)}
            updateOtherContractNumber={this.updateOtherContractNumber.bind(this)}
            contractNumbers={contractNumbers}
            onDone={() => { this.props.onDone(contractNumbers) }}
        />;
    }

    render() {
        switch (this.state.dataState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.dataState.error)
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.dataState.value);
        }
    }
}