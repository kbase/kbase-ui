import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { SimpleError } from 'lib/SimpleError';
import { Component } from 'react';
// import NarrativeMethodStoreClient from '../../../lib/comm/coreServices/NarrativeMethodStore';
import NarrativeMethodStoreClient from 'lib/kb_lib/comm/coreServices/NarrativeMethodStore';
import { OptionValue } from '../../../lib/types';
import View, { AppSelectProps } from './view';

/* For Component */
export interface DataProps {
    token: string;
    username: string;
    nmsURL: string;
    timeout: number;
}

// type TheProps = Omit<DataProps & FilterEditorProps, "narratives">;
type TheProps = Omit<DataProps & AppSelectProps, "options">;

// interface DataState {
//     options: Array<OptionValue<string>> | null;
// }

export interface AppSelect {
    options: Array<OptionValue<string>>
}

type AppSelectControllerState = AsyncProcess<AppSelect, SimpleError>

export default class AppSelectController extends Component<TheProps, AppSelectControllerState> {
    // stopped: boolean;
    constructor(props: TheProps) {
        super(props);
        this.state = {
            status: AsyncProcessStatus.NONE
        };
        // this.stopped = false;
    }

    // componentWillUnmount() {
    //     this.stopped = true;
    // }

    componentDidMount() {
        this.initialize();
        // const options = await this.fetchOptions();
        // if (!this.stopped) {
        //     this.setState({
        //         options
        //     });
        // }
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
            })
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
        const appOptions = apps
            .map((app) => {
                const { id, name, module_name } = app;

                return {
                    value: id,
                    label: `${name} (${module_name})`
                };
            })
            .sort((a, b) => {
                return a.label.localeCompare(b.label);
            });
        return appOptions;
    }

    render() {
        switch (this.state.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <Loading message="Loading Apps..." type='inline' />
            case AsyncProcessStatus.ERROR:
                return <ErrorAlert message={this.state.error.message} />
            case AsyncProcessStatus.SUCCESS:
                return <View
                onChange={this.props.onChange}
                options={this.state.value.options}
                defaultValue={this.props.defaultValue}
            />
        }
    }
}
