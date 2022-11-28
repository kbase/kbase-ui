import { Citation } from 'apps/ORCIDLink/ORCIDLinkClient';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Model } from '../../../../Model';
import CitationForm from './Form';


/**
 * Async model for getCitation.
 */

export type GetCitationProcess = AsyncProcess<{ citation: string }, { message: string }>


export interface ManualCitationFormControllerProps {
    addCitation: (citation: Citation) => void;
    model: Model;
}

interface ManualCitationFormControllerState {
    getCitationProcess: GetCitationProcess
}

export class ManualCitationFormController extends Component<ManualCitationFormControllerProps, ManualCitationFormControllerState> {
    constructor(props: ManualCitationFormControllerProps) {
        super(props);

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
            const rawCitation = await this.props.model.getDOICitation(doi);
            // Remove the leading "1. " from the citation."
            const citation = (() => {
                const m = /^\d+\.\s+(.+)$/.exec(rawCitation.citation);
                if (m === null) {
                    return rawCitation.citation;
                }
                console.log('em', m);
                return m[1];
            })();
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


// export interface ManualCitationsEntrypointProps {
//     addCitation: (citation: Citation) => void;
// }

// export default class ManualCitationsEntrypoint extends Component<ManualCitationsEntrypointProps> {
//     render() {
//         return <ConfigContext.Consumer>
//             {(configValue: ConfigState) => {
//                 if (configValue.status !== AsyncProcessStatus.SUCCESS) {
//                     return;
//                 }
//                 return <ManualCitationFormController addCitation={this.props.addCitation} config={configValue.value.config} />
//             }}
//         </ConfigContext.Consumer>
//     }
// }