import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { StaticNarrative } from 'lib/clients/StaticNarrative';
import Workspace from 'lib/kb_lib/comm/coreServices/Workspace';
import { Component } from 'react';
import { Config } from 'types/config';
import View from './View';

export interface ControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    narrativeId: number;
    narrativeVersion: number;
    setTitle: (title: string) => void;
}

export interface NarrativeInfo {
    id: number;
    createdAt: number;
    lastSavedAt: number;
    title: string;
    abstract: string | null;
    doi: string | null;
    doi_version: number | null;
    publishedVersion: number;
    publishedAt: number;
}
 
export interface SimpleError {
    message: string;
}

export type NarrativeState = AsyncProcess<NarrativeInfo, SimpleError>

export interface DOIInfo {
    doi: string | null;
}

export type DOISaveState = AsyncProcess<DOIInfo, SimpleError>

interface ControllerState {
    narrativeState: NarrativeState;
    doiSaveState: DOISaveState;
}

export default class Controller extends Component<ControllerProps, ControllerState> {
    constructor(props: ControllerProps) {
        super(props);
        this.state = {
            narrativeState: {
                status: AsyncProcessStatus.NONE
            },
            doiSaveState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }
    async loadInitialData() {
        this.setState({
            narrativeState: {
                status: AsyncProcessStatus.PENDING
            }
        });
        try {
            const client = new Workspace({
                url: this.props.config.services.Workspace.url,
                timeout: this.props.config.ui.constants.clientTimeout,
                token: this.props.auth.authInfo.token
            });
            const staticNarrativeService = new StaticNarrative({
                url: this.props.config.services.ServiceWizard.url,
                timeout: this.props.config.ui.constants.clientTimeout,
                token: this.props.auth.authInfo.token
            });
            const workspaceInfo = await client.get_workspace_info({ id: this.props.narrativeId })
            const firstObjectInfo = await client.get_object_info3({
                objects: [{
                    wsid: this.props.narrativeId,
                    objid: parseInt(workspaceInfo.metadata['narrative']),
                    ver: 1
                }]
            });
            const doi_version = (() => {
                if ('doi_version' in workspaceInfo.metadata) {
                    return parseInt(workspaceInfo.metadata['doi_version']);
                }
                return null;
            })();
            const staticNarrative = await staticNarrativeService.get_static_narrative_info({
                ws_id: this.props.narrativeId
            });
            const narrativeInfo: NarrativeInfo = {
                id: workspaceInfo.id, 
                title: workspaceInfo.metadata['narrative_nice_name'],
                abstract: 'n/a',
                createdAt: firstObjectInfo.infos[0].savedAt,
                lastSavedAt: workspaceInfo.modifiedAt,
                doi: workspaceInfo.metadata['doi'],
                doi_version,
                publishedAt: staticNarrative.static_saved,
                publishedVersion: staticNarrative.version
            }
            this.setState({
                narrativeState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: narrativeInfo
                }
            })
        } catch (ex) {
            const message = (() => {
                if (ex instanceof Error) {
                    return ex.message
                } 
                return 'Unknown';
            })();
            this.setState({
                narrativeState: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message
                    }
                }
            })
        }
    }

    async saveDOI(doi: string|null, workspaceId: number, version: number) {
        this.setState({
            doiSaveState: {
                status: AsyncProcessStatus.PENDING
            }
        })
        try {
            const client = new Workspace({
                url: this.props.config.services.Workspace.url,
                timeout: this.props.config.ui.constants.clientTimeout,
                token: this.props.auth.authInfo.token
            });
            console.log('here', workspaceId, doi, version);
            if (doi === null) {
                await client.alter_workspace_metadata({
                    wsi: { id: workspaceId },
                    remove: ['doi', 'doi_version']
                });
            } else {
                await client.alter_workspace_metadata({
                    wsi: { id: workspaceId },
                    new: { doi: doi, doi_version: String(version) }
                });
            }
            this.loadInitialData();
            this.setState({
                doiSaveState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: { doi }
                }
            });
        } catch (ex) {
            console.error('oops', ex);
            const message = (() => {
                if (ex instanceof Error) {
                    return ex.message
                } 
                return 'Unknown';
            })();
            this.setState({
                doiSaveState: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message
                    }
                }
            })
        }

    }

    componentDidMount(): void {
        this.props.setTitle('Add DOI to Narrative');
        this.loadInitialData();
    }
    render() {
        return <View
            narrativeState={this.state.narrativeState}
            doiSaveState={this.state.doiSaveState}
            saveDOI={this.saveDOI.bind(this)}
        />
    }
}
