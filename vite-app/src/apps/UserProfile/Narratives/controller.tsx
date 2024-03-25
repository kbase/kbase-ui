import ErrorMessage from "components/ErrorMessage";
import Loading from "components/Loading";
import { AuthenticationStateAuthenticated } from "contexts/EuropaContext";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { SimpleError } from 'lib/SimpleError';
import { Component } from "react";
import { Config } from "types/config";
import { NarrativeData, UserProfileBFFService } from "../API";
import { SERVICE_CALL_TIMEOUT } from "../constants";
import Narratives from "./view";



/**
 * returns array of date in MMM DD YYY HH:MM:SS and one of below:
 * less than a min ago, # hours ago, # days ago, day: MMM DD YYYY (if it's more than a month)
 * @param {string} date date format
 * 
 */
export function dateElapsed(date: number): Array<string> {
    const delta = (Date.now() - +new Date(date)) / 1000000;
    const dayString = (new Date(date)).toString();
    // date format: MMM DD YYYY
    const day = dayString.slice(4, 7) + ' ' + dayString.slice(8, 10) + ' ' + dayString.slice(11, 15);
    //  date format: MMM DD YYYY HH:MM:SS
    const dayAndTime = day + ' ' + dayString.slice(16, 24);
    if (delta >= 2628) {
        // more than a month ago
        return [dayAndTime, day];
    } else if (delta < 2628 && delta >= 86.4) {
        // less than a month ago, but more than a day ago
        const days = (delta / (86.4)).toFixed(0);
        return [dayAndTime, days + ' days ago'];
    }
    else if (delta < 86.4 && delta >= 3.6) {
        return [day, (delta / 3.6).toFixed(0) + ' hours ago'];
    } else if (delta < 3.6 && delta >= 0.06) {
        return [dayAndTime, ((delta) * 10).toFixed(0) + ' min ago'];
    } else {
        return [dayAndTime, 'less than a min ago'];
    }
}

export type NarrativeType = 'mine' | 'they';

export interface NarrativesControllerProps {
    // narrativeType: NarrativeType;
    username: string;

    authState: AuthenticationStateAuthenticated;
    config: Config;
}




/**
 * Return list of narratives
 * @param param shared/mine/public
 * @param token kbase session cookie
 */
// export async function fetchNarrativesAPI(param: string, token: string, serviceWizardURL: string) {
//     // TODO: use the dynamic service client.
//     const bffServiceUrl = await getBFFServiceUrl(token, serviceWizardURL);
//     const url = bffServiceUrl + '/narrative_list/' + param;
//     const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//             Authorization: token
//         }
//     });
//     if (response.status === 500) {
//         console.error('Fetch Narratives 500 response:', response);
//         return [response.status, response.statusText];
//     }
//     try {
//         const narratives = await response.json();
//         return narratives;
//     } catch (err) {
//         console.error('fetch narratives failed', response);
//         return [response.status, response.statusText];
//     }
// }

export type NarrativesState = AsyncProcess<{ narratives: Array<NarrativeData>, username: string, isOwner: boolean }, SimpleError>;

interface NarrativesControllerState {
    narrativesState: NarrativesState
}

export default class NarrativesController extends Component<NarrativesControllerProps, NarrativesControllerState> {
    constructor(props: NarrativesControllerProps) {
        super(props);
        this.state = {
            narrativesState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }

    componentDidMount() {
        this.loadNarratives();
    }

    async loadNarratives() {
        this.setState({
            narrativesState: {
                status: AsyncProcessStatus.PENDING
            }
        });

        const {
            authInfo: {
                token,
                tokenInfo: {
                    user: authorizedUsername
                }
            }
        } = this.props.authState

        const {
            services: {
                ServiceWizard: {
                    url: serviceWizardURL
                }
            }
        } = this.props.config;
        const username = this.props.username || authorizedUsername;
        const isOwner = username === authorizedUsername;
        const client = new UserProfileBFFService({
            url: serviceWizardURL,
            timeout: SERVICE_CALL_TIMEOUT,
            token
        });
        const narrativeType = isOwner ? 'mine' : 'they';
        switch (narrativeType) {
            case "they": {
                try {
                    const [publicNarratives, sharedNarratives] = await Promise.all([client.narrativeList('public'), client.narrativeList('shared')]);

                    const narratives = [...publicNarratives, ...sharedNarratives].filter(({ owner }) => {
                        return owner === username;
                    });

                    this.setState({
                        narrativesState: {
                            status: AsyncProcessStatus.SUCCESS,
                            value: {
                                narratives,
                                isOwner,
                                username
                            }
                        }
                    })
                } catch (ex) {
                    const message = (() => {
                        if (ex instanceof Error) {
                            return ex.message;
                        }
                        return 'Unknown error';
                    })();
                    this.setState({
                        narrativesState: {
                            status: AsyncProcessStatus.ERROR,
                            error: {
                                message
                            }
                        }
                    });
                }
                break;
            }
            case 'mine': {
                try {
                    const narratives = await client.narrativeList('mine');
                    this.setState({
                        narrativesState: {
                            status: AsyncProcessStatus.SUCCESS,
                            value: {
                                narratives,
                                isOwner,
                                username
                            }
                        }
                    })
                } catch (ex) {
                    const message = (() => {
                        if (ex instanceof Error) {
                            return ex.message;
                        }
                        return 'Unknown error';
                    })();
                    this.setState({
                        narrativesState: {
                            status: AsyncProcessStatus.ERROR,
                            error: {
                                message
                            }
                        }
                    });
                }
            }
        }
    }

    render() {
        switch (this.state.narrativesState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <Loading message="Loading narratives..." />;
            case AsyncProcessStatus.ERROR:
                return <ErrorMessage message={this.state.narrativesState.error.message} />
            case AsyncProcessStatus.SUCCESS:
                return <Narratives isOwner={this.state.narrativesState.value.isOwner}
                    narratives={this.state.narrativesState.value.narratives}
                    username={this.state.narrativesState.value.username}
                />
        }
    }
}

