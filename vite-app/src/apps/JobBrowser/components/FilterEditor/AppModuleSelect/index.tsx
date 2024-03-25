import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { SimpleError } from 'lib/SimpleError';
import { Component } from 'react';
// import CatalogClient from '../../../lib/comm/coreServices/Catalog';
import CatalogClient from 'lib/kb_lib/comm/coreServices/Catalog';
import { OptionValue } from '../../../lib/types';
import View, { AppModuleSelectProps } from './view';

/* For Component */
export interface DataProps {
    token: string;
    username: string;
    catalogURL: string;
    timeout: number;
    // value: string; // actually, we propagate the props from the view up through the
    // controller.
    // clever? or too much?
}

// type TheProps = Omit<DataProps & FilterEditorProps, "narratives">;
type TheProps = Omit<DataProps & AppModuleSelectProps, "options">;

interface AppModuleData {
    options: Array<OptionValue<string>>;
}

type AppModuleSelectControllerState = AsyncProcess<AppModuleData, SimpleError>;

export default class AppModuleSelectController extends Component<TheProps, AppModuleSelectControllerState> {
    stopped: boolean;
    constructor(props: TheProps) {
        super(props);
        this.state = {
            status: AsyncProcessStatus.NONE
        };
        this.stopped = false;
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
        const { token, catalogURL, timeout } = this.props;
        const client = new CatalogClient({
            token,
            url: catalogURL,
            timeout
        });
        const modules = await client.list_basic_module_info({});
        const options = modules
            .map((module) => {
                const { module_name } = module;

                return {
                    value: module_name,
                    label: `${module_name}`
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
                    value={this.props.value}
                />;
        }
    }
}
