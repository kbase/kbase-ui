import { Model } from 'apps/ORCIDLink/Model';
import {
    Author,
    AuthorsSection,
    CitationResults, CitationsSection, ContractNumbers, ContractsSection, Description, DescriptionSection, DOIForm, DOIFormSections, GeolocationData,
    GeolocationSection,
    MinimalNarrativeInfo, NarrativeInfo, NarrativeSection, ORCIDLinkSection, OSTISubmission, ReviewAndSubmitData,
    ReviewAndSubmitSection,
    StepStatus
} from 'apps/ORCIDLink/ORCIDLinkClient';
import { JSONObject } from 'lib/json';
import { Component } from 'react';
import { Alert, Button, Col, Row, Stack } from 'react-bootstrap';
import AuthorsStep from '../steps/Authors/AuthorsStep';
import CitationsSectionEditor from '../steps/Citations/CitationsEditorController';
import CitationsViewController from '../steps/Citations/CitationsViewController';
import ContractNumbersFormController from '../steps/ContractNumbersFormController';
import DescriptionController from '../steps/Description/Controller';
import GeolocationController from '../steps/Geolocation/GeolocationController';
import ORCIDLink from '../steps/ORCIDLinkController';
import ReviewAndSubmitController from '../steps/ReviewAndSubmitController';
import SelectNarrativeController from '../steps/SelectNarrative/EditorController';
import SelectNarrativeViewController from '../steps/SelectNarrative/ViewerController';
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
        return <Alert variant="info" style={{ fontWeight: 'bold' }}>
            Step {step}: {title}
        </Alert>
    }

    renderDisabledStepTitle(step: number, title: string) {
        return <Alert variant="danger" style={{ fontWeight: 'bold' }}>
            Step {step}: {title}
        </Alert>
    }

    // jumpToStep(stepNumber: number) {
    //     const stepIndex = stepNumber - 1;
    //     const step = this.state.doiForm.steps[stepIndex];
    //     const steps = this.state.doiForm.steps;
    //     switch (step.status) {
    //         case StepStatus.NONE:
    //             // TODO
    //             break;
    //         case StepStatus.INCOMPLETE:
    //             break;
    //         case StepStatus.COMPLETE:
    //             steps[stepIndex] = {
    //                 ...step,
    //                 status: StepStatus.EDITING,
    //             }
    //             break;
    //         case StepStatus.EDITING:
    //             steps[stepIndex] = {
    //                 ...step,
    //                 status: StepStatus.EDITING,
    //             }
    //     }
    //     this.setState({
    //         doiForm: {
    //             ...this.state.doiForm,
    //             steps
    //         }
    //     });
    // }

    renderStepDoneTitle(step: number, title: string, onEdit?: () => void) {
        return <Alert variant="success" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '0' }}>
            <span>Step {step}: {title}</span>
            <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button
                    variant="outline-secondary"
                    style={{ border: 'none' }}
                    size="sm"
                    onClick={() => { if (onEdit) { onEdit(); } }}>
                    <span className="fa fa-edit" />
                </Button>
            </div>
        </Alert>
    }

    renderStepPendingTitle(step: number, title: string) {
        return <Alert variant="secondary">
            Step {step}: {title}
        </Alert>
    }

    syncViewState(sections: DOIFormSections) {
        // TODO: move into controller and pass as param
        try {
            this.props.model.saveDOIForm({
                form_id: this.state.doiForm.form_id,
                sections
            });
        } catch (ex) {
            console.error('Could not save form state!', ex);
        }
        this.setState({
            doiForm: {
                ...this.state.doiForm,
                sections
            }
        });
    }

    renderSelectNarrativeSection(section: NarrativeSection) {
        switch (section.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(1, 'Select Narrative');
            case StepStatus.INCOMPLETE:
                return <div>
                    {this.renderStepTitle(1, 'Select Narrative')}
                    <SelectNarrativeController
                        model={this.props.model}
                        editMode="edit"
                        setTitle={this.props.setTitle}
                        onDone={(narrativeInfo: NarrativeInfo) => {
                            const citations: CitationsSection = (() => {
                                const nextStep = this.state.doiForm.sections.citations;
                                switch (nextStep.status) {
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

                            const minimalNarrativeInfo: MinimalNarrativeInfo = {
                                workspaceId: narrativeInfo.workspaceInfo.id,
                                objectId: narrativeInfo.objectInfo.id,
                                version: narrativeInfo.objectInfo.version,
                                ref: narrativeInfo.objectInfo.ref,
                                title: narrativeInfo.workspaceInfo.metadata['narrative_nice_name']
                            }

                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                narrative: {
                                    status: StepStatus.COMPLETE,
                                    params: null,
                                    value: { narrativeInfo: minimalNarrativeInfo }
                                },
                                citations,
                            });
                        }} />
                </div>
            case StepStatus.EDITING:
                return <div>
                    {this.renderStepTitle(1, 'Select Narrative')}
                    <SelectNarrativeController
                        model={this.props.model}
                        editMode="edit"
                        setTitle={this.props.setTitle}
                        selectedNarrative={section.value.narrativeInfo}
                        onDone={({ objectInfo: { wsid: workspaceId, id: objectId, version, ref }, workspaceInfo: { metadata } }: NarrativeInfo) => {
                            const citations: CitationsSection = (() => {
                                const nextStep = this.state.doiForm.sections.citations;
                                switch (nextStep.status) {
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

                            const narrativeInfo: MinimalNarrativeInfo = {
                                workspaceId, objectId, version, ref,
                                title: metadata['narrative_nice_name']
                            };

                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                narrative: {
                                    status: StepStatus.COMPLETE,
                                    params: null,
                                    value: { narrativeInfo }
                                },
                                citations
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
                    {this.renderStepDoneTitle(1, 'Select Narrative', onEdit)}
                    <SelectNarrativeViewController model={this.props.model} selectedNarrative={section.value.narrativeInfo} />
                </div>
            }
        }
    }

    renderCitationsSection(section: CitationsSection) {
        const stepNumber = 2;
        const title = "Citations from Narrative";
        switch (section.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE:
                // should never be true, but need for type narrowing.
                if (this.state.doiForm.sections.narrative.status !== StepStatus.COMPLETE) {
                    return;
                }
                return <div>
                    {this.renderStepTitle(stepNumber, `${title} "${this.state.doiForm.sections.narrative.value.narrativeInfo.title}"`)}
                    <CitationsSectionEditor
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        narrativeInfo={this.state.doiForm.sections.narrative.value.narrativeInfo}
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
                                citations: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: citations
                                },
                                orcidLink
                            })
                        }}
                    />
                </div>
            case StepStatus.EDITING:
                // should never be true, but need for type narrowing.
                if (this.state.doiForm.sections.narrative.status !== StepStatus.COMPLETE) {
                    return;
                }
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <CitationsSectionEditor
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        narrativeInfo={this.state.doiForm.sections.narrative.value.narrativeInfo}
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
                                // should never get here... this is just for 
                                // type narrowing.
                                throw new Error('Invalid state - expected EDITING');
                            }
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                citations: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: citations
                                }
                            })
                        }}
                    />
                </div>
            case StepStatus.COMPLETE:
                return <div>
                    {this.renderStepDoneTitle(2, 'Citations')}
                    <CitationsViewController model={this.props.model} citations={section.value.citations} />
                </div>
        }
    }


    renderORCIDLinkSection(step: ORCIDLinkSection) {
        const title = 'ORCID Link';
        const stepNumber = 3;
        switch (step.status) {
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
                            const authors: AuthorsSection = (() => {
                                const nextSection = this.state.doiForm.sections.authors;
                                switch (nextSection.status) {
                                    case StepStatus.NONE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: {
                                                narrativeTitle: this.state.doiForm.sections.narrative.value.narrativeInfo.title
                                            }
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
                                orcidLink: {
                                    status: StepStatus.COMPLETE,
                                    params: null,
                                    value: { orcidLink: { orcidId } }
                                },
                                authors
                            })
                        }} />
                </div>
            case StepStatus.COMPLETE:
                return this.renderStepDoneTitle(stepNumber, title);
        }
    }

    renderAuthorsStep(section: AuthorsSection) {
        const stepNumber = 4;
        const title = 'Primary and Other Authors';
        switch (section.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE:
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <AuthorsStep
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        narrativeTitle={section.params.narrativeTitle}
                        onDone={(title: string, author: Author) => {
                            const contracts: ContractsSection = (() => {
                                if (section.status !== StepStatus.INCOMPLETE) {
                                    // should never get here... this is just for 
                                    // type narrowing.
                                    throw new Error('Invalid state - expected INCOMPLETE');
                                }
                                const nextSection = this.state.doiForm.sections.contracts;
                                switch (nextSection.status) {
                                    case StepStatus.NONE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: null
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
                                authors: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: { title, author }
                                },
                                contracts
                            })
                        }}
                    />
                </div>
            case StepStatus.COMPLETE:
                return this.renderStepDoneTitle(stepNumber, title);
        }
    }


    renderContractNumbersStep(section: ContractsSection) {
        const stepNumber = 5;
        const title = 'Contract Numbers';
        switch (section.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE:
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <ContractNumbersFormController
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        onDone={(contractNumbers: ContractNumbers) => {
                            if (section.status !== StepStatus.INCOMPLETE) {
                                // should never get here... this is just for 
                                // type narrowing.
                                throw new Error('Invalid state - expected INCOMPLETE');
                            }
                            const geolocation: GeolocationSection = (() => {
                                const nextSection = this.state.doiForm.sections.geolocation;
                                switch (nextSection.status) {
                                    case StepStatus.NONE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: null
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
                                contracts: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: { contractNumbers }
                                },
                                geolocation
                            })

                        }}
                    />
                </div>
            case StepStatus.COMPLETE:
                return this.renderStepDoneTitle(stepNumber, title);
        }
    }

    renderGeolocationStep(section: GeolocationSection) {
        const stepNumber = 6;
        const title = 'Geolocation';
        switch (section.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE:
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <GeolocationController
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        onDone={(geolocationData: GeolocationData) => {
                            const description: DescriptionSection = (() => {
                                if (section.status !== StepStatus.INCOMPLETE) {
                                    // should never get here... this is just for 
                                    // type narrowing.
                                    throw new Error('Invalid state - expected INCOMPLETE');
                                }
                                const nextSection = this.state.doiForm.sections.description;
                                switch (nextSection.status) {
                                    case StepStatus.NONE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: null
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
                                geolocation: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: { geolocationData }
                                },
                                description
                            })
                        }}
                    />
                </div>
            case StepStatus.COMPLETE:
                return this.renderStepDoneTitle(stepNumber, title);
        }
    }

    staticNarrativeLink(id: number, version: number) {
        return `https://kbase.us/n/${id}/${version}`
    }

    renderDescriptionStep(section: DescriptionSection) {
        const stepNumber = 7;
        const title = 'Description';
        switch (section.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE:
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <DescriptionController
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        onDone={(description: Description) => {
                            if (section.status !== StepStatus.INCOMPLETE) {
                                // should never get here... this is just for 
                                // type narrowing.
                                throw new Error('Invalid state - expected INCOMPLETE');
                            }
                            const { narrative, citations, orcidLink, authors, contracts, geolocation } = this.state.doiForm.sections;
                            const enable = (
                                narrative.status === StepStatus.COMPLETE &&
                                citations.status === StepStatus.COMPLETE &&
                                orcidLink.status === StepStatus.COMPLETE &&
                                authors.status === StepStatus.COMPLETE &&
                                contracts.status === StepStatus.COMPLETE &&
                                geolocation.status === StepStatus.COMPLETE
                            );
                            let reviewAndSubmit: ReviewAndSubmitSection;
                            if (enable) {
                                const submission: OSTISubmission = {
                                    title: narrative.value.narrativeInfo.title,
                                    publication_date: 'foo', // TODO: get this from narrative, 
                                    contract_nos: contracts.value.contractNumbers.doe.join('; '),
                                    authors: [
                                        {
                                            first_name: authors.value.author.firstName,
                                            middle_name: authors.value.author.middleName,
                                            last_name: authors.value.author.lastName,
                                            affiliation_name: authors.value.author.institution,
                                            private_email: authors.value.author.emailAddress,
                                            orcid_id: authors.value.author.orcidId,
                                            contributor_type: 'ProjectLeader' // TODO: make this controlled, at least from the form
                                        }
                                    ],
                                    site_url: this.staticNarrativeLink(
                                        narrative.value.narrativeInfo.workspaceId,
                                        narrative.value.narrativeInfo.version
                                    ), // TODO: this should be the static narrative?
                                    dataset_type: 'GD', // TODO: what should it be?
                                    // site_input_code // TODO: user?
                                    keywords: description.keywords.join('; '),
                                    description: description.abstract,
                                    // doi_infix // TODO: use?
                                    accession_num: narrative.value.narrativeInfo.ref,
                                    // sponsor_org // TODO use?
                                    // originating_research_org // TODO use?

                                }
                                reviewAndSubmit = (() => {
                                    const nextSection = this.state.doiForm.sections.reviewAndSubmit;
                                    switch (nextSection.status) {
                                        case StepStatus.NONE:
                                            return {
                                                status: StepStatus.INCOMPLETE,
                                                params: { submission }
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
                            } else {
                                reviewAndSubmit = (() => {
                                    const nextSection = this.state.doiForm.sections.reviewAndSubmit;
                                    switch (nextSection.status) {
                                        case StepStatus.NONE:
                                            return {
                                                status: StepStatus.NONE
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
                            }
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                description: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: { description }
                                },
                                reviewAndSubmit
                            })
                        }}
                    />
                </div>
            case StepStatus.EDITING:
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <DescriptionController
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        description={section.value.description}
                        onDone={(description: Description) => {
                            if (section.status !== StepStatus.EDITING) {
                                // should never get here... this is just for 
                                // type narrowing.
                                throw new Error('Invalid state - expected EDITING');
                            }
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                description: {
                                    status: StepStatus.COMPLETE,
                                    params: section.params,
                                    value: { description }
                                }
                            })
                        }}
                    />
                </div>
            case StepStatus.COMPLETE:
                return this.renderStepDoneTitle(stepNumber, title);
        }
    }

    renderCompleteForm(submissionId: string) {
        return <div>
            <SubmissionController model={this.props.model} submissionId={submissionId} />
        </div>
    }

    renderReviewAndSubmitStep(section: ReviewAndSubmitSection) {
        const stepNumber = 8;
        const title = 'Review and Submit';
        // This step is a bit special, as it only becomes unlocked when the 
        // prior steps are COMPLETE.
        // TODO: The form model should be updated. Instead of being sequential,
        // express dependencies (e.g. select narrative -> citations, orcid link -> authors; samples -> geolocation)
        // and allow unlinked sections to be filled out ad-hoc.
        // Finally, the review and submit depends on EVERYTHING being complete :)
        //
        // But for now, let us just hack this together.
        const { narrative, citations, orcidLink, authors, contracts, geolocation, description } = this.state.doiForm.sections;
        const enable = (
            narrative.status === StepStatus.COMPLETE &&
            citations.status === StepStatus.COMPLETE &&
            orcidLink.status === StepStatus.COMPLETE &&
            authors.status === StepStatus.COMPLETE &&
            contracts.status === StepStatus.COMPLETE &&
            geolocation.status === StepStatus.COMPLETE &&
            description.status === StepStatus.COMPLETE
        );
        switch (section.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE:
                if (!enable) {
                    return <div>
                        {this.renderDisabledStepTitle(stepNumber, title)}
                        <p>
                            After all form sections have been completed, you
                            may review all of the data as it will be sent to
                            OSTI, and if it is solid, submit it.
                        </p>
                    </div>
                }
                const submission: OSTISubmission = {
                    title: narrative.value.narrativeInfo.title,
                    publication_date: 'foo', // TODO: get this from narrative, 
                    contract_nos: contracts.value.contractNumbers.doe.join('; '),
                    authors: [
                        {
                            first_name: authors.value.author.firstName,
                            middle_name: authors.value.author.middleName,
                            last_name: authors.value.author.lastName,
                            affiliation_name: authors.value.author.institution,
                            private_email: authors.value.author.emailAddress,
                            orcid_id: authors.value.author.orcidId,
                            contributor_type: 'ProjectLeader' // TODO: make this controlled, at least from the form
                        }
                    ],
                    site_url: this.staticNarrativeLink(
                        narrative.value.narrativeInfo.workspaceId,
                        narrative.value.narrativeInfo.version
                    ), // TODO: this should be the static narrative?
                    dataset_type: 'GD', // TODO: what should it be?
                    // site_input_code // TODO: user?
                    keywords: description.value.description.keywords.join('; '),
                    description: description.value.description.abstract,
                    // doi_infix // TODO: use?
                    accession_num: narrative.value.narrativeInfo.ref,
                    // sponsor_org // TODO use?
                    // originating_research_org // TODO use?

                }
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <ReviewAndSubmitController
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        submission={submission}
                        onDone={(reviewAndSubmitData: ReviewAndSubmitData) => {
                            this.syncViewState({
                                ...this.state.doiForm.sections,
                                reviewAndSubmit: {
                                    status: StepStatus.COMPLETE,
                                    params: { submission },
                                    value: reviewAndSubmitData
                                }
                            })
                        }}
                    />
                </div>
            case StepStatus.COMPLETE:
                return <div>
                    {this.renderStepDoneTitle(stepNumber, title)}
                    <p style={{ color: 'green', fontWeight: 'bold' }}>Congrats, your DOI request form has been successfully submitted! <span className="" /></p>
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
            orcidLink,
            authors,
            contracts,
            geolocation,
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
                            {this.renderCitationsSection(citations)}
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col>
                            {this.renderORCIDLinkSection(orcidLink)}
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col>
                            {this.renderAuthorsStep(authors)}
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col>
                            {this.renderContractNumbersStep(contracts)}
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col>
                            {this.renderGeolocationStep(geolocation)}
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col>
                            {this.renderDescriptionStep(description)}
                        </Col>
                    </Row>
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