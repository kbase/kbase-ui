import {
    Citation, Contributor, ExternalId,
    LinkRecord, SelfContributor, Work
} from 'apps/ORCIDLink/lib/ORCIDLinkClient';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { StaticNarrative } from 'lib/clients/StaticNarrative';
import Workspace from 'lib/kb_lib/comm/coreServices/Workspace';
import { Component } from 'react';
import { Config } from 'types/config';
import { NumberRangeType, StorageStatus, Trinary, ValueStatus } from '../fields/Field';
import { StringArrayField, StringArrayFieldUtil } from '../fields/StringArrayField';
import { StringConstraintType, StringField, StringFieldUtil } from '../fields/StringField';
import { URLField, URLFieldUtil } from '../fields/URLFIeld';
import { Model } from '../Model';
import { formatDate } from '../utils';
import { CitationGroup, CitationGroupUtil } from '../workFields/CitationGroup';
import { ContributorGroup, ContributorGroupUtil } from '../workFields/ContributorGroup';
import { ExternalIdGroup, ExternalIdGroupUtil } from '../workFields/ExternalIdGroup';
import { OtherContributorsGroup, OtherContributorsGroupUtil } from '../workFields/OtherContributorsGroup';
import { OtherExternalIdsGroup, OtherExternalIdsGroupUtil } from '../workFields/OtherExternalIdsGroup';
import { SelfContributorGroup, SelfContributorGroupUtil } from '../workFields/SelfContributorGroup';
import { WorkGroup, WorkGroupUtil } from '../workFields/WorkGroup';
import EditWork from './EditWork';

export interface ControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    workspaceId: number;
    // putCode: string;
    orcidLink: LinkRecord;
    setTitle: (title: string) => void;
}

export type GetWorkResult = {
    result: Work;
};

export interface DataState {
    work: WorkGroup;
}

interface ControllerState {
    dataState: AsyncProcess<DataState, { message: string }>;
}

function createCitationValueField(value: string): StringField {
    return new StringFieldUtil({
        isRequired: true,
        constraint: {
            type: StringConstraintType.LENGTH,
            minLength: {
                rangeType: NumberRangeType.INCLUSIVE,
                value: 10
            },
            maxLength: {
                rangeType: NumberRangeType.INCLUSIVE,
                value: 250
            }
        },
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value
        },
        pendingValue: {
            status: ValueStatus.SOME,
            value
        },
        storageValue: {
            status: ValueStatus.SOME,
            value
        }
    }).evaluate();
}

function createCitationTypeField(value: string): StringField {
    return new StringFieldUtil({
        isRequired: true,
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        // TODO: create constraint to require it is in the available options.
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value
        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value
        },
    }).evaluate(true);
}

function citationToCitationFieldGroup(citation: Citation): CitationGroup {
    return new CitationGroupUtil({
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        isRequired: true,
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value: {
                // TODO: each field should have a "factory" function to create an
                // editor in a fresh state based on a given value.
                type: createCitationTypeField(citation.type),
                value: createCitationValueField(citation.value)
            }
        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value: {
                type: citation.type,
                value: citation.value
            }
        },
    }).evaluate();
}


function createORCIDIdField(value: string, isRequired: boolean): StringField {
    return new StringFieldUtil({
        isRequired,
        constraint: {
            type: StringConstraintType.PATTERN,
            regexp: /^\d{4}-\d{4}-\d{4}-\d{4}$/
        },
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        // TODO: create constraint to require it is in the available options.
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value
        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value
        },
    }).evaluate();
}

function createNameField(value: string): StringField {
    return new StringFieldUtil({
        isRequired: true,
        constraint: {
            type: StringConstraintType.LENGTH,
            minLength: {
                rangeType: NumberRangeType.INCLUSIVE,
                value: 2
            },
            maxLength: {
                rangeType: NumberRangeType.INCLUSIVE,
                value: 50
            }
        },
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        // TODO: create constraint to require it is in the available options.
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value
        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value
        },
    }).evaluate();
}

function createRolesField(value: Array<string>): StringArrayField {
    return new StringArrayFieldUtil({
        isRequired: true,
        constraint: {
            minLength: {
                rangeType: NumberRangeType.INCLUSIVE,
                value: 1
            },
            maxLength: {
                rangeType: NumberRangeType.INCLUSIVE,
                value: 100
            }
        },
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        // TODO: create constraint to require it is in the available options.
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value
        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value
        },
    }).evaluate();
}

