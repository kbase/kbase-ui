import { SelfContributor, Work } from 'apps/ORCIDLink/lib/ORCIDLinkClient';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { StaticNarrative } from 'lib/clients/StaticNarrative';
import Workspace from 'lib/kb_lib/comm/coreServices/Workspace';
import { Component } from 'react';
import { Config } from 'types/config';
import {
    contributorsToEditableContributors, EditableWork,
    EditStatus,
    Model,
    selfContributorToEditableContributor,
    ValidationStatus,
    workToEditableWork
} from '../Model';
import Editor from './Editor';

// Work types
// TODO: move to external file.

export interface WorkType {
    category: string;
    value: string;
    label: string;
    description: string;
}

export interface WorkTypeCategory {
    value: string;
    label: string;
}

export interface WorkTypes {
    categories: Array<WorkTypeCategory>;
    values: Array<WorkType>;
}

export interface PrefillData {
    title: string;
    date: Date;
    workspaceId: number;
    version: number;
    doi: string;
    orcidId: string;
    name: string;
}

// Component

export interface ControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    setTitle: (title: string) => void;
    workspaceId: number;
    objectVersion: number;
}

// export enum LinkStatus {
//     NONE = 'NONE',
//     LINKED = 'LINKED'
// }

export type GetWorkResult = {
    result: Work;
};

export interface DataState {
    work: EditableWork;
}
function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDay()).padStart(2, '0');

    return `${year}/${month}/${day}`;
}

// export type LinkState = AsyncProcess<{ link: LinkInfo | null }, { message: string }>

interface ControllerState {
    dataState: AsyncProcess<DataState, { message: string }>;
}

export default class Controller extends Component<ControllerProps, ControllerState> {
    model: Model;
    constructor(props: ControllerProps) {
        super(props);
        this.state = {
            dataState: {
                status: AsyncProcessStatus.NONE,
            },
        };
        this.model = new Model({ config: this.props.config, auth: this.props.auth });
    }

    componentDidMount() {
        this.props.setTitle('Narrative Publication Manager | Add ORCID Work Record');
        this.loadData();
    }

    // Model interaction

