import { Component } from 'react';
import { ORCIDLinkState } from './Controller';
import styles from './View.module.css';
import { Alert, ThemeProvider } from 'react-bootstrap';
import AuthorsStep from './steps/AuthorsStep';
import CitationsStep from './steps/CitationsController';
import { Author, CitationResults, Citations, ContractNumbers, ContractNumbersResults, Description, DescriptionResults, DOIForm, GeolocationData, GeolocationDataResults, MinimalNarrativeInfo, Model, NarrativeSelectionResult, ORCIDLinkResult, ORCIDProfile, ReviewAndSubmitData, STEPS3, StepStatus } from 'apps/ORCIDLink/Model';
import SelectNarrativeController from './steps/SelectNarrativeController';
import ORCIDLink from './steps/ORCIDLinkController';
import { JSONObject } from 'lib/json';
import ContractNumbersFormController from './steps/ContractNumbersFormController';
import GeolocationController from './steps/Geolocation/GeolocationController';
import DescriptionController from './steps/DescriptionController';
import ReviewAndSubmitController from './steps/ReviewAndSubmitController';


export interface ViewProps {
    orcidState: ORCIDLinkState;
    model: Model;
    process?: JSONObject;
    doiForm: DOIForm;
}
interface ViewState {
    doiForm: DOIForm
}

export default class View extends Component<ViewProps, ViewState> {
    constructor(props: ViewProps) {
        super(props);
        // if (this.props.process) {
        //     this.state = {
        //         doiForm: {
        //             formId: 'FOO',
        //             steps: (this.props.process as unknown as STEPS3)
        //         }
        //     }
        // } else if (this.props.doiForm) {
        //     this.state = {
        //         doiForm: this.props.doiForm
        //     }
        // } else {

        //     console.log('formId!', formId);
        //     this.state = {
        //         doiForm: {
        //             formId,
        //             steps: [
        //                 {
        //                     status: StepStatus.INCOMPLETE,
        //                     params: null
        //                 },
        //                 {
        //                     status: StepStatus.NONE,
        //                 },
        //                 {
        //                     status: StepStatus.NONE,
        //                 },
        //                 {
        //                     status: StepStatus.NONE,
        //                 },
        //                 {
        //                     status: StepStatus.NONE,
        //                 },
        //                 {
        //                     status: StepStatus.NONE,
        //                 },
        //                 {
        //                     status: StepStatus.NONE,
        //                 },
        //                 {
        //                     status: StepStatus.NONE,
        //                 }
        //             ]
        //         }
        //     }
        // }
        const { doiForm } = this.props;
        this.state = { doiForm };
    }

    renderStepTitle(step: number, title: string) {
        return <Alert variant="info" style={{ fontWeight: 'bold' }}>
            Step {step}: {title}
        </Alert>
    }

    renderStepDoneTitle(step: number, title: string) {
        return <Alert variant="success">
            Step {step}: {title}
        </Alert>
    }

    renderStepPendingTitle(step: number, title: string) {
        return <Alert variant="secondary">
            Step {step}: {title}
        </Alert>
    }

