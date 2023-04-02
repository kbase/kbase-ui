import {
    Citation, Contributor, ContributorRole, ExternalId,
    LinkRecord, SelfContributor, Work
} from 'apps/ORCIDLink/lib/ORCIDLinkClient';
import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AuthenticationStateAuthenticated } from 'contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Config } from 'types/config';
import { Model } from '../Model';
import EditWork from './EditWork';
// import WorkEditor from './editors/WorkEditor';
// import EditWork from './EditWork-ver2';
import { NumberRangeType, StorageStatus, Trinary, ValueStatus } from '../fields/Field';
import { StringConstraintType, StringField, StringFieldUtil } from '../fields/StringField';
import { URLField, URLFieldUtil } from '../fields/URLFIeld';
import { CitationGroup, CitationGroupUtil } from '../workFields/CitationGroup';
import { ContributorGroup, ContributorGroupUtil } from '../workFields/ContributorGroup';
import { ContributorRoleArrayField, ContributorRoleArrayFieldUtil } from '../workFields/ContributorRoleArrayField';
import { ExternalIdGroup, ExternalIdGroupUtil } from '../workFields/ExternalIdGroup';
import { OtherContributorsGroup, OtherContributorsGroupUtil } from '../workFields/OtherContributorsGroup';
import { OtherExternalIdsGroup, OtherExternalIdsGroupUtil } from '../workFields/OtherExternalIdsGroup';
import { SelfContributorGroup, SelfContributorGroupUtil } from '../workFields/SelfContributorGroup';
import { WorkGroup, WorkGroupUtil } from '../workFields/WorkGroup';

export interface ControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    putCode: string;
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
    }).evaluate();
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

function createRolesField(value: Array<ContributorRole>): ContributorRoleArrayField {
    return new ContributorRoleArrayFieldUtil({
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

    componentDidUpdate(prevProps: ControllerProps, prevState: ControllerState) {
        if (prevProps.putCode !== this.props.putCode) {
            this.loadData();
        }
    }

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


        const { putCode, workType } = await this.model.getWork(this.props.putCode);

        // const updatedWork = this.workGroupToWorkUpdate(workGroup, rawWork);
        const updatedWork = new WorkGroupUtil(workGroup).getPendingValue()
        const work = await this.model.saveWork2({
            ...updatedWork,
            putCode, workType
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
    async reLoadData() {
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
            const rawWork = await this.model.getWork(this.props.putCode);

            const work = workToWorkFieldGroup(rawWork);

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
            const rawWork = await this.model.getWork(this.props.putCode);
            const work = workToWorkFieldGroup(rawWork);
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
            dataState.work.constraintState.isConstraintMet === Trinary.TRUE &&
            dataState.work.isTouched
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
