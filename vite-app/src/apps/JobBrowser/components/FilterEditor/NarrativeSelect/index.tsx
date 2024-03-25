import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { SimpleError } from 'lib/SimpleError';
import { Component } from 'react';
// import { WorkspaceClient } from '../../../lib/comm/coreServices/Workspace';
import WorkspaceClient from 'lib/kb_lib/comm/coreServices/Workspace';
import { OptionValue } from '../../../lib/types';
import View, { NarrativeSelectProps } from './view';

/* For Component */
export interface DataProps {
    token: string;
    username: string;
    workspaceURL: string;
    timeout: number;
}

// type TheProps = Omit<DataProps & FilterEditorProps, "narratives">;
type TheProps = Omit<DataProps & NarrativeSelectProps, "narratives">;

export interface NarrativeSelectData {
    narratives: Array<OptionValue<number>>;
}

type DataState = AsyncProcess<NarrativeSelectData, SimpleError>


export default class NarrativeSelectController extends Component<TheProps, DataState> {
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
            const narratives = await this.fetchNarratives();
            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    narratives
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

    async fetchNarratives(): Promise<Array<OptionValue<number>>> {
        const { token, workspaceURL, timeout } = this.props;
        const client = new WorkspaceClient({
            token,
            url: workspaceURL,
            timeout
        });
        const workspaces = await client.list_workspace_info({});
        const narratives = workspaces
            .filter((workspace) => {
                const metadata = workspace[8];
                const { narrative, is_temporary } = metadata;
                if (!narrative) {
                    return false;
                }
                if (is_temporary === 'true') {
                    return false;
                }
                return true;
            })
            .map((workspace) => {
                const [id, , , , , , , , metadata] = workspace;
                return {
                    value: id,
                    label: metadata.narrative_nice_name
                };
            })
            .sort((a, b) => {
                return a.label.localeCompare(b.label);
            });
        return narratives;
    }

    render() {
        switch (this.state.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <Loading message="Loading Narratives..."  type='inline'/>
            case AsyncProcessStatus.ERROR:
                return <ErrorAlert message={this.state.error.message} />
            case AsyncProcessStatus.SUCCESS:
                return <View
                    onChange={this.props.onChange}
                    narratives={this.state.value.narratives}
                    defaultValue={this.props.defaultValue}
                />;
        }
    }
}