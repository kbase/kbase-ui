import { Model } from 'apps/ORCIDLink/Model';
import {
    Author,
    CitationResults, ContractNumbers, Description, DOIForm, GeolocationData,
    MinimalNarrativeInfo, NarrativeInfo, OSTISubmission, ReviewAndSubmitData,
    STEPS3, StepStatus
} from 'apps/ORCIDLink/ORCIDLinkClient';
import { JSONObject } from 'lib/json';
import { Component } from 'react';
import { Alert, Button, Col, Row, Stack } from 'react-bootstrap';
import AuthorsStep from '../steps/AuthorsStep';
import CitationsStep from '../steps/Citations/CitationsController';
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

    jumpToStep(stepNumber: number) {
        const stepIndex = stepNumber - 1;
        const step = this.state.doiForm.steps[stepIndex];
        const steps = this.state.doiForm.steps;
        console.log('jump', stepIndex, step);
        switch (step.status) {
            case StepStatus.NONE:
                // TODO
                break;
            case StepStatus.INCOMPLETE:
                break;
            case StepStatus.COMPLETE:
                steps[stepIndex] = {
                    ...step,
                    status: StepStatus.EDITING,
                }
                break;
            case StepStatus.EDITING:
                steps[stepIndex] = {
                    ...step,
                    status: StepStatus.EDITING,
                }
        }
        this.setState({
            doiForm: {
                ...this.state.doiForm,
                steps
            }
        });
    }

    renderStepDoneTitle(step: number, title: string) {
        return <Alert variant="success" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '0' }}>
            <span>Step {step}: {title}</span>
            <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button variant="outline-secondary" style={{ border: 'none' }} size="sm" onClick={() => { this.jumpToStep(step); }}><span className="fa fa-edit" /></Button>
            </div>
        </Alert>
    }

    renderStepPendingTitle(step: number, title: string) {
        return <Alert variant="secondary">
            Step {step}: {title}
        </Alert>
    }

    syncViewState(steps: STEPS3) {
        // TODO: move into controller and pass as param
        try {
            this.props.model.saveDOIForm({
                form_id: this.state.doiForm.form_id,
                steps
            });
        } catch (ex) {
            console.error('Could not save form state!', ex);
        }
        this.setState({
            doiForm: {
                ...this.state.doiForm,
                steps
            }
        });
    }

    renderSelectNarrativeStep(step: STEPS3[0]) {
        switch (step.status) {
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
                            const nextStep: STEPS3[1] = (() => {
                                const nextStep = this.state.doiForm.steps[1];
                                switch (nextStep.status) {
                                    case StepStatus.NONE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: null
                                        };
                                    case StepStatus.INCOMPLETE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: step.params
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

                            this.syncViewState([
                                {
                                    status: StepStatus.COMPLETE,
                                    params: null,
                                    value: { narrativeInfo: minimalNarrativeInfo }
                                },
                                nextStep,
                                {
                                    ...this.state.doiForm.steps[2],
                                },
                                {
                                    ...this.state.doiForm.steps[3],
                                },
                                {
                                    ...this.state.doiForm.steps[4],
                                },
                                {
                                    ...this.state.doiForm.steps[5],
                                },
                                {
                                    ...this.state.doiForm.steps[6],
                                },
                                {
                                    ...this.state.doiForm.steps[7],
                                }
                            ])
                        }} />
                </div>
            case StepStatus.EDITING:
                return <div>
                    {this.renderStepTitle(1, 'Select Narrative')}
                    <SelectNarrativeController
                        model={this.props.model}
                        editMode="edit"
                        setTitle={this.props.setTitle}
                        selectedNarrative={step.value.narrativeInfo}
                        onDone={({ objectInfo: { wsid: workspaceId, id: objectId, version, ref }, workspaceInfo: { metadata } }: NarrativeInfo) => {
                            const nextStep: STEPS3[1] = (() => {
                                const nextStep = this.state.doiForm.steps[1];
                                switch (nextStep.status) {
                                    case StepStatus.NONE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: null
                                        };
                                    case StepStatus.INCOMPLETE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: step.params
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

                            this.syncViewState([
                                {
                                    status: StepStatus.COMPLETE,
                                    params: null,
                                    value: { narrativeInfo }
                                },
                                nextStep,
                                {
                                    ...this.state.doiForm.steps[2],
                                },
                                {
                                    ...this.state.doiForm.steps[3],
                                },
                                {
                                    ...this.state.doiForm.steps[4],
                                },
                                {
                                    ...this.state.doiForm.steps[5],
                                },
                                {
                                    ...this.state.doiForm.steps[6],
                                },
                                {
                                    ...this.state.doiForm.steps[7],
                                }
                            ])
                        }} />
                </div>
            case StepStatus.COMPLETE:
                return <div>
                    {this.renderStepDoneTitle(1, 'Select Narrative')}
                    <SelectNarrativeViewController model={this.props.model} selectedNarrative={step.value.narrativeInfo} />
                </div>
        }
    }

    renderCitationsStep(step: STEPS3[1]) {
        const stepNumber = 2;
        const title = 'Citations';
        switch (step.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE:
                // should never be true, but need for type narrowing.
                if (this.state.doiForm.steps[0].status !== StepStatus.COMPLETE) {
                    return;
                }
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <CitationsStep
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        narrativeInfo={this.state.doiForm.steps[0].value.narrativeInfo}
                        onDone={(citations: CitationResults) => {
                            if (step.status !== StepStatus.INCOMPLETE) {
                                // should never get here... this is just for 
                                // type narrowing.
                                throw new Error('Invalid state - expected INCOMPLETE');
                            }
                            const nextStep: STEPS3[2] = (() => {
                                const nextStep = this.state.doiForm.steps[2];
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
                            this.syncViewState([
                                this.state.doiForm.steps[0],
                                {
                                    status: StepStatus.COMPLETE,
                                    params: step.params,
                                    value: citations
                                },
                                nextStep,
                                {
                                    ...this.state.doiForm.steps[3],
                                },
                                {
                                    ...this.state.doiForm.steps[4],
                                },
                                {
                                    ...this.state.doiForm.steps[5],
                                },
                                {
                                    ...this.state.doiForm.steps[6],
                                },
                                {
                                    ...this.state.doiForm.steps[7],
                                }
                            ])

                        }}
                    />
                </div>
            case StepStatus.EDITING:
                // should never be true, but need for type narrowing.
                if (this.state.doiForm.steps[0].status !== StepStatus.COMPLETE) {
                    return;
                }
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <CitationsStep
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        narrativeInfo={this.state.doiForm.steps[0].value.narrativeInfo}
                        onDone={(citations: CitationResults) => {
                            if (step.status !== StepStatus.EDITING) {
                                // should never get here... this is just for 
                                // type narrowing.
                                throw new Error('Invalid state - expected EDITING');
                            }
                            this.syncViewState([
                                this.state.doiForm.steps[0],
                                {
                                    status: StepStatus.COMPLETE,
                                    params: step.params,
                                    value: citations
                                },
                                {
                                    ...this.state.doiForm.steps[2],
                                },
                                {
                                    ...this.state.doiForm.steps[3],
                                },
                                {
                                    ...this.state.doiForm.steps[4],
                                },
                                {
                                    ...this.state.doiForm.steps[5],
                                },
                                {
                                    ...this.state.doiForm.steps[6],
                                },
                                {
                                    ...this.state.doiForm.steps[7],
                                }
                            ])

                        }}
                    />
                </div>
            case StepStatus.COMPLETE:
                return this.renderStepDoneTitle(stepNumber, title);
        }
    }


    renderORCIDLinkStep(step: STEPS3[2]) {
        const title = 'ORCID Link';
        const stepNumber = 3;
        switch (step.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE:
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <ORCIDLink model={this.props.model}
                        stepsState={JSON.stringify(this.state.doiForm.steps)}
                        formId={this.props.doiForm.form_id}
                        setTitle={this.props.setTitle}
                        onDone={(orcidId: string | null) => {
                            if (this.state.doiForm.steps[0].status !== StepStatus.COMPLETE) {
                                return;
                            }
                            const nextStep: STEPS3[3] = (() => {
                                const nextStep = this.state.doiForm.steps[3];
                                switch (nextStep.status) {
                                    case StepStatus.NONE:
                                        return {
                                            status: StepStatus.INCOMPLETE,
                                            params: {
                                                narrativeTitle: this.state.doiForm.steps[0].value.narrativeInfo.title
                                            }
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
                            this.syncViewState([
                                this.state.doiForm.steps[0],
                                this.state.doiForm.steps[1],
                                {
                                    status: StepStatus.COMPLETE,
                                    params: null,
                                    value: { orcidLink: { orcidId } }
                                },
                                nextStep,
                                {
                                    status: StepStatus.NONE,
                                },
                                {
                                    status: StepStatus.NONE,
                                },
                                {
                                    status: StepStatus.NONE,
                                },
                                {
                                    status: StepStatus.NONE,
                                }
                            ])
                        }} />
                </div>
            case StepStatus.COMPLETE:
                return this.renderStepDoneTitle(stepNumber, title);
        }
    }

    renderAuthorsStep(step: STEPS3[3]) {
        const stepNumber = 4;
        const title = 'Primary and Other Authors';
        switch (step.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE:
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <AuthorsStep
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        narrativeTitle={step.params.narrativeTitle}
                        onDone={(title: string, author: Author) => {
                            const nextStep: STEPS3[4] = (() => {
                                if (step.status !== StepStatus.INCOMPLETE) {
                                    // should never get here... this is just for 
                                    // type narrowing.
                                    throw new Error('Invalid state - expected INCOMPLETE');
                                }
                                const nextStep = this.state.doiForm.steps[4];
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
                            this.syncViewState([
                                this.state.doiForm.steps[0],
                                this.state.doiForm.steps[1],
                                this.state.doiForm.steps[2],
                                {
                                    status: StepStatus.COMPLETE,
                                    params: step.params,
                                    value: { title, author }
                                },
                                nextStep,
                                {
                                    status: StepStatus.NONE,
                                },
                                {
                                    status: StepStatus.NONE,
                                },
                                {
                                    status: StepStatus.NONE,
                                }
                            ])
                        }}
                    />
                </div>
            case StepStatus.COMPLETE:
                return this.renderStepDoneTitle(stepNumber, title);
        }
    }


    renderContractNumbersStep(step: STEPS3[4]) {
        const stepNumber = 5;
        const title = 'Contract Numbers';
        switch (step.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE:
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <ContractNumbersFormController
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        onDone={(contractNumbers: ContractNumbers) => {
                            if (step.status !== StepStatus.INCOMPLETE) {
                                // should never get here... this is just for 
                                // type narrowing.
                                throw new Error('Invalid state - expected INCOMPLETE');
                            }
                            const nextStep: STEPS3[5] = (() => {
                                const nextStep = this.state.doiForm.steps[5];
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
                            this.syncViewState([
                                this.state.doiForm.steps[0],
                                this.state.doiForm.steps[1],
                                this.state.doiForm.steps[2],
                                this.state.doiForm.steps[3],
                                {
                                    status: StepStatus.COMPLETE,
                                    params: step.params,
                                    value: { contractNumbers }
                                },
                                nextStep,
                                {
                                    status: StepStatus.NONE,
                                },
                                {
                                    status: StepStatus.NONE,
                                }
                            ])

                        }}
                    />
                </div>
            case StepStatus.COMPLETE:
                return this.renderStepDoneTitle(stepNumber, title);
        }
    }

    renderGeolocationStep(step: STEPS3[5]) {
        const stepNumber = 6;
        const title = 'Geolocation';
        switch (step.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE:
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <GeolocationController
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        onDone={(geolocationData: GeolocationData) => {
                            const nextStep: STEPS3[6] = (() => {
                                if (step.status !== StepStatus.INCOMPLETE) {
                                    // should never get here... this is just for 
                                    // type narrowing.
                                    throw new Error('Invalid state - expected INCOMPLETE');
                                }
                                const nextStep = this.state.doiForm.steps[6];
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
                            this.syncViewState([
                                this.state.doiForm.steps[0],
                                this.state.doiForm.steps[1],
                                this.state.doiForm.steps[2],
                                this.state.doiForm.steps[3],
                                this.state.doiForm.steps[4],
                                {
                                    status: StepStatus.COMPLETE,
                                    params: step.params,
                                    value: { geolocationData }
                                },
                                nextStep,
                                {
                                    status: StepStatus.NONE,
                                }
                            ]
                            )

                        }}
                    />
                </div>
            case StepStatus.COMPLETE:
                return this.renderStepDoneTitle(stepNumber, title);
        }
    }

    renderDescriptionStep(step: STEPS3[6]) {
        const stepNumber = 7;
        const title = 'Description';
        switch (step.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE:
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <DescriptionController
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        onDone={(description: Description) => {
                            if (step.status !== StepStatus.INCOMPLETE) {
                                // should never get here... this is just for 
                                // type narrowing.
                                throw new Error('Invalid state - expected INCOMPLETE');
                            }
                            const steps = this.state.doiForm.steps;
                            const [selectNarrativeStep, citationsStep, orcidLinkStep, authorsStep, contractStep, geolocationStep, descriptionStep] = steps;
                            const enable = (
                                selectNarrativeStep.status === StepStatus.COMPLETE &&
                                citationsStep.status === StepStatus.COMPLETE &&
                                orcidLinkStep.status === StepStatus.COMPLETE &&
                                authorsStep.status === StepStatus.COMPLETE &&
                                contractStep.status === StepStatus.COMPLETE &&
                                geolocationStep.status === StepStatus.COMPLETE
                            );
                            let nextStep: STEPS3[7];
                            if (enable) {
                                const submission: OSTISubmission = {
                                    title: selectNarrativeStep.value.narrativeInfo.title,
                                    publication_date: 'foo', // TODO: get this from narrative, 
                                    contract_nos: contractStep.value.contractNumbers.doe.join('; '),
                                    authors: [
                                        {
                                            first_name: authorsStep.value.author.firstName,
                                            middle_name: authorsStep.value.author.middleName,
                                            last_name: authorsStep.value.author.lastName,
                                            affiliation_name: authorsStep.value.author.institution,
                                            private_email: authorsStep.value.author.emailAddress,
                                            orcid_id: authorsStep.value.author.orcidId,
                                            contributor_type: 'ProjectLeader' // TODO: make this controlled, at least from the form
                                        }
                                    ],
                                    site_url: `https://kbase.us/n/${selectNarrativeStep.value.narrativeInfo.workspaceId}/${selectNarrativeStep.value.narrativeInfo.version}`, // TODO: this should be the static narrative?
                                    dataset_type: 'GD', // TODO: what should it be?
                                    // site_input_code // TODO: user?
                                    keywords: description.keywords.join('; '),
                                    description: description.abstract,
                                    // doi_infix // TODO: use?
                                    accession_num: selectNarrativeStep.value.narrativeInfo.ref,
                                    // sponsor_org // TODO use?
                                    // originating_research_org // TODO use?

                                }
                                nextStep = (() => {
                                    const nextStep = this.state.doiForm.steps[7];
                                    switch (nextStep.status) {
                                        case StepStatus.NONE:
                                            return {
                                                status: StepStatus.INCOMPLETE,
                                                params: { submission }
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
                            } else {
                                nextStep = (() => {
                                    const nextStep = this.state.doiForm.steps[7];
                                    switch (nextStep.status) {
                                        case StepStatus.NONE:
                                            return {
                                                status: StepStatus.NONE
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
                            }
                            this.syncViewState([
                                this.state.doiForm.steps[0],
                                this.state.doiForm.steps[1],
                                this.state.doiForm.steps[2],
                                this.state.doiForm.steps[3],
                                this.state.doiForm.steps[4],
                                this.state.doiForm.steps[5],
                                {
                                    status: StepStatus.COMPLETE,
                                    params: step.params,
                                    value: { description }
                                },
                                nextStep
                            ]
                            )
                        }}
                    />
                </div>
            case StepStatus.EDITING:
                console.log('wtf', step.value.description);
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <DescriptionController
                        model={this.props.model}
                        setTitle={this.props.setTitle}
                        description={step.value.description}
                        onDone={(description: Description) => {
                            if (step.status !== StepStatus.EDITING) {
                                // should never get here... this is just for 
                                // type narrowing.
                                throw new Error('Invalid state - expected EDITING');
                            }
                            const steps = this.state.doiForm.steps;
                            // const [selectNarrativeStep, citationsStep, orcidLinkStep, authorsStep, contractStep, geolocationStep, descriptionStep] = steps;
                            // const enable = (
                            //     selectNarrativeStep.status === StepStatus.COMPLETE &&
                            //     citationsStep.status === StepStatus.COMPLETE &&
                            //     orcidLinkStep.status === StepStatus.COMPLETE &&
                            //     authorsStep.status === StepStatus.COMPLETE &&
                            //     contractStep.status === StepStatus.COMPLETE &&
                            //     geolocationStep.status === StepStatus.COMPLETE
                            // );
                            // let nextStep: STEPS3[7];
                            // if (enable) {
                            //     const submission: OSTISubmission = {
                            //         title: selectNarrativeStep.value.narrativeInfo.title,
                            //         publication_date: 'foo', // TODO: get this from narrative, 
                            //         contract_nos: contractStep.value.contractNumbers.doe.join('; '),
                            //         authors: [
                            //             {
                            //                 first_name: authorsStep.value.author.firstName,
                            //                 middle_name: authorsStep.value.author.middleName,
                            //                 last_name: authorsStep.value.author.lastName,
                            //                 affiliation_name: authorsStep.value.author.institution,
                            //                 private_email: authorsStep.value.author.emailAddress,
                            //                 orcid_id: authorsStep.value.author.orcidId,
                            //                 contributor_type: 'ProjectLeader' // TODO: make this controlled, at least from the form
                            //             }
                            //         ],
                            //         site_url: `https://kbase.us/n/${selectNarrativeStep.value.narrativeInfo.workspaceId}/${selectNarrativeStep.value.narrativeInfo.version}`, // TODO: this should be the static narrative?
                            //         dataset_type: 'GD', // TODO: what should it be?
                            //         // site_input_code // TODO: user?
                            //         keywords: description.keywords.join('; '),
                            //         description: description.abstract,
                            //         // doi_infix // TODO: use?
                            //         accession_num: selectNarrativeStep.value.narrativeInfo.ref,
                            //         // sponsor_org // TODO use?
                            //         // originating_research_org // TODO use?

                            //     }
                            //     // nextStep = (() => {
                            //     //     const nextStep = this.state.doiForm.steps[7];
                            //     //     switch (nextStep.status) {
                            //     //         case StepStatus.NONE:
                            //     //             return {
                            //     //                 status: StepStatus.INCOMPLETE,
                            //     //                 params: { submission }
                            //     //             };
                            //     //         case StepStatus.INCOMPLETE:
                            //     //             return {
                            //     //                 status: StepStatus.INCOMPLETE,
                            //     //                 params: nextStep.params,
                            //     //             };
                            //     //         case StepStatus.COMPLETE:
                            //     //             return {
                            //     //                 status: StepStatus.INCOMPLETE,
                            //     //                 params: nextStep.params,
                            //     //                 value: nextStep.value
                            //     //             }
                            //     //         case StepStatus.EDITING:
                            //     //             return {
                            //     //                 status: StepStatus.EDITING,
                            //     //                 params: nextStep.params,
                            //     //                 value: nextStep.value
                            //     //             }
                            //     //     }
                            //     // })();
                            // } else {
                            //     nextStep = (() => {
                            //         const nextStep = this.state.doiForm.steps[7];
                            //         switch (nextStep.status) {
                            //             case StepStatus.NONE:
                            //                 return {
                            //                     status: StepStatus.NONE
                            //                 };
                            //             case StepStatus.INCOMPLETE:
                            //                 return {
                            //                     status: StepStatus.INCOMPLETE,
                            //                     params: nextStep.params,
                            //                 };
                            //             case StepStatus.COMPLETE:
                            //                 return {
                            //                     status: StepStatus.INCOMPLETE,
                            //                     params: nextStep.params,
                            //                     value: nextStep.value
                            //                 }
                            //             case StepStatus.EDITING:
                            //                 return {
                            //                     status: StepStatus.EDITING,
                            //                     params: nextStep.params,
                            //                     value: nextStep.value
                            //                 }
                            //         }
                            //     })();
                            // }
                            this.syncViewState([
                                this.state.doiForm.steps[0],
                                this.state.doiForm.steps[1],
                                this.state.doiForm.steps[2],
                                this.state.doiForm.steps[3],
                                this.state.doiForm.steps[4],
                                this.state.doiForm.steps[5],
                                {
                                    status: StepStatus.COMPLETE,
                                    params: step.params,
                                    value: { description }
                                },
                                this.state.doiForm.steps[7],
                            ]
                            )
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

    renderReviewAndSubmitStep(step: STEPS3[7]) {
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
        const steps = this.state.doiForm.steps;
        const [selectNarrativeStep, citationsStep, orcidLinkStep, authorsStep, contractStep, geolocationStep, descriptionStep] = steps;
        const enable = (
            selectNarrativeStep.status === StepStatus.COMPLETE &&
            citationsStep.status === StepStatus.COMPLETE &&
            orcidLinkStep.status === StepStatus.COMPLETE &&
            authorsStep.status === StepStatus.COMPLETE &&
            contractStep.status === StepStatus.COMPLETE &&
            geolocationStep.status === StepStatus.COMPLETE &&
            descriptionStep.status === StepStatus.COMPLETE
        );
        switch (step.status) {
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
                    title: selectNarrativeStep.value.narrativeInfo.title,
                    publication_date: 'foo', // TODO: get this from narrative, 
                    contract_nos: contractStep.value.contractNumbers.doe.join('; '),
                    authors: [
                        {
                            first_name: authorsStep.value.author.firstName,
                            middle_name: authorsStep.value.author.middleName,
                            last_name: authorsStep.value.author.lastName,
                            affiliation_name: authorsStep.value.author.institution,
                            private_email: authorsStep.value.author.emailAddress,
                            orcid_id: authorsStep.value.author.orcidId,
                            contributor_type: 'ProjectLeader' // TODO: make this controlled, at least from the form
                        }
                    ],
                    site_url: `https://kbase.us/n/${selectNarrativeStep.value.narrativeInfo.workspaceId}/${selectNarrativeStep.value.narrativeInfo.version}`, // TODO: this should be the static narrative?
                    dataset_type: 'GD', // TODO: what should it be?
                    // site_input_code // TODO: user?
                    keywords: descriptionStep.value.description.keywords.join('; '),
                    description: descriptionStep.value.description.abstract,
                    // doi_infix // TODO: use?
                    accession_num: selectNarrativeStep.value.narrativeInfo.ref,
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
                            this.syncViewState([
                                this.state.doiForm.steps[0],
                                this.state.doiForm.steps[1],
                                this.state.doiForm.steps[2],
                                this.state.doiForm.steps[3],
                                this.state.doiForm.steps[4],
                                this.state.doiForm.steps[5],
                                this.state.doiForm.steps[6],
                                {
                                    status: StepStatus.COMPLETE,
                                    params: { submission },
                                    value: reviewAndSubmitData
                                }
                            ]
                            )
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

        const [
            selectNarrativeStep,
            citationsStep,
            orcidLinkStep,
            authorsStep,
            contractNumbersStep,
            geolocationStep,
            descriptionStep,
            reviewAndSubmitStep
        ]: STEPS3 = this.state.doiForm.steps;
        return <div className={styles.main}>
            <h2>DOI Request Form</h2>
            <p>
                <Button variant="secondary" href="/#orcidlink/demos/doi"><span className="fa fa-mail-reply" /> Back</Button>
            </p>
            <p>
                This is a DOI Request form with ORCID linking assistance
            </p>
            <div className={styles.steps}>
                <Stack gap={3}>
                    <Row className="g-0">
                        <Col>
                            {this.renderSelectNarrativeStep(selectNarrativeStep)}
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col>
                            {this.renderCitationsStep(citationsStep)}
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col>
                            {this.renderORCIDLinkStep(orcidLinkStep)}
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col>
                            {this.renderAuthorsStep(authorsStep)}
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col>
                            {this.renderContractNumbersStep(contractNumbersStep)}
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col>
                            {this.renderGeolocationStep(geolocationStep)}
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col>
                            {this.renderDescriptionStep(descriptionStep)}
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col>
                            {this.renderReviewAndSubmitStep(reviewAndSubmitStep)}
                        </Col>
                    </Row>
                </Stack>
            </div>
        </div>;
    }
}