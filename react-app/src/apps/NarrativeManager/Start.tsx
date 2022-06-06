import { Component } from 'react';
import ErrorView from '../../components/ErrorView';
import { RouteProps } from '../../components/Router2';
import { AuthInfo } from '../../contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from '../../lib/AsyncProcess';
import { NarrativeService } from '../../lib/clients/NarrativeService';
import { Config } from '../../types/config';
import NarrativeLoading from './NarrativeLoading';
import { NarrativeManager } from './NarrativeManager';
import OpenNarrative from './OpenNarrative';

export interface NarrativeManagerStartProps extends RouteProps {
    config: Config;
    authInfo: AuthInfo;
    setTitle: (title: string) => void;
    app?: string;
    method?: string;
    appdata?: AppData;
}

export type AppData = Array<[number, string, string]>;

export interface newNarrativeParams {
    importData?: Array<string>;
    method?: string;
    appData?: AppData;
    markdown: string;
}

type NarrativeManagerStartState = AsyncProcess<{workspaceID: number}, string>

export default class NarrativeManagerStart extends Component<
    NarrativeManagerStartProps,
    NarrativeManagerStartState
> {
    constructor(props: NarrativeManagerStartProps) {
        super(props);
        this.state = {
            status: AsyncProcessStatus.NONE
        };
    }

    async componentDidMount() {
        this.props.setTitle('Creating and Opening New Narrative...');
        this.setState({
            status: AsyncProcessStatus.PENDING
        });
        try {
            const workspaceID = await this.startOrCreateNewNarrative()
            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {workspaceID},
            });
        } catch (ex) {
            this.setState({
                status: AsyncProcessStatus.ERROR,
                error: ex instanceof Error ? ex.message : 'Uknown Error'
            });
        }
    }


    async startOrCreateNewNarrative(): Promise<number> {
        const narrativeManager = new NarrativeManager({
            auth: this.props.authInfo, 
            config: this.props.config
        })
        const narrative = await narrativeManager.getMostRecentNarrative();

        if (narrative === null) {
            return this.createNewNarrative()
        }

        return narrative.workspaceInfo.id;
    }

    async createNewNarrative() {
        const token = this.props.authInfo.token;

        const narrativeServiceClient = new NarrativeService({
            token,
            timeout: 1000,
            url: this.props.config.services.ServiceWizard.url
        });

        const info =  await narrativeServiceClient.create_new_narrative({});
        return info.narrativeInfo.wsid;
    }

    render() {
        switch (this.state.status) {
        case AsyncProcessStatus.NONE:
        case AsyncProcessStatus.PENDING:
            return <NarrativeLoading message="Opening an existing or new narrative..." detectSlow={true}/>
        case  AsyncProcessStatus.ERROR:
            return <ErrorView title="Error">
                    <p>
                        Sorry, there was an error creating or opening a narrative:
                    </p>
                    <p>
                        ${this.state.error}
                    </p>
                </ErrorView>
        case AsyncProcessStatus.SUCCESS:
            return <OpenNarrative workspaceID={this.state.value.workspaceID} />
        }
    }
}
