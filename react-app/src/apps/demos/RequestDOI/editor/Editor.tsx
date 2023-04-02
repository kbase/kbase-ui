import AlertMessage from 'components/AlertMessage';
import { JSONObject } from 'lib/json';
import { toJSON } from 'lib/kb_lib/jsonLike';
import { Component } from 'react';
import { Button, Col, Row, Stack } from 'react-bootstrap';
import {
    Author,
    AuthorsImportSection,
    AuthorsSection,
    CitationImportResults,
    CitationResults, CitationsImportSection, CitationsSection, ContractNumbers, ContractsSection,
    DOIForm, DOIFormSections, DOIFormStatus,
    Description,
    DescriptionSection,
    NarrativeSection, ORCIDLinkSection, OSTISubmission, ReviewAndSubmitResult,
    ReviewAndSubmitSection,
    StepStatus
} from "../DOIRequestClient";
import { Model, StaticNarrativeSummary } from '../Model';
import AuthorsStep from '../sections/Authors/editor/AuthorsSectionController';
import AuthorsView from '../sections/Authors/viewer/AuthorsView';
import AuthorsImportSectionController, { ImportableAuthor } from '../sections/AuthorsImport/editor/AuthorsImportSectionController';
import { default as CitationsEditorController, default as CitationsSectionEditor } from '../sections/Citations/editor/CitationsEditorController';
import CitationsViewController from '../sections/Citations/viewer/CitationsViewController';
import CitationsImportEditor from '../sections/CitationsImport/editor/Controller';
import ContractNumbersFormController from '../sections/ContractNumbers/editor/ContractNumbersFormController';
import ContractNumbersView from '../sections/ContractNumbers/viewer/ContractNumbersViewer';
import DescriptionController from '../sections/Description/editor/Controller';
import DescriptionView from '../sections/Description/viewer/Viewer';
import ORCIDLink from '../sections/ORCIDLinkController';
import ReviewAndSubmitController from '../sections/ReviewAndSubmit/ReviewAndSubmitController';
import SelectNarrativeController from '../sections/SelectNarrative/editor/EditorController';
import SelectNarrativeViewController from '../sections/SelectNarrative/viewer/ViewerController';
import SubmissionController from '../submission/Controller';
import styles from './Editor.module.css';
import { ORCIDLinkState } from './EditorController';


export interface RequestDOIEditorProps {
    orcidState: ORCIDLinkState;
    model: Model;
    process?: JSONObject;
    doiForm: DOIForm;
    setTitle: (title: string) => void;
}
interface RequestDOIEditorState {
    doiForm: DOIForm
}

export default class RequestDOIEditor extends Component<RequestDOIEditorProps, RequestDOIEditorState> {
    constructor(props: RequestDOIEditorProps) {
        super(props);
        const { doiForm } = this.props;
        this.state = { doiForm };
    }

    renderStepTitle(step: number, title: string) {
        return <AlertMessage variant="info" style={{ fontWeight: 'bold', marginRight: '0.5em' }} title={`${step}. ${title}`} icon="square-o" />
    }

    renderDisabledStepTitle(step: number, title: string) {
        return <AlertMessage variant="warning" style={{ fontWeight: 'bold' }} title={`${step}. ${title}`} />
    }

