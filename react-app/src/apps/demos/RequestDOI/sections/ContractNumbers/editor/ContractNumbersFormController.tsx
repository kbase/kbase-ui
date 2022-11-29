import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { ContractNumbers } from "../../../DOIRequestClient";
import { Model } from '../../../Model';
import ContractNumbersForm from './ContractNumbersForm';

export interface ContractNumbersFormControllerProps {
    model: Model;
    contractNumbers?: ContractNumbers;
    setTitle: (title: string) => void;
    onDone: (contractNumbers: ContractNumbers) => void;
}

export interface EditableContractNumber {
    autoFocus: boolean;
    value: string;
}

export interface EditableContractNumbers {
    doe: Array<EditableContractNumber>,
    other: Array<EditableContractNumber>
}

export type DataState = AsyncProcess<EditableContractNumbers, { message: string }>

interface ContractNumbersFormControllerState {
    dataState: DataState
}

export default class ContractNumbersFormController extends Component<ContractNumbersFormControllerProps, ContractNumbersFormControllerState> {
    constructor(props: ContractNumbersFormControllerProps) {
        super(props);

        const contractNumbers = this.props.contractNumbers || { doe: [], other: [] };

        const contractNumberFields = {
            doe: contractNumbers.doe.map((contractNumber) => {
                return {
                    autoFocus: false,
                    value: contractNumber
                };
            }),
            other: contractNumbers.other.map((contractNumber) => {
                return {
                    autoFocus: false,
                    value: contractNumber
                };
            })
        }

        this.state = {
            dataState: {
                status: AsyncProcessStatus.SUCCESS,
                value: contractNumberFields
            }
        }
    }

    componentDidMount() {
        this.props.setTitle('ORCID® Link  - Demos - DOI Form - Step 5: Contract Numbers');
    }

    // Actions

    resetAutoFocus(contractNumbers: EditableContractNumbers) {
        contractNumbers.doe.forEach((x) => {
            x.autoFocus = false;
        });
        contractNumbers.other.forEach((x) => {
            x.autoFocus = false;
        });
    }

    addDOEContractNumber() {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        // Disable all autofocusing.
        const contractNumbers = this.state.dataState.value;
        this.resetAutoFocus(contractNumbers);
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...contractNumbers,
                    doe: contractNumbers.doe.slice().concat([{ autoFocus: true, value: '' }])
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
        doe[index] = { autoFocus: true, value: contractNumber };
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
        const contractNumbers = this.state.dataState.value;
        this.resetAutoFocus(contractNumbers);
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...contractNumbers,
                    other: contractNumbers.other.slice().concat([{ autoFocus: true, value: '' }])
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
        other[index] = { autoFocus: true, value: contractNumber };
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

    editableContractNumbersToContractNumbers(editableContractNumbers: EditableContractNumbers): ContractNumbers {
        return {
            doe: editableContractNumbers.doe.map(({ value }) => {
                return value;
            }),
            other: editableContractNumbers.other.map(({ value }) => {
                return value;
            })
        }
    }

    renderSuccess(contractNumbers: EditableContractNumbers) {
        return <ContractNumbersForm
            addDOEContractNumber={this.addDOEContractNumber.bind(this)}
            removeDOEContractNumber={this.removeDOEContractNumber.bind(this)}
            updateDOEContractNumber={this.updateDOEContractNumber.bind(this)}
            addOtherContractNumber={this.addOtherContractNumber.bind(this)}
            removeOtherContractNumber={this.removeOtherContractNumber.bind(this)}
            updateOtherContractNumber={this.updateOtherContractNumber.bind(this)}
            contractNumbers={contractNumbers}
            onDone={() => { this.props.onDone(this.editableContractNumbersToContractNumbers(contractNumbers)) }}
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