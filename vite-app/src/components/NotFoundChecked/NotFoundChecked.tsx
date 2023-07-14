import { Component, Fragment } from 'react';
// import { RouteComponentProps } from 'react-router-dom';
import { AuthenticationState, AuthenticationStatus } from '../../contexts/Auth';
import { Config } from '../../types/config';
import flapjack from './flapjack.png';

const REDIRECT_IF_FOUND = true;
const TRY_UPSTREAM_SITES = true;

export type Status =
    | 'none'
    | 'does-not-exist'
    | 'path-does-not-exist'
    | 'found-on-marketing'
    | 'found-on-outreach'
    | 'found-on-docs'
    | 'error';

// function waiter(fun: () => void): Promise<void> {
//     return new Promise((resolve, reject) => {
//         try {
//         fun();
//             resolve();
//         } catch (ex) {
//             reject(ex);
//         }
//     });
// }

// export interface UIRequest {
//     realPath: Array<string>;
//     path: Array<string>;
//     query: { [key: string]: string };
// }

export interface NotFoundCheckedProps {
    config: Config;
    authState: AuthenticationState;
    realPath: string;
    hashPath: string;
    params: URLSearchParams;
    // request: UIRequest;
    setTitle: (title: string) => void;
}

interface NotFoundCheckedState {
    status: Status;
    path?: string;
    error?: {
        message: string;
    };
    messages: Array<string>;
}

export default class NotFound extends Component<
    NotFoundCheckedProps,
    NotFoundCheckedState
