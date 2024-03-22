import { navigationPathToURL } from 'contexts/RouterContext';
import { Component } from 'react';
import { Alert, ProgressBar } from 'react-bootstrap';
import AlertMessage from '../../components/AlertMessage';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import { RouteProps } from '../../components/Router2';
import { AuthenticationState } from '../../contexts/EuropaContext';
import { Config } from '../../types/config';

const MAX_TRIES = 20;
const TIMEOUT = 60000;
const RETRY_PAUSE = 1000;
const SLIGHT_DELAY_BEFORE_REDIRECT = 500;

export async function waitFor(interval: number) {
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(null);
        }, interval);
    });
}

export class LoadingError extends Error {
    type: string;
    constructor(message: string, type: string) {
        super(message);
        this.type = type;
    }
}

export class LoadingHttpError extends Error {
    status: number;
    type: string;
    constructor(status: number, message: string, type: string) {
        super(message);
        this.status = status;
        this.type = type;
    }
}

export class UnauthenticatedError extends Error { }

export class UIError extends Error { }

export class TimeoutError extends Error {
    elapsed: number;
    timeout: number;
    constructor(elapsed: number, timeout: number) {
        super(`Timedout after ${elapsed}ms`);
        this.elapsed = elapsed;
        this.timeout = timeout;
    }
}

export enum LoadStatus {
    NONE = 'NONE',
    POKING = 'POKING',
    OK = 'OK',
    INIT_ERROR = 'INIT_ERROR',
    CHECK_ERROR = 'CHECK_ERROR',
    TIMED_OUT = 'TIMED_OUT',
    STRUCK_OUT = 'STRUCK_OUT',
}

export interface LoadStateBase {
    status: LoadStatus;
}

export interface LoadStateNone extends LoadStateBase {
    status: LoadStatus.NONE;
}

export interface LoadStatePoking extends LoadStateBase {
    status: LoadStatus.POKING;
    narrativeId: number;
    url: URL;
    tries: number;
}

export interface LoadStateOk extends LoadStateBase {
    status: LoadStatus.OK;
    narrativeId: number;
    url: URL;
}

export interface LoadStateInitError extends LoadStateBase {
    status: LoadStatus.INIT_ERROR;
    // url: string;
    title: string;
    message: string;
}

export interface LoadStateCheckError extends LoadStateBase {
    status: LoadStatus.CHECK_ERROR;
    title: string;
    message: string;
    narrativeId: number;
    url: URL;
}

export interface LoadStateTimedOut extends LoadStateBase {
    status: LoadStatus.TIMED_OUT;
    tries: number;
    timeout: number;
    elapsed: number;
    narrativeId: number;
    url: URL;
}

export interface LoadStateStruckOut extends LoadStateBase {
    status: LoadStatus.STRUCK_OUT;
    tries: number;
    elapsed: number;
    narrativeId: number;
    url: URL;
}

export type LoadState =
    | LoadStateNone
    | LoadStatePoking
    | LoadStateOk
    | LoadStateInitError
    | LoadStateCheckError
    | LoadStateStruckOut
    | LoadStateTimedOut;

export interface NarrativeLoaderProps extends RouteProps {
    config: Config;
    authState: AuthenticationState;
    setTitle: (title: string) => void;
}

interface NarrativeLoaderState {
    loadState: LoadState;
}

export default class NarrativeLoader extends Component<
    NarrativeLoaderProps,
    NarrativeLoaderState
