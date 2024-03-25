import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { SimpleError } from 'lib/SimpleError';
import React from 'react';
// import NarrativeMethodStoreClient from '../../../lib/comm/coreServices/NarrativeMethodStore';
import NarrativeMethodStoreClient from 'lib/kb_lib/comm/coreServices/NarrativeMethodStore';
import { OptionValue } from '../../../lib/types';
import View, { AppFunctionSelectProps } from './view';

/* For Component */
export interface DataProps {
    token: string;
    username: string;
    nmsURL: string;
    timeout: number;
}

// type TheProps = Omit<DataProps & FilterEditorProps, "narratives">;
type TheProps = Omit<DataProps & AppFunctionSelectProps, "options">;

interface AppFunctionSelectData {
    options: Array<OptionValue<string>>;
}

type AppFunctionSelectState = AsyncProcess<AppFunctionSelectData, SimpleError>;

export default class AppFunctionSelect extends React.Component<TheProps, AppFunctionSelectState> {
    constructor(props: TheProps) {
        super(props);
        this.state = {
            status: AsyncProcessStatus.NONE
        };
    }

    componentDidMount() {
        this.initialize();
    }

    async initialize() {
        this.setState({
            status: AsyncProcessStatus.PENDING
        });

        try {
            const options = await this.fetchOptions();
            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    options
                }
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
        const { token, nmsURL, timeout } = this.props;
        const client = new NarrativeMethodStoreClient({
            token,
            url: nmsURL,
            timeout
        });
        const apps = await client.list_methods({});
        const optionsMap = apps
            .reduce((options, app) => {
                const { id } = app;

                let [moduleId, functionId] = id.split('/');

                if (typeof functionId === 'undefined') {
                    functionId = moduleId;
                    moduleId = 'unknown';
                }

                const option = options.get(functionId);
                if (!option) {
                    const newOption = new Set([moduleId]);
                    options.set(functionId, newOption);
                } else {
                    option.add(moduleId);
                }

                return options;
            }, new Map<string, Set<string>>());

        const options = Array.from(optionsMap.entries())
            .map(([key, value]) => {
                return {
                    value: key,
                    label: `${key} (${Array.from(value.values()).join(', ')})`
                };
            })
            .sort((a, b) => {
                return a.label.localeCompare(b.label);
            });
        return options;
    }

    render() {
        switch (this.state.status)  {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <Loading message="Loading App Modules..." type='inline' />
            case AsyncProcessStatus.ERROR:
                return <ErrorAlert message={this.state.error.message} />
            case AsyncProcessStatus.SUCCESS:
                return <View
                onChange={this.props.onChange}
                options={this.state.value.options}
                defaultValue={this.props.defaultValue}
            />;
        }
    }
}