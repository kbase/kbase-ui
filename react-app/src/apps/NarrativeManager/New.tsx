import { Component } from 'react';
import ErrorView from '../../components/ErrorView';
import { RouteProps } from '../../components/Router2';
import { AuthInfo } from '../../contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from '../../lib/AsyncProcess';
import { CreateNewNarrativeParams, NarrativeService } from '../../lib/clients/NarrativeService';
import { Config } from '../../types/config';
import NarrativeLoading from './NarrativeLoading';
import OpenNarrative from './OpenNarrative';

export interface NarrativeManagerNewProps extends RouteProps {
    config: Config;
    authInfo: AuthInfo;
    setTitle: (title: string) => void;
}

export type AppData = Array<[number, string, string]>;

export interface newNarrativeParams {
    importData?: Array<string>;
    method?: string;
    appData?: AppData;
    markdown: string;
}

type NarrativeManagerNewState = AsyncProcess<{workspaceID: number}, string>

export default class NarrativeManagerNew extends Component<
    NarrativeManagerNewProps,
    NarrativeManagerNewState
> {
    constructor(props: NarrativeManagerNewProps) {
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
            const workspaceID = await this.createNewNarrative()
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


    async createNewNarrative(): Promise<number> {
        if (this.props.params.has('app') && this.props.params.has('method')) {
            throw new Error('Must provide no more than one of the "app" or "method" params');
        }
        // let i;
        const newNarrativeParams: CreateNewNarrativeParams = {};
        if (this.props.params.has('copydata')) {
            newNarrativeParams.importData = this.props.params.get('copydata')!.split(';');
        }

        // Note that these are exclusive cell creation options.
        if (this.props.params.has('app') || this.props.params.has('method')) {
            newNarrativeParams.method = this.props.params.get('app') || this.props.params.get('method');
            if (this.props.params.has('appparam')) {
                const appParams = this.props.params.get('appparam')!.split(';');
                const appData: AppData = [];
                for (let i = 0; i < appParams.length; i += 1) {
                    const appParamRaw = appParams[i].split(',');
                    if (appParamRaw.length !== 3) {
                        throw new Error(
                            'Illegal app parameter set, expected 3 parameters separated by commas: ' + appParams[i],
                        );
                    }
                    /* TODO: use standard lib for math and string->number conversions) */
                    const appDataItem: [number, string, string] = [parseInt(appParamRaw[0], 10), appParamRaw[1], appParamRaw[2]];
                    // appData[i][0] = parseInt(appParamRaw[0], 10);
                    if (isNaN(appDataItem[0]) || appDataItem[0] < 1) {
                        throw new Error(
                            'Illegal app parameter set, first item in set must be an integer > 0: ' + appParams[i],
                        );
                    }
                    appData.push(appDataItem)
                }
                newNarrativeParams.appData = appData;
            }
        } else if (this.props.params.has('markdown')) {
            newNarrativeParams.markdown = this.props.params.get('markdown')!;
        }

        const token = this.props.authInfo.token;


        const narrativeServiceClient = new NarrativeService({
            token,
            timeout: 1000,
            url: this.props.config.services.ServiceWizard.url
        });

        newNarrativeParams.includeIntroCell = 1;

        const info =  await narrativeServiceClient.create_new_narrative(newNarrativeParams);
        return info.narrativeInfo.wsid;
    }

    render() {
        switch (this.state.status) {
        case AsyncProcessStatus.NONE:
        case AsyncProcessStatus.PENDING:
            return <NarrativeLoading message="Creating and opening a new narrative..." detectSlow={true}/>
        case  AsyncProcessStatus.ERROR:
            return <ErrorView title="Error">
                    <p>
                        Sorry, there was an error creating or opening a new narrative:
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