function createSelfContributorGroup(selfContributor: SelfContributor): SelfContributorGroup {
    return new SelfContributorGroupUtil({
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        isRequired: true,
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value: {
                // TODO: each field should have a "factory" function to create an
                // editor in a fresh state based on a given value.
                orcidId: createORCIDIdField(selfContributor.orcidId, true),
                name: createNameField(selfContributor.name),
                roles: createRolesField(selfContributor.roles)
            }
        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value: {
                orcidId: selfContributor.orcidId,
                name: selfContributor.name,
                roles: selfContributor.roles
            }
        },
    }).evaluate();
}

export function createContributorGroup(contributor: Contributor): ContributorGroup {
    return new ContributorGroupUtil({
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        isRequired: true,
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value: {
                // TODO: each field should have a "factory" function to create an
                // editor in a fresh state based on a given value.
                orcidId: createORCIDIdField(contributor.orcidId || '', false), // TODO: un-cheese-it
                name: createNameField(contributor.name),
                roles: createRolesField(contributor.roles)
            }
        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value: {
                orcidId: contributor.orcidId,
                name: contributor.name,
                roles: contributor.roles
            }
        },
    }).evaluate();
}

function createOtherContributorsGroup(otherContributors: Array<Contributor>): OtherContributorsGroup {
    return new OtherContributorsGroupUtil({
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        isRequired: false,
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value: otherContributors.map((contributor): ContributorGroup => {
                return createContributorGroup(contributor);
            })

        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value: otherContributors
        },
    }).evaluate();
}

function createExternalIdTypeField(value: string): StringField {
    return new StringFieldUtil({
        isRequired: true,
        constraint: {
            type: StringConstraintType.LENGTH,
            minLength: {
                rangeType: NumberRangeType.INCLUSIVE,
                value: 2
            },
            maxLength: {
                rangeType: NumberRangeType.INCLUSIVE,
                value: 50
            }
        },
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        // TODO: create constraint to require it is in the available options.
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value
        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value
        },
    }).evaluate();
}

function createExternalIdValueField(value: string): StringField {
    return new StringFieldUtil({
        isRequired: true,
        constraint: {
            type: StringConstraintType.LENGTH,
            minLength: {
                rangeType: NumberRangeType.INCLUSIVE,
                value: 2
            },
            maxLength: {
                rangeType: NumberRangeType.INCLUSIVE,
                value: 50
            }
        },
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        // TODO: create constraint to require it is in the available options.
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value
        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value
        },
    }).evaluate();
}

function createExternalIdURLField(value: string): URLField {
    return new URLFieldUtil({
        isRequired: true,

        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        // TODO: create constraint to require it is in the available options.
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value
        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value
        },
    }).evaluate();
}

function createExternalIdRelationshipField(value: string): StringField {
    return new StringFieldUtil({
        isRequired: true,
        constraint: {
            type: StringConstraintType.LENGTH,
            minLength: {
                rangeType: NumberRangeType.INCLUSIVE,
                value: 2
            },
            maxLength: {
                rangeType: NumberRangeType.INCLUSIVE,
                value: 50
            }
        },
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        // TODO: create constraint to require it is in the available options.
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value
        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value
        },
    }).evaluate();
}

export function createExternalIdGroup({ type, value, url, relationship }: ExternalId): ExternalIdGroup {
    return new ExternalIdGroupUtil({
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        isRequired: true,
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value: {
                type: createExternalIdTypeField(type),
                value: createExternalIdValueField(value),
                url: createExternalIdURLField(url),
                relationship: createExternalIdRelationshipField(relationship)
            }
        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value: {
                type, value, url, relationship
            }
        },
    }).evaluate();
}

function createOtherExternalIdsGroup(otherExternalIds: Array<ExternalId>): OtherExternalIdsGroup {
    return new OtherExternalIdsGroupUtil({
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        isRequired: false,
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value: otherExternalIds.map((externalId): ExternalIdGroup => {
                return createExternalIdGroup(externalId);
            })

        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value: otherExternalIds
        },
    }).evaluate()
}

function createTitleField(value: string): StringField {
    return new StringFieldUtil({
        isRequired: true,
        constraint: {
            type: StringConstraintType.LENGTH,
            minLength: {
                rangeType: NumberRangeType.INCLUSIVE,
                value: 5
            },
            maxLength: {
                rangeType: NumberRangeType.INCLUSIVE,
                value: 100
            }
        },
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value
        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value
        },
    }).evaluate();
}

function createJournalField(value: string): StringField {
    return new StringFieldUtil({
        isRequired: true,
        constraint: {
            type: StringConstraintType.LENGTH,
            minLength: {
                rangeType: NumberRangeType.INCLUSIVE,
                value: 2
            },
            maxLength: {
                rangeType: NumberRangeType.INCLUSIVE,
                value: 50
            }
        },
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value
        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value
        },
    }).evaluate();
}