    syncViewState(steps: STEPS3) {
        try {
            this.props.model.saveDOIForm({
                formId: this.state.doiForm.formId,
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
                    <SelectNarrativeController model={this.props.model} onDone={(narrativeInfo: MinimalNarrativeInfo) => {
                        this.syncViewState([
                            {
                                ...this.state.doiForm.steps[0],
                                status: StepStatus.COMPLETE,
                                value: { narrativeInfo }
                            },
                            {
                                ...this.state.doiForm.steps[1],
                                status: StepStatus.INCOMPLETE,
                                params: null
                            },
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
                return this.renderStepDoneTitle(1, 'Select Narrative');
        }
    }

    renderORCIDLinkStep(step: STEPS3[1]) {
        const title = 'ORCID Link';
        const stepNumber = 2;
        switch (step.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE:
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <ORCIDLink model={this.props.model}
                        stepsState={JSON.stringify(this.state.doiForm.steps)}
                        onDone={(orcidId: string | null) => {
                            if (this.state.doiForm.steps[0].status !== StepStatus.COMPLETE) {
                                return;
                            }
                            this.syncViewState([
                                this.state.doiForm.steps[0],
                                {
                                    ...this.state.doiForm.steps[1],
                                    status: StepStatus.COMPLETE,
                                    value: { orcidLink: { orcidId } }
                                },

                                {
                                    ...this.state.doiForm.steps[2],
                                    status: StepStatus.INCOMPLETE,
                                    params: {
                                        narrativeTitle: this.state.doiForm.steps[0].value.narrativeInfo.title
                                    }
                                },
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

    renderAuthorsStep(step: STEPS3[2]) {
        const stepNumber = 3;
        const title = 'Primary and Other Authors';
        switch (step.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE:
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <AuthorsStep
                        model={this.props.model}
                        narrativeTitle={step.params.narrativeTitle}
                        onDone={(title: string, author: Author) => {
                            this.syncViewState([
                                this.state.doiForm.steps[0],
                                this.state.doiForm.steps[1],
                                {
                                    status: StepStatus.COMPLETE,
                                    value: { title, author }
                                },
                                {
                                    status: StepStatus.INCOMPLETE,
                                    params: null
                                },
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
                        }}
                    />
                </div>
            case StepStatus.COMPLETE:
                return this.renderStepDoneTitle(stepNumber, title);
        }
    }

    renderCitationsStep(step: STEPS3[3]) {
        const stepNumber = 4;
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
                        narrativeObjectRef={this.state.doiForm.steps[0].value.narrativeInfo.ref}
                        onDone={(citations: CitationResults) => {
                            this.syncViewState([
                                this.state.doiForm.steps[0],
                                this.state.doiForm.steps[1],
                                this.state.doiForm.steps[2],
                                // ...this.state.steps.slice(2)
                                {
                                    status: StepStatus.COMPLETE,
                                    value: citations
                                },
                                {
                                    status: StepStatus.INCOMPLETE,
                                    params: null
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
                        onDone={(contractNumbers: ContractNumbers) => {
                            this.syncViewState([
                                this.state.doiForm.steps[0],
                                this.state.doiForm.steps[1],
                                this.state.doiForm.steps[2],
                                this.state.doiForm.steps[3],
                                {
                                    status: StepStatus.COMPLETE,
                                    value: { contractNumbers }
                                },
                                {
                                    status: StepStatus.INCOMPLETE,
                                    params: null
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
                        onDone={(geolocationData: GeolocationData) => {
                            this.syncViewState([
                                this.state.doiForm.steps[0],
                                this.state.doiForm.steps[1],
                                this.state.doiForm.steps[2],
                                this.state.doiForm.steps[3],
                                this.state.doiForm.steps[4],
                                {
                                    status: StepStatus.COMPLETE,
                                    value: { geolocationData }
                                },
                                {
                                    status: StepStatus.INCOMPLETE,
                                    params: null
                                },
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
                        onDone={(description: Description) => {
                            this.syncViewState([
                                this.state.doiForm.steps[0],
                                this.state.doiForm.steps[1],
                                this.state.doiForm.steps[2],
                                this.state.doiForm.steps[3],
                                this.state.doiForm.steps[4],
                                this.state.doiForm.steps[5],
                                {
                                    status: StepStatus.COMPLETE,
                                    value: { description }
                                },
                                {
                                    status: StepStatus.INCOMPLETE,
                                    params: null
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

    renderReviewAndSubmitStep(step: STEPS3[7]) {
        const stepNumber = 8;
        const title = 'Review and Submit';
        switch (step.status) {
            case StepStatus.NONE:
                return this.renderStepPendingTitle(stepNumber, title);
            case StepStatus.INCOMPLETE:
                return <div>
                    {this.renderStepTitle(stepNumber, title)}
                    <ReviewAndSubmitController
                        model={this.props.model}
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
                                    value: reviewAndSubmitData
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

    render() {
        const [
            selectNarrativeStep,
            orcidLinkStep,
            authorsStep,
            citationsStep,
            contractNumbersStep,
            geolocationStep,
            descriptionStep,
            reviewAndSubmitStep
        ]: STEPS3 = this.state.doiForm.steps;
        return <div className={styles.main}>
            <h2>DOI Request Form</h2>
            <p>
                <a href="/#orcidlink">Back</a>
            </p>
            <p>
                This is a DOI Request form with ORCID linking assistance
            </p>
            <div className={styles.steps}>
                {this.renderSelectNarrativeStep(selectNarrativeStep)}
                {this.renderORCIDLinkStep(orcidLinkStep)}
                {this.renderAuthorsStep(authorsStep)}
                {this.renderCitationsStep(citationsStep)}
                {this.renderContractNumbersStep(contractNumbersStep)}
                {this.renderGeolocationStep(geolocationStep)}
                {this.renderDescriptionStep(descriptionStep)}
                {this.renderReviewAndSubmitStep(reviewAndSubmitStep)}
            </div>
        </div>;
    }
}