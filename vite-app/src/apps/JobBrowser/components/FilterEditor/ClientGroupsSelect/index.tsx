import { Alert, Spin } from 'antd';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { SimpleError } from 'lib/SimpleError';
import React from 'react';
import { DynamicServiceConfig } from 'types/config';
import JobBrowserBFFClient from '../../../lib/JobBrowserBFFClient';
import { OptionValue } from '../../../lib/types';
import View, { ClientGroupSelectProps } from './view';

/* For Component */
export interface DataProps {
    token: string;
    serviceWizardURL: string;
    jobBrowserBFFConfig: DynamicServiceConfig;
    timeout: number;
}

// type TheProps = Omit<DataProps & FilterEditorProps, "narratives">;
type TheProps = Omit<DataProps & ClientGroupSelectProps, "options">;

type DataState = AsyncProcess<Array<OptionValue<string>>, SimpleError>;

export default class ClientGroupsSelectController extends React.Component<TheProps, DataState> {
    constructor(props: TheProps) {
        super(props);
        this.state = {
            status: AsyncProcessStatus.NONE
        };
    }

    componentDidMount() {
        this.initialize();
        // try {
        //     const options = await this.fetchOptions();
        //     if (!this.stopped) {
        //         this.setState({
        //             process: {
        //                 status: AsyncProcessStatus.SUCCESS,
        //                 value: options
        //             }
        //         });
        //     }
        // } catch (ex) {
        //     // TOODO: catch and propagate JSONRPC errors
        //     this.setState({
        //         process: {
        //             status: AsyncProcessStatus.ERROR,
        //             error: {
        //                 message: ex instanceof Error ? ex.message : 'Unknown Error'
        //             }
        //         }
        //     });
        // }
    }

    async initialize() {
        this.setState({
            status: AsyncProcessStatus.PENDING
        });

        try {
            const value = await this.fetchOptions();
            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value
            })
        } catch (ex) {
            this.setState({
                status: AsyncProcessStatus.ERROR,
                error: {
                    message: ex instanceof Error ? ex.message : 'Unknown Error'
                }
            });
        }
    }

    async fetchOptions(): Promise<Array<OptionValue<string>>> {
        const { token, serviceWizardURL, timeout } = this.props;
        const client = new JobBrowserBFFClient({
            token,
            url: serviceWizardURL,
            timeout,
            version: this.props.jobBrowserBFFConfig.version
        });
        const clientGroups = await client.get_client_groups();
        const clientGroupOptions = clientGroups.client_groups
            .map((clientGroup) => {
                return {
                    value: clientGroup,
                    label: clientGroup
                };
            })
            .sort((a, b) => {
                return a.label.localeCompare(b.label);
            });
        return clientGroupOptions;
    }

    renderLoading() {
        return <Spin />;
    }

    renderError(error: SimpleError) {
        return <Alert type="error" message={error.message} />;
    }

    render() {
        switch (this.state.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.SUCCESS:
                return <View
                    onChange={this.props.onChange}
                    options={this.state.value}
                    defaultValue={this.props.defaultValue}
                />;
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.error);
        }
    }
}