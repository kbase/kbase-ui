import { Citation } from 'apps/ORCIDLink/Model';
import { ConfigContext, ConfigState } from 'contexts/ConfigContext';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Config } from 'types/config';
import { Model } from '../Model';
import CitationForm from './Form';


/**
 * Async model for getCitation.
 */

export type GetCitationProcess = AsyncProcess<{ citation: string }, { message: string }>


export interface CitationFormControllerProps {
    addCitation: (citation: Citation) => void;
    config: Config
}

interface CitationFormControllerState {
    getCitationProcess: GetCitationProcess
}

export class CitationFormController extends Component<CitationFormControllerProps, CitationFormControllerState> {
    model: Model;
    constructor(props: CitationFormControllerProps) {
        super(props);
        this.model = new Model({
            config: props.config
        });
        this.state = {
            getCitationProcess: {
                status: AsyncProcessStatus.NONE
            }
        }
    }
    async getWork(doi: string) {
        this.setState({
            getCitationProcess: {
                status: AsyncProcessStatus.PENDING
            }
        });

        try {
            const citation = await this.model.getCitation(doi);
            if (citation === null) {
                this.setState({
                    getCitationProcess: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: 'This DOI could not be found'
                        }
                    }
                });
            } else {
                this.setState({
                    getCitationProcess: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: { citation }
                    }
                })
            }
        } catch (ex) {
            this.setState({
                getCitationProcess: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message: ex instanceof Error ? ex.message : 'Unknown Error'
                    }
                }
            });
        }
    }

    addCitation(citation: Citation) {
        this.props.addCitation(citation);
        this.setState({
            getCitationProcess: {
                status: AsyncProcessStatus.NONE
            }
        });
    }

    render() {
        return <CitationForm
            getCitation={this.getWork.bind(this)}
            citationProcess={this.state.getCitationProcess}
            onSelect={this.addCitation.bind(this)}
        />
    }
}


export interface ManualCitationsEntrypointProps {
    addCitation: (citation: Citation) => void;
}

export default class ManualCitationsEntrypoint extends Component<ManualCitationsEntrypointProps> {
    render() {
        return <ConfigContext.Consumer>
            {(configValue: ConfigState) => {
                if (configValue.status !== AsyncProcessStatus.SUCCESS) {
                    return;
                }
                return <CitationFormController addCitation={this.props.addCitation} config={configValue.value.config} />
            }}
        </ConfigContext.Consumer>
    }
}