    renderStepDoneTitle(step: number, title: string, onEdit?: () => void) {
        return <AlertMessage
            variant="success"
            style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '0' }}
            title={`${step}. ${title}`
            }
        >
            <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button
                    variant="outline-secondary"
                    style={{ border: 'none' }}
                    size="sm"
                    onClick={() => { if (onEdit) { onEdit(); } }}>
                    <span className="fa fa-edit" />
                </Button>
            </div>
        </AlertMessage>
    }

    renderStepPendingTitle(step: number, title: string) {
        return <AlertMessage variant="secondary" title={`${step}. ${title}`} icon="square-o" />
    }

    async syncViewState(sections: DOIFormSections) {
        // TODO: move into controller and pass as param
        const status = this.formStatus(sections);
        try {
            await this.props.model.saveDOIForm({
                form_id: this.state.doiForm.form_id,
                status,
                // TODO: improve typing of toJSON? It should always return an object of the 
                // same shape, but with undefined fields removed, and throwing errors if not JSON compatible.
                sections: toJSON(sections) as unknown as DOIFormSections
            });
        } catch (ex) {
            console.error('Could not save form state!', ex);
        }
        return new Promise((resolve) => {
            this.setState({
                doiForm: {
                    ...this.state.doiForm,
                    status,
                    sections
                }
            }, () => {
                resolve(null);
            });
        });
    }

    formStatus(sections: DOIFormSections): DOIFormStatus {
        const { narrative, citations, orcidLink, authorsImport, authors, contracts, description, reviewAndSubmit } = sections;
        const isComplete = (
            narrative.status === StepStatus.COMPLETE &&
            citations.status === StepStatus.COMPLETE &&
            orcidLink.status === StepStatus.COMPLETE &&
            authorsImport.status === StepStatus.COMPLETE &&
            authors.status === StepStatus.COMPLETE &&
            contracts.status === StepStatus.COMPLETE &&
            description.status === StepStatus.COMPLETE
        );
        if (isComplete) {
            if (reviewAndSubmit.status === StepStatus.COMPLETE) {
                return DOIFormStatus.SUBMITTED;
            }
            return DOIFormStatus.COMPLETE;
        }
        return DOIFormStatus.INCOMPLETE;
    }

    maybeSetupReviewAndSubmit() {
        const reviewAndSubmit: ReviewAndSubmitSection = (() => {
            const submission = this.extractOSTISubmission();

            if (submission === null) {
                return {
                    status: StepStatus.NONE
                };
            }
            const nextSection = this.state.doiForm.sections.reviewAndSubmit;
            switch (nextSection.status) {
                case StepStatus.NONE:
                    return {
                        status: StepStatus.INCOMPLETE,
                        params: { formId: this.props.doiForm.form_id, submission }
                    };
                case StepStatus.INCOMPLETE:
                    return {
                        status: StepStatus.INCOMPLETE,
                        params: nextSection.params,
                    };
                case StepStatus.COMPLETE:
                    return {
                        status: StepStatus.INCOMPLETE,
                        params: nextSection.params,
                        value: nextSection.value
                    }
                case StepStatus.EDITING:
                    return {
                        status: StepStatus.EDITING,
                        params: nextSection.params,
                        value: nextSection.value
                    }
            }
        })();

        this.syncViewState({
            ...this.state.doiForm.sections,
            reviewAndSubmit
        })
    }

    extractOSTISubmission(): OSTISubmission | null {
        // Constants - do not vary from user to user
        const site_input_code = 'KBASE'
        const dataset_type = 'GD'
        const sponsor_org = 'USDOE Office of Science (SC), Biological and Environmental Research (BER)'

        const { narrative, citations, orcidLink, authorsImport, authors, contracts, description } = this.state.doiForm.sections;
        const ready = (
            narrative.status === StepStatus.COMPLETE &&
            citations.status === StepStatus.COMPLETE &&
            orcidLink.status === StepStatus.COMPLETE &&
            authorsImport.status === StepStatus.COMPLETE &&
            authors.status === StepStatus.COMPLETE &&
            contracts.status === StepStatus.COMPLETE &&
            description.status === StepStatus.COMPLETE
        );

        if (!ready) {
            return null;
        }

        // All required fields should be added here.
        const submission: OSTISubmission = {
            title: description.value.description.title,
            publication_date: new Intl.DateTimeFormat('en-US', {}).format(narrative.value.staticNarrative.staticNarrativeSavedAt),
            contract_nos: contracts.value.contractNumbers.doe.join('; '),
            authors: authors.value.authors.map(({
                firstName, middleName, lastName, institution, emailAddress, orcidId,
                contributorType
            }) => {
                return {
                    first_name: firstName,
                    middle_name: middleName,
                    last_name: lastName,
                    affiliation_name: institution,
                    private_email: emailAddress,
                    orcid_id: orcidId,
                    contributor_type: contributorType
                }
            }),
            site_url: this.staticNarrativeLink(
                narrative.value.staticNarrative.workspaceId,
                narrative.value.staticNarrative.version
            ), // TODO: this should be the static narrative?
            dataset_type,
            sponsor_org,
            site_input_code,
            keywords: description.value.description.keywords.join('; '),
            description: description.value.description.abstract,
            // doi_infix // TODO: use?
            // accession_num: narrative.value.staticNarrative.ref,
            // sponsor_org // TODO use?
            originating_research_org: description.value.description.researchOrganization,
            related_identifiers: citations.value.citations.map(({ doi }) => {
                return {
                    related_identifier: doi,
                    relation_type: 'Cites',
                    related_identifier_type: 'DOI'
                }
            }),
            doi_infix: `${narrative.value.staticNarrative.workspaceId}.${narrative.value.staticNarrative.version}`

        };

        // Optional fields
        if (contracts.value.contractNumbers.other.length > 0) {
            submission.othnondoe_contract_nos = contracts.value.contractNumbers.other.join('; ')
        }

        return submission;
    }

    // Renderers

    renderSelectNarrativeSection(section: NarrativeSection) {
        const stepNumber = 1;
        const stepTitle = 'Select Narrative';
        switch (section.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, stepTitle);
            case StepStatus.INCOMPLETE:
                return <div>
                    {this.renderStepTitle(stepNumber, stepTitle)}
                    <SelectNarrativeController
                        model={this.props.model}
                        editMode="edit"
                        setTitle={this.props.setTitle}
                        onDone={(staticNarrative: StaticNarrativeSummary) => {
                            // const minimalNarrativeInfo: MinimalNarrativeInfo = {
                            //     workspaceId: narrativeInfo.workspaceInfo.id,
                            //     objectId: narrativeInfo.objectInfo.id,
                            //     version: narrativeInfo.objectInfo.version,
                            //     ref: narrativeInfo.objectInfo.ref,
                            //     title: narrativeInfo.workspaceInfo.metadata['narrative_nice_name'],
                            //     owner: narrativeInfo.workspaceInfo.owner
                            // }

                            const description: DescriptionSection = (() => {
                                const nextStep = this.state.doiForm.sections.description;
                                switch (nextStep.status) {
                                    case StepStatus.NONE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: { narrativeTitle: staticNarrative.title }
                                        };
                                    case StepStatus.INCOMPLETE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: nextStep.params
                                        };
                                    case StepStatus.COMPLETE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: nextStep.params,
                                            value: nextStep.value
                                        }
                                    case StepStatus.EDITING:
                                        // should never occur
                                        return {
                                            status: StepStatus.EDITING,
                                            params: nextStep.params,
                                            value: nextStep.value
                                        }
                                }
                            })();

                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                narrative: {
                                    status: StepStatus.COMPLETE,
                                    params: null,
                                    value: { staticNarrative }
                                },
                                description,
                            });
                        }} />
                </div>
            case StepStatus.EDITING:
                return <div>
                    {this.renderStepTitle(stepNumber, stepTitle)}
                    <SelectNarrativeController
                        model={this.props.model}
                        editMode="edit"
                        setTitle={this.props.setTitle}
                        selectedNarrative={section.value.staticNarrative}
                        onDone={(staticNarrative: StaticNarrativeSummary) => {
                            const description: DescriptionSection = (() => {
                                const nextStep = this.state.doiForm.sections.description;
                                switch (nextStep.status) {
                                    case StepStatus.NONE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: { narrativeTitle: staticNarrative.title }
                                        };
                                    case StepStatus.INCOMPLETE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: nextStep.params
                                        };
                                    case StepStatus.COMPLETE:
                                        return {
                                            status: StepStatus.EDITING,
                                            params: nextStep.params,
                                            value: nextStep.value
                                        }
                                    case StepStatus.EDITING:
                                        // should never occur
                                        return {
                                            status: StepStatus.EDITING,
                                            params: nextStep.params,
                                            value: nextStep.value
                                        }
                                }
                            })();

                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                narrative: {
                                    status: StepStatus.COMPLETE,
                                    params: null,
                                    value: { staticNarrative }
                                },
                                description
                            })
                        }} />
                </div>
            case StepStatus.COMPLETE: {
                const onEdit = () => {
                    const section: NarrativeSection = this.state.doiForm.sections.narrative;
                    const narrative: NarrativeSection = (() => {
                        switch (section.status) {
                            case StepStatus.NONE:
                                return {
                                    status: StepStatus.INCOMPLETE,
                                    params: null
                                };
                            case StepStatus.INCOMPLETE:
                                return {
                                    status: StepStatus.INCOMPLETE,
                                    params: section.params
                                };
                            case StepStatus.COMPLETE:
                                return {
                                    status: StepStatus.EDITING,
                                    params: section.params,
                                    value: section.value
                                }
                            case StepStatus.EDITING:
                                // should never occur
                                return {
                                    status: StepStatus.EDITING,
                                    params: section.params,
                                    value: section.value
                                }
                        }
                    })();
                    this.syncViewState({
                        ...this.state.doiForm.sections,
                        narrative
                    });
                }
                return <div>
                    {this.renderStepDoneTitle(stepNumber, stepTitle, onEdit)}
                    <SelectNarrativeViewController
                        model={this.props.model}
                        selectedNarrative={section.value.staticNarrative} />
                </div>
            }
        }
    }

    renderDescriptionSection(section: DescriptionSection) {
        const stepNumber = 2;
        const stepTitle = 'Description';
        switch (section.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, stepTitle);
            case StepStatus.INCOMPLETE: {
                return <div>
                    {this.renderStepTitle(stepNumber, stepTitle)}
                    <DescriptionController
                        model={this.props.model}
                        narrativeTitle={section.params.narrativeTitle}
                        setTitle={this.props.setTitle}
                        onDone={(description: Description) => {
                            if (section.status !== StepStatus.INCOMPLETE) {
                                // should never get here... this is just for 
                                // type narrowing.
                                throw new Error('Invalid state - expected INCOMPLETE');
                            }
                            const orcidLink: ORCIDLinkSection = (() => {
                                const nextStep = this.state.doiForm.sections.orcidLink;
                                switch (nextStep.status) {
                                    case StepStatus.NONE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: null
                                        };
                                    case StepStatus.INCOMPLETE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: nextStep.params,
                                        };
                                    case StepStatus.COMPLETE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: nextStep.params,
                                            value: nextStep.value
                                        }
                                    case StepStatus.EDITING:
                                        return {
                                            status: StepStatus.EDITING,
                                            params: nextStep.params,
                                            value: nextStep.value
                                        }
                                }
                            })();
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                description: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: { description }
                                },
                                orcidLink
                            })
                        }}
                    />
                </div>
            }
            case StepStatus.EDITING: {
                return <div>
                    {this.renderStepTitle(stepNumber, stepTitle)}
                    <DescriptionController
                        model={this.props.model}
                        narrativeTitle={section.params.narrativeTitle}
                        setTitle={this.props.setTitle}
                        description={section.value.description}
                        onDone={async (description: Description) => {
                            if (section.status !== StepStatus.EDITING) {
                                // should never get here... this is just for 
                                // type narrowing.
                                throw new Error('Invalid state - expected EDITING');
                            }
                            await this.syncViewState({
                                ...this.state.doiForm.sections,
                                description: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: { description }
                                }
                            });
                            ;
                            await this.maybeSetupReviewAndSubmit();
                        }}
                    />
                </div>
            }
            case StepStatus.COMPLETE: {
                const onEdit = async () => {
                    // const reviewAndSubmit = (() => {
                    //     const section = this.state.doiForm.sections.reviewAndSubmit;
                    //     if (section.status === StepStatus.COMPLETE) {
                    //         return {
                    //             ...section,
                    //             status: StepStatus.EDITING,
                    //         }
                    //     }
                    //     return section;
                    // })();
                    await this.syncViewState({
                        ...this.state.doiForm.sections,
                        description: {
                            ...section,
                            status: StepStatus.EDITING
                        }
                    });
                    await this.maybeSetupReviewAndSubmit();
                }
                return <div>
                    {this.renderStepDoneTitle(stepNumber, stepTitle, onEdit)}
                    <DescriptionView description={section.value.description} />
                </div>
            }
        }
    }

    renderORCIDLinkSection(section: ORCIDLinkSection) {
        const stepNumber = 3;
        const title = 'ORCID Link';
        switch (section.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE:
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <ORCIDLink model={this.props.model}
                        stepsState={JSON.stringify(this.state.doiForm.sections)}
                        formId={this.props.doiForm.form_id}
                        setTitle={this.props.setTitle}
                        onDone={(orcidId: string | null) => {
                            if (this.state.doiForm.sections.narrative.status !== StepStatus.COMPLETE) {
                                return;
                            }
                            const authorsImport: AuthorsImportSection = (() => {
                                const nextSection = this.state.doiForm.sections.authorsImport;
                                switch (nextSection.status) {
                                    case StepStatus.NONE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: {
                                                staticNarrative: this.state.doiForm.sections.narrative.value.staticNarrative
                                            }
                                        };
                                    case StepStatus.INCOMPLETE:
                                        return { ...nextSection, status: StepStatus.INCOMPLETE };
                                    case StepStatus.COMPLETE:
                                        return { ...nextSection, status: StepStatus.INCOMPLETE }
                                    case StepStatus.EDITING:
                                        return { ...nextSection, status: StepStatus.EDITING }
                                }
                            })();
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                orcidLink: {
                                    status: StepStatus.COMPLETE,
                                    params: null,
                                    value: { orcidLink: { orcidId } }
                                },
                                authorsImport
                            })
                        }} />
                </div>
            case StepStatus.EDITING:
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <ORCIDLink model={this.props.model}
                        stepsState={JSON.stringify(this.state.doiForm.sections)}
                        formId={this.props.doiForm.form_id}
                        setTitle={this.props.setTitle}
                        onDone={(orcidId: string | null) => {
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                orcidLink: {
                                    status: StepStatus.COMPLETE,
                                    params: null,
                                    value: { orcidLink: { orcidId } }
                                }
                            })
                        }} />
                </div>
            case StepStatus.COMPLETE:
                const onEdit = () => {
                    this.syncViewState({
                        ...this.state.doiForm.sections,
                        orcidLink: {
                            ...section,
                            status: StepStatus.EDITING
                        }
                    });
                }
                return this.renderStepDoneTitle(stepNumber, title, onEdit);
        }
    }

    renderAuthorsImportStep(section: AuthorsImportSection) {
        const stepNumber = 4;
        const title = 'Import shared users from Narrative as Authors';
        switch (section.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE: {
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <AuthorsImportSectionController
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        authors={[]}
                        staticNarrative={section.params.staticNarrative}
                        onDone={(importableAuthors: Array<ImportableAuthor>) => {
                            const section = this.state.doiForm.sections.authorsImport;
                            const authors: AuthorsSection = (() => {
                                if (section.status !== StepStatus.INCOMPLETE) {
                                    throw new Error('Invalid state - expected INCOMPLETE');
                                }
                                const nextSection = this.state.doiForm.sections.authors;
                                switch (nextSection.status) {
                                    case StepStatus.NONE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: { authors: importableAuthors }
                                        };
                                    case StepStatus.INCOMPLETE:
                                        return { ...nextSection, status: StepStatus.INCOMPLETE };
                                    case StepStatus.COMPLETE:
                                        return { ...nextSection, status: StepStatus.INCOMPLETE }
                                    case StepStatus.EDITING:
                                        return { ...nextSection, status: StepStatus.EDITING }
                                }
                            })();
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                authorsImport: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: { authors: importableAuthors }
                                },
                                authors
                            })
                        }}
                    />
                </div>
            }
            case StepStatus.EDITING: {
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <AuthorsImportSectionController
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        authors={[]}
                        staticNarrative={section.params.staticNarrative}
                        onDone={(importableAuthors: Array<ImportableAuthor>) => {
                            const section = this.state.doiForm.sections.authorsImport;
                            const authors: AuthorsSection = (() => {
                                if (section.status !== StepStatus.EDITING) {
                                    throw new Error('Invalid state - expected EDITING');
                                }
                                const nextSection = this.state.doiForm.sections.authors;
                                switch (nextSection.status) {
                                    case StepStatus.NONE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: { authors: importableAuthors }
                                        };
                                    case StepStatus.INCOMPLETE:
                                        return { ...nextSection, status: StepStatus.INCOMPLETE };
                                    case StepStatus.COMPLETE:
                                        return { ...nextSection, status: StepStatus.INCOMPLETE }
                                    case StepStatus.EDITING:
                                        return { ...nextSection, status: StepStatus.EDITING }
                                }
                            })();
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                authorsImport: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: { authors: importableAuthors }
                                },
                                authors
                            })
                        }}
                    />
                </div>
            }
            case StepStatus.COMPLETE: {
                const onEdit = () => {
                    const authorsSection: AuthorsSection = this.state.doiForm.sections.authors;
                    const authors: AuthorsSection = (() => {
                        switch (authorsSection.status) {
                            case StepStatus.NONE:
                                return authorsSection;
                            case StepStatus.INCOMPLETE:
                                // return authorsSection;
                                return {
                                    status: StepStatus.NONE,
                                }
                            case StepStatus.COMPLETE:
                                return {
                                    status: StepStatus.NONE,
                                }
                            case StepStatus.EDITING:
                                return {
                                    status: StepStatus.NONE,
                                }
                        }
                    })();
                    this.syncViewState({
                        ...this.state.doiForm.sections,
                        authorsImport: {
                            status: StepStatus.EDITING,
                            params: section.params,
                            value: section.value
                        },
                        authors
                    })
                }
                return this.renderStepDoneTitle(stepNumber, title, onEdit);
            }
        }
    }
    renderAuthorsStep(section: AuthorsSection) {
        const stepNumber = 5;
        const title = 'Authors';
        switch (section.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE: {
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <AuthorsStep
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        authors={section.params.authors}
                        onDone={(authors: Array<Author>) => {
                            if (this.state.doiForm.sections.narrative.status !== StepStatus.COMPLETE) {
                                throw new Error('Narrative section must be complete');
                            }
                            const citationsImport: CitationsImportSection = (() => {
                                if (section.status !== StepStatus.INCOMPLETE) {
                                    // should never get here... this is just for 
                                    // type narrowing.
                                    throw new Error('Invalid state - expected INCOMPLETE');
                                }
                                const nextSection = this.state.doiForm.sections.citationsImport;
                                switch (nextSection.status) {
                                    case StepStatus.NONE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: { staticNarrative: this.state.doiForm.sections.narrative.value.staticNarrative }
                                        };
                                    case StepStatus.INCOMPLETE:
                                        return nextSection;
                                    case StepStatus.COMPLETE:
                                        return nextSection;
                                    case StepStatus.EDITING:
                                        return nextSection;
                                }
                            })();
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                authors: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: { authors }
                                },
                                citationsImport
                            })
                        }}
                    />
                </div>
            }
            case StepStatus.EDITING: {
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <AuthorsStep
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        authors={section.value.authors}
                        onDone={(authors: Array<Author>) => {
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                authors: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: { authors }
                                }
                            })
                        }}
                    />
                </div>
            }
            case StepStatus.COMPLETE:
                const onEdit = () => {
                    this.syncViewState({
                        ...this.state.doiForm.sections,
                        authors: {
                            ...section,
                            status: StepStatus.EDITING
                        }
                    });
                }
                return <div>
                    {this.renderStepDoneTitle(stepNumber, title, onEdit)}
                    <AuthorsView authors={section.value.authors} />
                </div>
        }
    }


    renderImportCitationsSection(section: CitationsImportSection, stepNumber: number, title: string) {
        switch (section.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE: {
                return <div>
                    {this.renderStepTitle(stepNumber, `${title} "${section.params.staticNarrative.title}"`)}
                    <CitationsImportEditor
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        staticNarrative={section.params.staticNarrative}
                        onUpdate={(citations: CitationImportResults) => {
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                citationsImport: {
                                    status: StepStatus.EDITING,
                                    params: section.params,
                                    value: citations
                                }
                            })
                        }}
                        onDone={(citationsImportResult: CitationImportResults) => {
                            if (section.status !== StepStatus.INCOMPLETE) {
                                // should never get here... this is just for type narrowing.
                                throw new Error('Invalid state - expected INCOMPLETE');
                            }
                            const citations: CitationsSection = (() => {
                                const nextStep = this.state.doiForm.sections.citations;
                                switch (nextStep.status) {
                                    case StepStatus.NONE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: {
                                                citations: citationsImportResult.citations
                                            }
                                        };
                                    case StepStatus.INCOMPLETE:
                                        return {
                                            ...nextStep,
                                            status: StepStatus.INCOMPLETE,
                                        };
                                    case StepStatus.COMPLETE:
                                        return {
                                            ...nextStep,
                                            status: StepStatus.INCOMPLETE,
                                        }
                                    case StepStatus.EDITING:
                                        return {
                                            ...nextStep,
                                            status: StepStatus.EDITING,
                                        }
                                }
                            })();
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                citationsImport: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: citationsImportResult
                                },
                                citations
                            })
                        }}
                    />
                </div>
            }
            case StepStatus.EDITING: {
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <CitationsImportEditor
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        staticNarrative={section.params.staticNarrative}
                        onUpdate={(citations: CitationImportResults) => {
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                citationsImport: {
                                    status: StepStatus.EDITING,
                                    params: section.params,
                                    value: citations
                                }
                            })
                        }}
                        onDone={(citationsImportResult: CitationImportResults) => {
                            if (section.status !== StepStatus.EDITING) {
                                // should never get here... this is just for type narrowing.
                                throw new Error('Invalid state - expected INCOMPLETE');
                            }
                            const citations: CitationsSection = (() => {
                                const nextStep = this.state.doiForm.sections.citations;
                                switch (nextStep.status) {
                                    case StepStatus.NONE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: {
                                                citations: citationsImportResult.citations
                                            }
                                        };
                                    case StepStatus.INCOMPLETE:
                                        return {
                                            ...nextStep,
                                            status: StepStatus.INCOMPLETE,
                                        };
                                    case StepStatus.COMPLETE:
                                        return {
                                            ...nextStep,
                                            status: StepStatus.INCOMPLETE,
                                        }
                                    case StepStatus.EDITING:
                                        return {
                                            ...nextStep,
                                            status: StepStatus.EDITING,
                                        }
                                }
                            })();
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                citationsImport: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: citationsImportResult
                                },
                                citations
                            })
                        }}
                    />
                    {/* <CitationsSectionEditor
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        staticNarrative={section.params.staticNarrative}
                        onUpdate={(citations: CitationResults) => {
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                citations: {
                                    status: StepStatus.EDITING,
                                    params: section.params,
                                    value: citations
                                }
                            });
                        }}
                        onDone={(citations: CitationResults) => {
                            if (section.status !== StepStatus.EDITING) {
                                // should never get here... this is just for type narrowing.
                                throw new Error('Invalid state - expected INCOMPLETE');
                            }
                            const contracts: ContractsSection = (() => {
                                const nextStep = this.state.doiForm.sections.contracts;
                                switch (nextStep.status) {
                                    case StepStatus.NONE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: null
                                        };
                                    case StepStatus.INCOMPLETE:
                                        return {
                                            ...nextStep,
                                            status: StepStatus.INCOMPLETE,
                                        };
                                    case StepStatus.COMPLETE:
                                        return {
                                            ...nextStep,
                                            status: StepStatus.INCOMPLETE,
                                        }
                                    case StepStatus.EDITING:
                                        return {
                                            ...nextStep,
                                            status: StepStatus.EDITING,
                                        }
                                }
                            })();
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                citations: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: citations
                                },
                                contracts
                            })
                        }}
                    /> */}
                </div>
            }
            case StepStatus.COMPLETE:
                const onEdit = () => {
                    this.syncViewState({
                        ...this.state.doiForm.sections,
                        citationsImport: {
                            ...section,
                            status: StepStatus.EDITING,
                        },
                        reviewAndSubmit: {
                            status: StepStatus.NONE
                        }
                    });
                }
                return <div>
                    {this.renderStepDoneTitle(stepNumber, title, onEdit)}
                    <CitationsViewController model={this.props.model} citations={section.value.citations} />
                </div>
        }
    }

    renderCitationsSection(section: CitationsSection, stepNumber: number, title: string) {
        switch (section.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE: {
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <CitationsEditorController
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        citations={section.params.citations}
                        onUpdate={(citations: CitationResults) => {
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                citations: {
                                    status: StepStatus.EDITING,
                                    params: section.params,
                                    value: citations
                                }
                            })
                        }}
                        onDone={(citations: CitationResults) => {
                            if (section.status !== StepStatus.INCOMPLETE) {
                                // should never get here... this is just for type narrowing.
                                throw new Error('Invalid state - expected INCOMPLETE');
                            }
                            const contracts: ContractsSection = (() => {
                                const nextStep = this.state.doiForm.sections.contracts;
                                switch (nextStep.status) {
                                    case StepStatus.NONE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: null
                                        };
                                    case StepStatus.INCOMPLETE:
                                        return {
                                            ...nextStep,
                                            status: StepStatus.INCOMPLETE,
                                        };
                                    case StepStatus.COMPLETE:
                                        return {
                                            ...nextStep,
                                            status: StepStatus.INCOMPLETE,
                                        }
                                    case StepStatus.EDITING:
                                        return {
                                            ...nextStep,
                                            status: StepStatus.EDITING,
                                        }
                                }
                            })();
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                citations: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: citations
                                },
                                contracts
                            })
                        }}
                    />
                </div>
            }
            case StepStatus.EDITING: {
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <CitationsSectionEditor
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        citations={section.params.citations}
                        onUpdate={(citations: CitationResults) => {
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                citations: {
                                    status: StepStatus.EDITING,
                                    params: section.params,
                                    value: citations
                                }
                            });
                        }}
                        onDone={(citations: CitationResults) => {
                            if (section.status !== StepStatus.EDITING) {
                                // should never get here... this is just for type narrowing.
                                throw new Error('Invalid state - expected INCOMPLETE');
                            }
                            const contracts: ContractsSection = (() => {
                                const nextStep = this.state.doiForm.sections.contracts;
                                switch (nextStep.status) {
                                    case StepStatus.NONE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: null
                                        };
                                    case StepStatus.INCOMPLETE:
                                        return {
                                            ...nextStep,
                                            status: StepStatus.INCOMPLETE,
                                        };
                                    case StepStatus.COMPLETE:
                                        return {
                                            ...nextStep,
                                            status: StepStatus.INCOMPLETE,
                                        }
                                    case StepStatus.EDITING:
                                        return {
                                            ...nextStep,
                                            status: StepStatus.EDITING,
                                        }
                                }
                            })();
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                citations: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: citations
                                },
                                contracts
                            })
                        }}
                    />
                </div>
            }
            case StepStatus.COMPLETE:
                const onEdit = () => {
                    this.syncViewState({
                        ...this.state.doiForm.sections,
                        citations: {
                            ...section,
                            status: StepStatus.EDITING,
                        },
                        reviewAndSubmit: {
                            status: StepStatus.NONE
                        }
                    });
                }
                return <div>
                    {this.renderStepDoneTitle(stepNumber, title, onEdit)}
                    <CitationsViewController model={this.props.model} citations={section.value.citations} />
                </div>
        }
    }

    renderContractNumbersStep(section: ContractsSection) {
        const stepNumber = 8;
        const title = 'Contract Numbers';
        switch (section.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE: {
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <ContractNumbersFormController
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        onDone={async (contractNumbers: ContractNumbers) => {
                            if (section.status !== StepStatus.INCOMPLETE) {
                                // should never get here... this is just for 
                                // type narrowing.
                                throw new Error('Invalid state - expected INCOMPLETE');
                            }
                            await this.syncViewState({
                                ...this.state.doiForm.sections,
                                contracts: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: { contractNumbers }
                                },
                            })
                            await this.maybeSetupReviewAndSubmit();
                        }}
                    />
                </div>
            }
            case StepStatus.EDITING: {
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <ContractNumbersFormController
                        model={this.props.model}
                        contractNumbers={section.value.contractNumbers}
                        setTitle={this.props.setTitle}
                        onDone={async (contractNumbers: ContractNumbers) => {
                            if (section.status !== StepStatus.EDITING) {
                                // should never get here... this is just for 
                                // type narrowing.
                                throw new Error('Invalid state - expected INCOMPLETE');
                            }
                            await this.syncViewState({
                                ...this.state.doiForm.sections,
                                contracts: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: { contractNumbers }
                                },
                            })
                            await this.maybeSetupReviewAndSubmit();
                        }}
                    />
                </div>
            }
            case StepStatus.COMPLETE: {
                const onEdit = () => {
                    this.syncViewState({
                        ...this.state.doiForm.sections,
                        contracts: {
                            status: StepStatus.EDITING,
                            params: section.params,
                            value: section.value
                        },
                        reviewAndSubmit: {
                            status: StepStatus.NONE
                        }
                    });
                }
                return <div>
                    {this.renderStepDoneTitle(stepNumber, title, onEdit)}
                    <ContractNumbersView contractNumbers={section.value.contractNumbers} />
                </div>
            }
        }
    }

    // renderGeolocationStep(section: GeolocationSection) {
    //     const stepNumber = 7;
    //     const title = 'Geolocation';
    //     switch (section.status) {
    //         case StepStatus.NONE:
    //             return this.renderStepPendingTitle(stepNumber, title);
    //         case StepStatus.INCOMPLETE:
    //             return <div>
    //                 {this.renderStepTitle(stepNumber, title)}
    //                 <GeolocationController
    //                     model={this.props.model}
    //                     setTitle={this.props.setTitle}
    //                     onDone={(geolocationData: GeolocationData) => {
    //                         const description: DescriptionSection = (() => {
    //                             if (section.status !== StepStatus.INCOMPLETE) {
    //                                 // should never get here... this is just for 
    //                                 // type narrowing.
    //                                 throw new Error('Invalid state - expected INCOMPLETE');
    //                             }
    //                             const nextSection = this.state.doiForm.sections.description;
    //                             switch (nextSection.status) {
    //                                 case StepStatus.NONE:
    //                                     return {
    //                                         status: StepStatus.INCOMPLETE,
    //                                         params: null
    //                                     };
    //                                 case StepStatus.INCOMPLETE:
    //                                     return {
    //                                         status: StepStatus.INCOMPLETE,
    //                                         params: nextSection.params,
    //                                     };
    //                                 case StepStatus.COMPLETE:
    //                                     return {
    //                                         status: StepStatus.INCOMPLETE,
    //                                         params: nextSection.params,
    //                                         value: nextSection.value
    //                                     }
    //                                 case StepStatus.EDITING:
    //                                     return {
    //                                         status: StepStatus.EDITING,
    //                                         params: nextSection.params,
    //                                         value: nextSection.value
    //                                     }
    //                             }
    //                         })();
    //                         this.syncViewState({
    //                             ...this.state.doiForm.sections,
    //                             geolocation: {
    //                                 status: StepStatus.COMPLETE,
    //                                 params: section.params,
    //                                 value: { geolocationData }
    //                             },
    //                             description
    //                         })
    //                     }}
    //                 />
    //             </div>
    //         case StepStatus.COMPLETE:
    //             return this.renderStepDoneTitle(stepNumber, title);
    //     }
    // }

    staticNarrativeLink(id: number, version: number) {
        return `https://kbase.us/n/${id}/${version}`
    }


    renderCompleteForm(submissionId: string) {
        return <div>
            <SubmissionController model={this.props.model} submissionId={submissionId} />
        </div>
    }

    renderReviewAndSubmitStep(section: ReviewAndSubmitSection) {
        const stepNumber = 9;
        const title = 'Review and Submit';
        // This step is a bit special, as it only becomes unlocked when the 
        // prior steps are COMPLETE.
        // TODO: The form model should be updated. Instead of being sequential,
        // express dependencies (e.g. select narrative -> citations, orcid link -> authors; samples -> geolocation)
        // and allow unlinked sections to be filled out ad-hoc.
        // Finally, the review and submit depends on EVERYTHING being complete :)
        //
        // But for now, let us just hack this together.

        switch (section.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE: {
                // const submission = this.extractOSTISubmission();
                // if (submission === null) {
                //     return <div>
                //         {this.renderDisabledStepTitle(stepNumber, title)}
                //         <p>
                //             After all form sections have been completed, you
                //             may review all of the data as it will be sent to
                //             OSTI, and if it is solid, submit it.
                //         </p>
                //     </div>
                // }
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <ReviewAndSubmitController
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        formId={section.params.formId}
                        submission={section.params.submission}
                        onDone={(result: ReviewAndSubmitResult) => {
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                reviewAndSubmit: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: result
                                }
                            })
                        }}
                    />
                </div>
                // return this.renderStepPendingTitle(stepNumber, title);
            }
            case StepStatus.EDITING: {
                // const submission = this.extractOSTISubmission();
                // if (submission === null) {
                //     return <div>
                //         {this.renderDisabledStepTitle(stepNumber, title)}
                //         <p>
                //             After all form sections have been completed, you
                //             may review all of the data as it will be sent to
                //             OSTI, and if it is solid, submit it.
                //         </p>
                //     </div>
                // }

                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <ReviewAndSubmitController
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        formId={section.params.formId}
                        submission={section.params.submission}
                        onDone={(result: ReviewAndSubmitResult) => {
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                reviewAndSubmit: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: result
                                }
                            })
                        }}
                    />
                </div>
            }
            case StepStatus.COMPLETE:
                return <div>
                    {this.renderStepDoneTitle(stepNumber, title)}
                    <AlertMessage variant="success" className="mt-3">
                        Congrats, your DOI request form has been successfully submitted!
                    </AlertMessage>
                    {this.renderCompleteForm(this.props.doiForm.form_id)}
                </div>
        }
    }

    createForm() {
        alert('ok, will create form...');
    }

    render() {
        // if (this.state.doiForm === null) {
        //     return <CreateForm createForm={this.createForm.bind(this)} />
        // }

        const {
            narrative,
            citations,
            citationsImport,
            orcidLink,
            authorsImport,
            authors,
            contracts,
            // geolocation,
            description,
            reviewAndSubmit
        }: DOIFormSections = this.state.doiForm.sections;
        return <div className={styles.main}>
            <h2>DOI Request Form</h2>
            <p>
                <Button variant="secondary" href="/#demos/doi"><span className="fa fa-mail-reply" /> Back</Button>
            </p>
            <p>
                This is a DOI Request form with ORCID linking assistance
            </p>
            <div className={styles.steps}>
                <Stack gap={3}>
                    <Row className="g-0">
                        <Col>
                            {this.renderSelectNarrativeSection(narrative)}
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col>
                            {this.renderDescriptionSection(description)}
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col>
                            {this.renderORCIDLinkSection(orcidLink)}
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col>
                            {this.renderAuthorsImportStep(authorsImport)}
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col>
                            {this.renderAuthorsStep(authors)}
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col>
                            {this.renderImportCitationsSection(citationsImport, 6, "Import Citations from Narrative")}
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col>
                            {this.renderCitationsSection(citations, 7, "Citations")}
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col>
                            {this.renderContractNumbersStep(contracts)}
                        </Col>
                    </Row>
                    {/* <Row className="g-0">
                        <Col>
                            {this.renderGeolocationStep(geolocation)}
                        </Col>
                    </Row> */}
                    <Row className="g-0">
                        <Col>
                            {this.renderReviewAndSubmitStep(reviewAndSubmit)}
                        </Col>
                    </Row>
                </Stack>
            </div>
        </div>;
    }
}