function createDateField(value: string): StringField {
    return new StringFieldUtil({
        isRequired: true,
        constraint: {
            type: StringConstraintType.PATTERN,
            regexp: /^\d{4}\/\d{1,2}\/\d{1,2}$/
        },
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value
        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value
        },
    }).evaluate()
}

function createDOIField(value: string): StringField {
    return new StringFieldUtil({
        isRequired: true,
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value
        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value
        },
    }).evaluate()
}


function createURLField(value: string): URLField {
    return new URLFieldUtil({
        isRequired: true,
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value
        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value
        },
    }).evaluate();
}

function createShortDescriptionField(shortDescription: string): StringField {
    return new StringFieldUtil({
        isRequired: true,
        constraint: {
            type: StringConstraintType.LENGTH,
            minLength: {
                rangeType: NumberRangeType.INCLUSIVE,
                value: 5
            },
            maxLength: {
                rangeType: NumberRangeType.INCLUSIVE,
                value: 250
            }
        },
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value: shortDescription
        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value: shortDescription
        },
    }).evaluate();
}

function workToWorkFieldGroup(work: Work): WorkGroup {
    const citation = work.citation;
    // TODO: resolve this.
    if (citation === null) {
        throw new Error('Citation cannot be null!');
    }
    return new WorkGroupUtil({
        constraintState: {
            isConstraintMet: Trinary.NONE,
        },
        isRequired: true,
        isTouched: false,
        isRequiredMet: Trinary.NONE,
        storageStatus: StorageStatus.NONE,
        editValue: {
            status: ValueStatus.SOME,
            value: {
                // TODO: each field should have a "factory" function to create an
                // editor in a fresh state based on a given value.
                journal: createJournalField(work.journal),
                date: createDateField(work.date),
                url: createURLField(work.url),
                title: createTitleField(work.title),
                shortDescription: createShortDescriptionField(work.shortDescription),
                citation: citationToCitationFieldGroup(citation),
                selfContributor: createSelfContributorGroup(work.selfContributor),
                otherContributors: createOtherContributorsGroup(work.otherContributors || []),
                doi: createDOIField(work.doi),
                otherExternalIds: createOtherExternalIdsGroup(work.externalIds)
            }
        },
        pendingValue: {
            status: ValueStatus.NONE
        },
        storageValue: {
            status: ValueStatus.SOME,
            value: {
                journal: work.journal,
                date: work.date,
                url: work.url,
                title: work.title,
                shortDescription: work.shortDescription,
                citation,
                selfContributor: work.selfContributor,
                otherContributors: work.otherContributors || [],
                doi: work.doi,
                externalIds: work.externalIds
            }
        },
    }).evaluate()
}


// function workFieldGroupToWorkUpdate(workField: WorkGroup, work: Work): WorkUpdate {
//     if (workField.editValue.status !== ValueStatus.SOME ||
//         workField.constraintState.isConstraintMet !== Trinary.TRUE ||
//         workField.isRequiredMet !== Trinary.TRUE) {
//         throw new Error('Invalid state for form data');
//     }

//     const title = extractStringFieldValue(workField.editValue.value.title);
//     const date = extractStringFieldValue(workField.editValue.value.date);
//     const journal = extractStringFieldValue(workField.editValue.value.journal);
//     const url = extractURLFieldValue(workField.editValue.value.url);
//     const doi = extractStringFieldValue(workField.editValue.value.doi);
//     const shortDescription = extractStringFieldValue(workField.editValue.value.shortDescription);



//     return {
//         putCode: work.putCode,
//         workType: work.workType,
//         title, date, journal, url, doi, shortDescription,
//         externalIds
//     }
// }



export default class Controller extends Component<ControllerProps, ControllerState> {
    model: Model;
    constructor(props: ControllerProps) {
        super(props);
        this.model = new Model({ config: this.props.config, auth: this.props.auth });
        this.state = {
            dataState: {
                status: AsyncProcessStatus.NONE,
            },
        };
    }

    // Component Lifecycle

    componentDidMount() {
        this.loadData();
    }

    // componentDidUpdate(prevProps: ControllerProps, prevState: ControllerState) {
    //     if (prevProps.putCode !== this.props.putCode) {
    //         this.loadData();
    //     }
    // }

    // Model interaction

    // async saveWork(work: WorkGroup) {
    //     if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //         return;
    //     }

    //     // const rawWork = await this.model.getWork(this.props.putCode);

    //     // const work = workToWorkFieldGroup(rawWork);
    //     // const work = await this.model.saveWork(updatedWork);

    //     this.setState({
    //         dataState: {
    //             ...this.state.dataState,
    //             value: {
    //                 ...this.state.dataState.value,
    //                 work,
    //             },
    //         },
    //     });
    // }

