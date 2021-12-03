import { Component } from 'react';
import { Config } from '../../types/config';
import { AuthenticationState } from '../../contexts/Auth';
import { RouteComponentProps } from 'react-router';
import ErrorMessage from '../../components/ErrorMessage';
import AlertMessage from '../../components/AlertMessage';
import Loading from '../../components/Loading';

const MAX_TRIES = 10;
const TIMEOUT = 60000;
const RETRY_PAUSE = 1000;

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

export class UnauthenticatedError extends Error {}

export class UIError extends Error {}

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
    ERROR = 'ERROR',
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
    url: string;
    tries: number;
}

export interface LoadStateOk extends LoadStateBase {
    status: LoadStatus.OK;
    url: string;
}

export interface LoadStateError extends LoadStateBase {
    status: LoadStatus.ERROR;
    // url: string;
    message: string;
}

export interface LoadStateTimedOut extends LoadStateBase {
    status: LoadStatus.TIMED_OUT;
    tries: number;
    timeout: number;
    elapsed: number;
    url: string;
}

export interface LoadStateStruckOut extends LoadStateBase {
    status: LoadStatus.STRUCK_OUT;
    tries: number;
    elapsed: number;
    url: string;
}

export type LoadState =
    | LoadStateNone
    | LoadStatePoking
    | LoadStateOk
    | LoadStateError
    | LoadStateStruckOut
    | LoadStateTimedOut;

export interface NarrativeLoaderProps extends RouteComponentProps {
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
        },
    };

    urlToCheck() {
        return `${document.location.origin}/narrative/static/kbase/config/config.json?check=true`;
    }

    componentDidMount() {
        this.props.setTitle('Narrative Loader');
        const searchParams = new URLSearchParams(this.props.location.search);
        const narrativeIdRaw = searchParams.get('n');
        if (!narrativeIdRaw) {
            this.setState({
                loadState: {
                    status: LoadStatus.ERROR,
                    message:
                        "The Narrative Loader requires the 'n' search parameter",
                },
            });
            return;
        }
        const narrativeId = parseInt(narrativeIdRaw);
        if (isNaN(narrativeId)) {
            this.setState({
                loadState: {
                    status: LoadStatus.ERROR,
                    message: `The "n" search parameter is not an integer: "${narrativeIdRaw}"`,
                },
            });
            return;
        }

        this.setState(
            {
                loadState: {
                    status: LoadStatus.POKING,
                    tries: 0,
                    url: this.urlToCheck(),
                },
            },
            () => {
                console.log('hmm, try loading', narrativeId);
                this.tryLoading(narrativeId);
            }
        );
    }

    renderProgress() {}

    async tryLoading(narrativeId: number) {
        const narrativeUrl =
            document.location.origin + '/narrative/' + narrativeId;

        if (this.state.loadState.status !== LoadStatus.POKING) {
            return;
        }
        // const checkUrl =
        //     document.location.origin +
        //     '/narrative/static/kbase/config/config.json?check=true';

        try {
            for (let tries = 0; tries < MAX_TRIES; tries += 1) {
                const retry = await this.checkNarrative(
                    this.state.loadState.url
                );
                console.log('try loading', tries);
                if (retry) {
                    this.setState({
                        loadState: {
                            status: LoadStatus.POKING,
                            tries,
                            url: this.urlToCheck(),
                        },
                    });
                } else {
                    this.setState({
                        loadState: {
                            status: LoadStatus.OK,
                            url: narrativeUrl,
                        },
                    });
                    const url: URL = new URL(window.location.href);
                    // Nuke the hash and search
                    for (const key of Array.from(url.searchParams.keys())) {
                        url.searchParams.delete(key);
                    }
                    url.hash = '';
                    url.pathname = `/narrative/${narrativeId}`;
                    // window.location.replace(narrativeUrl);
                    // window.history.pushState(null, '', url);
                    console.log('REDIRECTING?..', url.toString());
                    document.location.href = url.toString();
                    return;
                }
            }
            await new Promise<void>((resolve) => {
                window.setTimeout(() => {
                    resolve();
                }, RETRY_PAUSE);
            });
        } catch (ex) {
            this.setState({
                loadState: {
                    status: LoadStatus.ERROR,
                    message: ex instanceof Error ? ex.message : 'Unknown Error',
                },
            });
        }
    }
    checkNarrative(url: string) {
        console.log('[checkNarrative]', url);
        const startTime = new Date().getTime();
        return new Promise<boolean>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = () => {
                console.log(
                    '[checkNarrative] onload',
                    xhr.status,
                    xhr.responseText
                );
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
                xhr.withCredentials = false;
                xhr.send();
            } catch (ex) {
                reject(
                    new LoadingError('Error sending data in request', 'sending')
                );
            }
        });
    }
    renderState() {
        switch (this.state.loadState.status) {
            case LoadStatus.NONE:
                return <Loading message="Loading..." />;
            case LoadStatus.POKING:
                return (
                    <AlertMessage type="info">
                        <p>Starting a new Narrative session for you.</p>
                        <p>Please wait.</p>
                        <p>
                            Trying {this.state.loadState.tries} of {MAX_TRIES}
                        </p>
                    </AlertMessage>
                );
            case LoadStatus.OK:
                return <AlertMessage type="success" message="OK!" />;
            case LoadStatus.ERROR:
                return <ErrorMessage message={this.state.loadState.message} />;
            case LoadStatus.STRUCK_OUT:
                return <ErrorMessage message={'Struck Out :('} />;
            case LoadStatus.TIMED_OUT:
                return <ErrorMessage message={'Timed Out :('} />;
        }
    }
    render() {
        return this.renderState();
    }
}