> {
    state: NarrativeLoaderState = {
        loadState: {
            status: LoadStatus.NONE,
        }
    };

    urlToCheck() {
        return navigationPathToURL({
            path: `narrative/static/kbase/config/config.json`, 
            type: 'europaui'
        });
    }

    narrativeURL(narrativeId: number) {
        return navigationPathToURL({
            path: `/narrative/${narrativeId}`, 
            type: 'europaui'
        });
    }

    componentDidMount() {
        console.log('HERE');
        this.props.setTitle('Narrative Loader');
        const searchParams = this.props.hashPath.params || {};
        const narrativeIdRaw = searchParams['n'];
        if (!narrativeIdRaw) {
            this.setState({
                loadState: {
                    status: LoadStatus.INIT_ERROR,
                    title: "Missing Parameter",
                    message:
                        "The Narrative Loader requires the 'n' search parameter, which was not provided in the URL.",
                },
            });
            return;
        }

        if (!/^[1-9][0-9]*$/.test(narrativeIdRaw)) {
            this.setState({
                loadState: {
                    status: LoadStatus.INIT_ERROR,
                    title: "Invalid Parameter",
                    message: `The "n" search parameter in the URL is not an integer > 0: It is "${narrativeIdRaw}".`,
                },
            });
            return;
        }

        const narrativeId = parseInt(narrativeIdRaw);

        console.log('CHECKING', this.urlToCheck());

        this.setState(
            {
                loadState: {
                    status: LoadStatus.POKING,
                    tries: 0,
                    narrativeId,
                    url: this.urlToCheck()
                },
            },
            () => {
                this.tryLoading(narrativeId);
            }
        );
    }

    // checkNarrative2(url: string) {
    //     return Promise.resolve(true);
    // }

    renderProgress() { }

    async tryLoading(narrativeId: number) {
        if (this.state.loadState.status !== LoadStatus.POKING) {
            return;
        }
        try {
            const start = Date.now();
            for (let tries = 1; tries <= MAX_TRIES; tries += 1) {
                const retry = await this.checkNarrative(
                    this.state.loadState.url
                );
                if (retry) {
                    this.setState({
                        loadState: {
                            status: LoadStatus.POKING,
                            tries,
                            narrativeId,
                            url: this.urlToCheck(),
                        },
                    });

                    await waitFor(RETRY_PAUSE);
                } else {
                    this.setState({
                        loadState: {
                            status: LoadStatus.OK,
                            narrativeId,
                            url: this.urlToCheck()
                        },
                    });

                    return;
                }
            }
            await new Promise<void>((resolve) => {
                window.setTimeout(() => {
                    this.setState({
                        loadState: {
                            status: LoadStatus.STRUCK_OUT,
                            tries: MAX_TRIES,
                            elapsed: Date.now() - start,
                            narrativeId,
                            url: this.urlToCheck()
                        }
                    })
                    resolve();
                }, RETRY_PAUSE);
            });
        } catch (ex) {
            console.error('ERROR', ex);
            if (ex)
                if (ex instanceof LoadingError) {
                    this.setState({
                        loadState: {
                            status: LoadStatus.CHECK_ERROR,
                            title: "Error waiting for Narrative to start",
                            message: ex.message,
                            narrativeId, 
                            url: this.urlToCheck()
                        }
                    });
                } else if (ex instanceof TimeoutError) {
                    this.setState({
                        loadState: {
                            status: LoadStatus.CHECK_ERROR,
                            title: "Error waiting for Narrative to start",
                            message: ex.message,
                            narrativeId, 
                            url: this.urlToCheck()
                        }
                    });
                } else if (ex instanceof Error) {
                    this.setState({
                        loadState: {
                            status: LoadStatus.CHECK_ERROR,
                            title: "Error waiting for Narrative to start",
                            message: ex.message,
                            narrativeId, 
                            url: this.urlToCheck()
                        }
                    });
                } else {
                    this.setState({
                        loadState: {
                            status: LoadStatus.CHECK_ERROR,
                            title: 'Unknown Error',
                            message: 'An unknown error occurred waiting for the Narrative to start',
                            narrativeId, 
                            url: this.urlToCheck()
                        },
                    });
                }
        }
    }

    checkNarrative(url: URL) {
        const startTime = new Date().getTime();
        return new Promise<boolean>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = () => {
                switch (xhr.status) {
                    case 200:
                        // For /narrative/ checks, there is no 201 or 401, so we
                        // have to grok the state of a "successful" response from
                        // the content.
                        // If there is no auth cookie, set_proxy will redirect
                        // to #login, but that will merely provide the stub index
                        // page. This is our '401' signal.
                        // If the response was the creation of a new session,
                        // a different redirect is issued -- the one which normally
                        // brings a user here! This response should either be
                        // successful or a 502. If successful, the response will
                        // be the config file, and we know that it is both a json
                        // file (and parsable) and will have some "well known"
                        // properties.

                        try {
                            var config = JSON.parse(xhr.responseText);
                            if (config && config.version) {
                                resolve(false);
                            } else {
                                reject(
                                    new LoadingError(
                                        'Error in Narrative check response',
                                        'check'
                                    )
                                );
                            }
                        } catch (ex) {
                            // This is our fake '401'
                            return reject(new UnauthenticatedError());
                        }
                        break;
                    case 201:
                        // For check_narrative, this is the response which means
                        // that a session has been created.
                        resolve(true);
                        break;
                    case 502:
                        // On the next request, though, we pass through to
                        // the Jupyter server, which will not be ready for some
                        // period of time, and this will trigger a 502 in the
                        // nginx proxy layer.
                        resolve(true);
                        break;
                    default:
                        reject(
                            new LoadingHttpError(
                                xhr.status,
                                xhr.statusText,
                                xhr.responseText
                            )
                        );
                }
            };

            xhr.ontimeout = () => {
                const elapsed = new Date().getTime() - startTime;
                reject(new TimeoutError(elapsed, TIMEOUT));
            };
            xhr.onerror = () => {
                reject(new LoadingError('General request error', 'error'));
            };
            xhr.onabort = () => {
                reject(new LoadingError('Request was aborted', 'aborted'));
            };

            xhr.timeout = TIMEOUT;
            try {
                xhr.open('GET', url, true);
            } catch (ex) {
                reject(new LoadingError('Error opening request', 'opening'));
            }

            try {
                xhr.withCredentials = true;
                xhr.send();
            } catch (ex) {
                reject(
                    new LoadingError('Error sending data in request', 'sending')
                );
            }
        });
    }

    renderOK(loadingState: LoadStateOk) {
        // const url: URL = new URL(window.location.href);
        // // Nuke the hash and search
        // for (const key of Array.from(url.searchParams.keys())) {
        //     url.searchParams.delete(key);
        // }
        // url.hash = '';
        const url = navigationPathToURL({ 
            path: `narrative/${loadingState.narrativeId}`, 
            type: 'europaui'
        });
        
        window.setTimeout(() => {
            window.open(url, '_top');
        }, SLIGHT_DELAY_BEFORE_REDIRECT)

        return <AlertMessage
            variant="success"
            style={{ width: "50%", margin: "0 auto" }} >
            Your Narrative service instance has been detected, redirecting to Narrative {loadingState.narrativeId}...
        </AlertMessage>
    }

    render() {
        switch (this.state.loadState.status) {
            case LoadStatus.NONE:
                return <Loading message="Loading..." />;
            case LoadStatus.POKING:
                return (
                    <Alert itemType="info" style={{ width: "50%", margin: "0 auto" }}>
                        <p>Starting a new Narrative session for you.</p>
                        <p>Please wait.</p>
                        <p>{this.state.loadState.tries} {this.state.loadState.tries === 1 ? "try" : "tries"} out of {MAX_TRIES}</p>
                        <ProgressBar now={100 * this.state.loadState.tries / MAX_TRIES} label="Waiting for Narrative session..." />
                    </Alert>
                );
            case LoadStatus.OK:
                return this.renderOK(this.state.loadState);
            case LoadStatus.INIT_ERROR:
                    return <ErrorMessage title={this.state.loadState.title} message={this.state.loadState.message} style={{ width: "50%", margin: "0 auto" }} />;
            case LoadStatus.CHECK_ERROR:
                return <ErrorMessage title={this.state.loadState.title} message={this.state.loadState.message} style={{ width: "50%", margin: "0 auto" }} />;
            case LoadStatus.STRUCK_OUT:
                return <ErrorMessage message={'Struck Out :('} style={{ width: "50%", margin: "0 auto" }} />;
            case LoadStatus.TIMED_OUT:
                return <ErrorMessage message={'Timed Out :('} style={{ width: "50%", margin: "0 auto" }} />;
        }
    }
}