    // workGroupToWorkUpdate(workGroup: WorkGroup, rawWork: Wo)


    async saveWork() {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }

        const workGroup = this.state.dataState.value.work;


        // const { putCode, workType } = await this.model.getWork(this.props.putCode);

        // const updatedWork = this.workGroupToWorkUpdate(workGroup, rawWork);
        const updatedWork = new WorkGroupUtil(workGroup).getPendingValue()
        const work = await this.model.createWork2({
            ...updatedWork,
            // TODO: temp hack
            // need to add workType to the fields, or some other way.
            workType: 'data-set'
        });

        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    work: workGroup,
                },
            },
        });
    }

    // TODO: use another async state with REPROCESSING state to handle
    // running the process after success. Hmm, should probably have a similar
    // state for error, but that is quite edgey.
    // async reLoadData() {
    //     await new Promise((resolve) => {
    //         this.setState(
    //             {
    //                 dataState: {
    //                     status: AsyncProcessStatus.PENDING,
    //                 },
    //             },
    //             () => {
    //                 resolve(null);
    //             }
    //         );
    //     });
    //     try {
    //         const rawWork = await this.model.getWork(this.props.putCode);

    //         const work = workToWorkFieldGroup(rawWork);

    //         this.setState({
    //             dataState: {
    //                 status: AsyncProcessStatus.SUCCESS,
    //                 value: { work },
    //             },
    //         });
    //     } catch (ex) {
    //         console.error(ex);
    //         if (ex instanceof Error) {
    //             this.setState({
    //                 dataState: {
    //                     status: AsyncProcessStatus.ERROR,
    //                     error: {
    //                         message: ex.message,
    //                     },
    //                 },
    //             });
    //         } else {
    //             this.setState({
    //                 dataState: {
    //                     status: AsyncProcessStatus.ERROR,
    //                     error: {
    //                         message: `Unknown error: ${String(ex)}`,
    //                     },
    //                 },
    //             });
    //         }
    //     }
    // }

    async loadData() {
        await new Promise((resolve) => {
            this.setState(
                {
                    dataState: {
                        status: AsyncProcessStatus.PENDING,
                    },
                },
                () => {
                    resolve(null);
                }
            );
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
            const { ws_id: narrativeId, version: narrativeVersion, static_saved: narrativeSaved } = await staticNarrativeService.get_static_narrative_info({
                ws_id: this.props.workspaceId,
            });

            const model = new Model({
                config: this.props.config,
                auth: this.props.auth,
            });

            const profile = await model.getORCIDProfile();

            const name = profile.creditName || `${profile.firstName} ${profile.lastName}`;

            const url = `${this.props.config.deploy.ui.origin}/n/${narrativeId}/${narrativeVersion}`;

            // const rawWork = await this.model.getWork(this.props.putCode);
            const emptyWork: Work = {
                journal: 'DOE KBase',
                date: formatDate(new Date(narrativeSaved)),
                url: 'https://ci.kbase.us',
                title: workspaceInfo.metadata['narrative_nice_name'],
                shortDescription: '',
                citation: {
                    type: '',
                    value: ''
                },
                selfContributor: {
                    name,
                    orcidId: profile.orcidId,
                    roles: []
                },
                otherContributors: [],
                doi: workspaceInfo.metadata['doi'],
                externalIds: [],
                source: '',
                workType: 'data-set',

                // not used, but need for compatibility 
                putCode: '',
                updatedAt: 0,
                createdAt: 0
            }
            const work = workToWorkFieldGroup(emptyWork);
            this.setState({
                dataState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: { work },
                },
            });
        } catch (ex) {
            console.error(ex);
            if (ex instanceof Error) {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message,
                        },
                    },
                });
            } else {
                this.setState({
                    dataState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: `Unknown error: ${String(ex)}`,
                        },
                    },
                });
            }
        }
    }

    async onDelete(putCode: string) { }

    updateWorkGroup(work: WorkGroup) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }

        this.setState({
            dataState: {
                ...this.state.dataState,
                value: { work },
            },
        });
    }

    // Renderers

    renderLoading() {
        return <Loading message="Loading ORCID Work Activity Record ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />;
    }

    renderSuccess(dataState: DataState) {
        const canSave = (
            dataState.work.isRequiredMet === Trinary.TRUE &&
            dataState.work.constraintState.isConstraintMet === Trinary.TRUE
        )

        return (
            <EditWork
                work={dataState.work}
                canSave={canSave}
                update={this.updateWorkGroup.bind(this)}
                save={this.saveWork.bind(this)}
            />
        );
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