> {
    constructor(props: NotFoundCheckedProps) {
        super(props);
        this.state = {
            status: 'none',
            messages: [],
        };
    }

    async findOn(site: string, path: string) {
        const tryURI = `/__poke/${site}/${path}`;
        const response = await fetch(tryURI, {
            method: 'HEAD',
            mode: 'cors',
        });
        if (response.status >= 200 && response.status <= 300) {
            return true;
        }
        return false;
    }

    redirect(url: string) {
        window.location.assign(url);
    }

    // Pick<NotFoundState, keyof NotFoundState>
    // async setState2(newState: Partial<NotFoundState>) {
    //     return new Promise<void>((resolve) => {
    //         if (typeof newState === 'undefined') {
    //             resolve();
    //             return;
    //         }
    //         if (newState === undefined) {
    //             resolve();
    //             return;
    //         }
    //         this.setState(newState, () => {
    //             resolve();
    //         });
    //     });
    // }

    async checkSites() {
        const realPath = this.props.realPath.split('/');
        const hashPath = this.props.hashPath.split('/');
        // const request = this.props.request;
        if (!TRY_UPSTREAM_SITES) {
            console.warn('not trying upstream sites', this.props.realPath);
            if (
                realPath.length === 1 &&
                realPath[0] === '' &&
                hashPath.length === 0
            ) {
                // if we got here with no paths, go to the dashboard
                window.location.hash = '#dashboard';
                return;
            }

            if (hashPath.length > 0) {
                this.setState({
                    status: 'path-does-not-exist',
                    path: hashPath.join('/'),
                });
            } else {
                this.setState({
                    status: 'does-not-exist',
                    path: realPath.join('/'),
                });
            }
            return;
        }

        // Redirect to marketing site (www.kbase.us) if we have no physical path,
        // no ui path, and no token.
        // Oh, and only do this if enabled for the env!

        if (
            realPath.length === 1 &&
            realPath[0] === '' &&
            hashPath.length === 0 &&
            !(
                this.props.authState.status ===
                AuthenticationStatus.AUTHENTICATED
            )
        ) {
            if (
                !this.props.config.ui.featureSwitches.enabled.includes(
                    'redirect-to-www'
                )
            ) {
                this.redirect('/#login');
                return;
            }
            // this.props.setTitle('Redirecting to h...');
            this.redirect(`https://${this.props.config.ui.urls.marketing.url}`);
            return;
        }

        const path = realPath.join('/');
        try {
            if (path.length === 0) {
                this.setState({
                    status: 'path-does-not-exist',
                    path: hashPath.join('/'),
                });
                return;
            }

            // Try homepage/marketing

            await new Promise<void>((resolve) => {
                this.setState(
                    {
                        messages: [
                            ...this.state.messages,
                            'Looking on Homepage...',
                        ],
                    },
                    () => {
                        resolve();
                    }
                );
            });

            // this.setState2({
            //     messages: [...this.state.messages, 'Looking on Homepage...']
            // });
            if (await this.findOn('marketing', path)) {
                this.setState({
                    status: 'found-on-marketing',
                    path,
                });
                return;
            }
            // await this.setState2({
            //     messages: [...this.state.messages.slice(0, -1), this.state.messages[this.state.messages.length -1] + 'nope']
            // });

            // Try docs

            await new Promise<void>((resolve) => {
                this.setState(
                    {
                        messages: [
                            ...this.state.messages,
                            'Looking on Docs...',
                        ],
                    },
                    () => {
                        resolve();
                    }
                );
            });

            if (await this.findOn('docs', path)) {
                this.setState({
                    status: 'found-on-docs',
                    path,
                });
                return;
            }
            // await this.setState2({
            //     messages: [...this.state.messages.slice(0, -1), this.state.messages[this.state.messages.length -1] + 'nope']
            // });
            await new Promise<void>((resolve) => {
                this.setState(
                    {
                        messages: [
                            ...this.state.messages.slice(0, -1),
                            this.state.messages[
                                this.state.messages.length - 1
                            ] + 'nope',
                        ],
                    },
                    () => {
                        resolve();
                    }
                );
            });

            this.setState({
                status: 'does-not-exist',
                path,
            });
        } catch (ex) {
            this.setState({
                status: 'error',
                error: {
                    message: ex instanceof Error ? ex.message : 'Unknown error',
                },
                path,
            });
        }
    }

    onPageShow(event: PageTransitionEvent) {
        if (event.persisted) {
            window.location.reload();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('pageshow', this.onPageShow.bind(this));
    }

    componentDidMount() {
        window.addEventListener('pageshow', this.onPageShow.bind(this));
        this.checkSites();
    }

    componentDidUpdate(prevProps: NotFoundCheckedProps) {
        // TODO: params...
        if (
            prevProps.hashPath !== this.props.hashPath ||
            prevProps.realPath !== this.props.realPath
        ) {
            this.checkSites();
        }
    }

    renderNotFound() {
        // this.props.setTitle(`Not Found - ${this.state.path}`);
        return (
            <div className="well">
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={{ flex: '0 0 auto', marginRight: '30px' }}>
                        <img src={flapjack} alt="The Flapjack" />
                    </div>
                    <div style={{ flex: '1 1 0px' }}>
                        <p
                            className="text-danger"
                            style={{ fontSize: '140%', marginTop: '10px' }}
                        >
                            Sorry, "{this.state.path}" was not found.
                        </p>
                        {this.renderKBaseLinks()}
                    </div>
                </div>
            </div>
        );
    }

    renderPathNotFound() {
        // this.props.setTitle(`Path Not Found - ${this.state.path}`);
        return (
            <div className="well">
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={{ flex: '0 0 auto', marginRight: '30px' }}>
                        <img src={flapjack} alt="The Flapjack" />
                    </div>
                    <div style={{ flex: '1 1 0px' }}>
                        <p
                            className="text-danger"
                            style={{ fontSize: '140%', marginTop: '10px' }}
                        >
                            Sorry, "#{this.state.path}" was not found.
                        </p>

                        {this.renderKBaseLinks()}
                    </div>
                </div>
            </div>
        );
    }

    renderExistsOnMarketingSite() {
        const marketingURL = new URL(
            `https://${this.props.config.ui.urls.marketing.url}/{this.state.path}`
        );
        const query = marketingURL.searchParams;
        Object.entries(this.props.params).forEach(([key, value]) => {
            query.set(key, value);
        });

        if (REDIRECT_IF_FOUND) {
            // this.props.setTitle(`Redirecting to ${marketingURL}`);
            this.redirect(marketingURL.toString());
            return;
        }

        // this.props.setTitle('Path Not Found');

        return (
            <div className="well">
                <div className="text-danger" style={{ fontSize: '140%' }}>
                    <strong>
                        <span className="fa fa-meh-o"></span>$ Path Not Found
                    </strong>
                </div>
                <p
                    className="text-danger"
                    style={{ fontSize: '140%', marginTop: '10px' }}
                >
                    The path you requested, <em>"{this.state.path}"</em>, was
                    not found on this site.
                </p>
                <p style={{ fontSize: '140%', marginTop: '10px' }}>
                    However, it does exist on{' '}
                    <a href="{marketingURL.toString()}">
                        the KBase Homepage Site
                    </a>
                    .
                </p>
            </div>
        );
    }

    renderExistsOnOutreachSite() {
        const marketingURL = new URL(
            `https://${this.props.config.ui.urls.marketing.url}/${this.state.path}`
        );
        const query = marketingURL.searchParams;
        Object.entries(this.props.params).forEach(([key, value]) => {
            query.set(key, value);
        });

        if (REDIRECT_IF_FOUND) {
            // this.props.setTitle(`Redirecting to ${marketingURL}`);
            this.redirect(marketingURL.toString());
            return;
        }

        // this.props.setTitle('Path Not Found');

        return (
            <div className="well">
                <div className="text-danger" style={{ fontSize: '140%' }}>
                    <strong>
                        <span className="fa fa-meh-o"></span> Path Not Found
                    </strong>
                </div>
                <p
                    className="text-danger"
                    style={{ fontSize: '140%', marginTop: '10px' }}
                >
                    The path you requested, <em>"{this.state.path}"</em>, was
                    not found on this site.
                </p>
                <p style={{ fontSize: '140%', marginTop: '10px' }}>
                    However, it does exist on{' '}
                    <a href="{marketingURL.toString()}">
                        the KBase Homepage Site
                    </a>
                    .
                </p>
            </div>
        );
    }

    renderExistsOnDocsSite() {
        const docsURL = new URL(
            `https://${this.props.config.ui.urls.documentation.url}/${this.state.path}`
        );
        const query = docsURL.searchParams;
        Object.entries(this.props.params).forEach(([key, value]) => {
            query.set(key, value);
        });

        if (REDIRECT_IF_FOUND) {
            // this.props.setTitle(`Redirecting to ${docsURL}`);
            this.redirect(docsURL.toString());
            return;
        }

        // this.props.setTitle('Path Not Found');

        return (
            <div className="well">
                <div className="text-danger" style={{ fontSize: '140%' }}>
                    <strong>
                        <span className="fa fa-meh-o"></span> Path Not Found
                    </strong>
                </div>
                <p
                    className="text-danger"
                    style={{ fontSize: '140%', marginTop: '10px' }}
                >
                    The path you requested, <em>"{this.state.path}"</em>, was
                    not found on this site.
                </p>
                <p style={{ fontSize: '140%', marginTop: '10px' }}>
                    However, it does exist on{' '}
                    <a href="{docsURL.toString()}">
                        the KBase Documentation Site
                    </a>
                    .
                </p>
            </div>
        );
    }

    renderKBaseLinks() {
        return (
            <Fragment>
                <p>
                    You may find what you are looking for on one of the
                    following KBase sites:
                </p>

                <ul>
                    <li>
                        <a
                            href={`https://${this.props.config.ui.urls.marketing.url}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Homepage
                        </a>
                    </li>
                    <li>
                        <a
                            href={`https://${this.props.config.ui.urls.documentation.url}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Documentation
                        </a>
                    </li>
                    <li>
                        <a href="/#narrativemanager/start">Narrative</a>
                    </li>
                    <li>
                        <a href="/#dashboard">Dashboard</a>
                    </li>
                </ul>

                <p>
                    Or you may wish to{' '}
                    <a
                        href={`https://${this.props.config.ui.urls.marketing.url}/support/`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        reach out the KBase
                    </a>{' '}
                    for further assistance.
                </p>
            </Fragment>
        );
    }

    renderError() {
        // this.props.setTitle(`Not Found - ${this.state.path}`);
        return (
            <div className="well">
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={{ flex: '0 0 auto', marginRight: '20px' }}>
                        <img src="/images/flapjack.png" alt="The Flapjack" />
                    </div>
                    <div style={{ flex: '1 1 0px' }}>
                        <p
                            className="text-danger"
                            style={{ fontSize: '140%', marginTop: '10px' }}
                        >
                            Sorry, "{this.state.path}" was not found. *
                        </p>
                        ${this.renderKBaseLinks()}
                        <p
                            className="text-danger"
                            style={{ marginTop: '30px' }}
                        >
                            * Actually, an error was encountered checking for
                            this path: "{this.state.error!.message}"
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    renderLoading() {
        // const path = this.props.realPath;
        // this.props.setTitle(`Not Found - ${path}`);
        const messages = this.state.messages.map((message, index) => {
            return <p key={index}>{message}</p>;
        });
        return (
            <div className="alert alert-warning">
                <p>
                    Analyzing request...{' '}
                    <span className="fa fa-spinner fa-pulse fa-fw"></span>
                </p>
                {messages}
            </div>
        );
    }

    renderSwitch() {
        switch (this.state.status) {
            case 'none':
                return this.renderLoading();
            case 'does-not-exist':
                return this.renderNotFound();
            case 'path-does-not-exist':
                return this.renderPathNotFound();
            case 'found-on-marketing':
                return this.renderExistsOnMarketingSite();
            case 'found-on-outreach':
                return this.renderExistsOnOutreachSite();
            case 'found-on-docs':
                return this.renderExistsOnDocsSite();
            case 'error':
                return this.renderError();
        }
    }

    render() {
        return <div style={{ margin: '0 10px' }}>{this.renderSwitch()}</div>;
    }
}