    async createWork(newWork: EditableWork) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        const work = await this.model.createWork(newWork);

        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    work: workToEditableWork(work),
                },
            },
        });
    }

    // async syncWork(): Promise<void> {
    //     const work = await this.model.getEditableWork(this.props.putCode);
    //     this.setState({
    //         dataState: {
    //             status: AsyncProcessStatus.SUCCESS,
    //             value: { work }
    //         }
    //     });
    // }

    createPrefilledEditableWork({
        workspaceId,
        version,
        title,
        date,
        doi,
        orcidId,
        name,
    }: PrefillData): EditableWork {
        const url = `${this.props.config.deploy.ui.origin}/n/${workspaceId}/${version}`;
        const dateString = formatDate(date);
        // TODO: fill from prefill data
        const selfContributor: SelfContributor = {
            name,
            orcidId,
            roles: [],
        };
        return {
            putCode: {
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID,
                },
                editValue: '',
                value: '',
                hasRemote: false,
                initialValue: ''
            },
            workType: {
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID,
                },
                editValue: 'data-set',
                value: 'data-set',
                hasRemote: false,
                initialValue: ''
            },
            title: {
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID,
                },
                editValue: title,
                value: title,
                hasRemote: false,
                initialValue: ''
            },
            date: {
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID,
                },
                editValue: dateString,
                value: dateString,
                hasRemote: false,
                initialValue: ''
            },
            journal: {
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID,
                },
                editValue: 'DOE KBase',
                value: 'DOE KBase',
                hasRemote: false,
                initialValue: ''
            },
            url: {
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID,
                },
                editValue: url,
                value: url,
                hasRemote: false,
                initialValue: ''
            },
            doi: {
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID,
                },
                editValue: doi,
                value: doi,
                hasRemote: false,
                initialValue: ''
            },
            externalIds: {
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID,
                },
                editValue: [],
                value: [],
                hasRemote: false,
                initialValue: []
            },
            citation: {
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID,
                },
                editValue: {
                    type: {
                        status: EditStatus.INITIAL,
                        validationState: {
                            status: ValidationStatus.VALID,
                        },
                        editValue: '',
                        value: '',
                        hasRemote: false,
                        initialValue: ''
                    },
                    value: {
                        status: EditStatus.INITIAL,
                        validationState: {
                            status: ValidationStatus.VALID,
                        },
                        editValue: '',
                        value: '',
                        hasRemote: false,
                        initialValue: ''
                    },
                },
                value: {
                    type: '',
                    value: '',
                },
                hasRemote: false,
                initialValue: {
                    type: '',
                    value: '',
                }
            },
            shortDescription: {
                status: EditStatus.INITIAL,
                validationState: {
                    status: ValidationStatus.VALID,
                },
                editValue: '',
                value: '',
                hasRemote: false,
                initialValue: ''
            },
            selfContributor: selfContributorToEditableContributor(selfContributor),
            // TODO: prefill with current user.
            otherContributors: contributorsToEditableContributors([]),
        };
    }

    async loadData() {
        this.setState({
            dataState: {
                status: AsyncProcessStatus.PENDING,
            },
        });

        try {
            const client = new Workspace({
                url: this.props.config.services.Workspace.url,
                timeout: this.props.config.ui.constants.clientTimeout,
                token: this.props.auth.authInfo.token,
            });
            const staticNarrativeService = new StaticNarrative({
                url: this.props.config.services.ServiceWizard.url,
                timeout: this.props.config.ui.constants.clientTimeout,
                token: this.props.auth.authInfo.token,
            });
            const workspaceInfo = await client.get_workspace_info({ id: this.props.workspaceId });
            // const firstObjectInfo = await client.get_object_info3({
            //     objects: [
            //         {
            //             wsid: this.props.workspaceId,
            //             objid: parseInt(workspaceInfo.metadata['narrative']),
            //             ver: 1,
            //         },
            //     ],
            // });
            // const doi_version = (() => {
            //     if ('doi_version' in workspaceInfo.metadata) {
            //         return parseInt(workspaceInfo.metadata['doi_version']);
            //     }
            //     return null;
            // })();
            const staticNarrative = await staticNarrativeService.get_static_narrative_info({
                ws_id: this.props.workspaceId,
            });

            const model = new Model({
                config: this.props.config,
                auth: this.props.auth,
            });

            const profile = await model.getORCIDProfile();

            const name = profile.creditName || `${profile.firstName} ${profile.lastName}`;

            // create pre-filled editable work
            this.setState({
                dataState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        work: this.createPrefilledEditableWork({
                            title: workspaceInfo.metadata['narrative_nice_name'],
                            workspaceId: staticNarrative.ws_id,
                            version: staticNarrative.version,
                            date: new Date(staticNarrative.static_saved),
                            doi: workspaceInfo.metadata['doi'],
                            name,
                            orcidId: profile.orcidId,
                        }),
                    },
                },
            });
        } catch (ex) {
            const message = (() => {
                if (ex instanceof Error) {
                    return ex.message;
                }
                return 'Unknown';
            })();
            this.setState({
                dataState: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message,
                    },
                },
            });
        }

        // this.setState({
        //     dataState: {
        //         status: AsyncProcessStatus.SUCCESS,
        //         value: {
        //             work: initialEditableWork()
        //         }
        //     }
        // })
        // await new Promise((resolve) => {
        //     this.setState({
        //         dataState: {
        //             status: AsyncProcessStatus.PENDING
        //         }
        //     }, () => {
        //         resolve(null);
        //     });
        // });
        // try {
        //     await this.syncWork();
        // } catch (ex) {
        //     if (ex instanceof Error) {
        //         this.setState({
        //             dataState: {
        //                 status: AsyncProcessStatus.ERROR,
        //                 error: {
        //                     message: ex.message
        //                 }
        //             }
        //         });
        //     } else {
        //         this.setState({
        //             dataState: {
        //                 status: AsyncProcessStatus.ERROR,
        //                 error: {
        //                     message: `Unknown error: ${String(ex)}`
        //                 }
        //             }
        //         });
        //     }
        // }
    }

    // Renderers

    renderLoading() {
        return <Loading message="Loading ORCID Work Activity Record ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />;
    }

    renderSuccess(dataState: DataState) {
        return <Editor work={dataState.work} onSave={this.createWork.bind(this)} />;
    }

    render() {
        switch (this.state.dataState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.dataState.error);
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.dataState.value);
        }
    }
}
