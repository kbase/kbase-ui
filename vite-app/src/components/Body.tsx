import { Component, ReactNode } from 'react';
import PluginWrapper2 from './PluginWrapper/PluginWrapper2';

import About from '../applets/about';
import Developer from '../applets/developer';
import NarrativeLoader from '../applets/narrativeLoader';
import Catalog from '../apps/Catalog';
import Navigator from '../apps/Navigator/Navigator';
import Organizations from '../apps/Organizations';
import { AuthenticationState, AuthenticationStatus, EuropaContext } from '../contexts/EuropaContext';
import { Config } from '../types/config';

import { navigate2 } from 'lib/navigation';
import NarrativeManagerNew from '../apps/NarrativeManager/New';
import NarrativeManagerStart from '../apps/NarrativeManager/Start';
import ORCIDLink from '../apps/ORCIDLink/ORCIDLink';
// import ORCIDWorks from '../apps/ORCIDWorks/ORCIDWorks';
import AccountManager from 'apps/Auth2/AccountManager/controller';
import LinkContinueController from 'apps/Auth2/LinkContinue/controller';
import { SignIn } from 'apps/Auth2/SignIn/SignIn';
import SignInContinue from 'apps/Auth2/SignInContinue/SignInContinue';
import SignedOutController from 'apps/Auth2/SignedOut/controller';
// import Dataview from 'apps/Dataview';
import FeedsController from 'apps/Feeds/components/controller';
import JobBrowser from 'apps/JobBrowser/components/Main';
import ModuleViewController from 'apps/Typeview/module/controller';
import TypeViewController from 'apps/Typeview/type/controller';
import UserProfile from 'apps/UserProfile';
import Gallery from 'apps/gallery';
import RouterWrapper, { RouterContext } from '../contexts/RouterContext';
import { AsyncProcessStatus } from '../lib/AsyncProcess2';
import { Route } from '../lib/Route';
import styles from './Body.module.css';
import ErrorMessage from './ErrorMessage';
import Loading from './Loading';
import { RouteProps, Router } from './Router2';

export interface BodyProps {
    config: Config;
    authState: AuthenticationState;
    setTitle: (title: string) => void;
}

interface BodyState { }

export interface RouteEntryx {
    matcher: string,
    authenticationRequired: boolean,
    keywords: Array<string>
    component: (props: RouteProps & BodyProps) => ReactNode
}

export default class Body extends Component<BodyProps, BodyState> {
    routes: Array<Route>;
    constructor(props: BodyProps) {
        super(props);

        this.routes = [];

        this.routes = [
            new Route('orcidlink/*', { label: 'ORCID Link', authenticationRequired: true }, (props: RouteProps) => {
                if (this.props.authState.status !== AuthenticationStatus.AUTHENTICATED) {
                    // this should not be possible ... actually this should be enforced
                    // by the router...
                    return <div>impossible!</div>;
                }
                return <ORCIDLink 
                        {...props}  
                        config={this.props.config}
                        authState={this.props.authState}
                        setTitle={this.props.setTitle}
                    />;
            }),
            new Route(
                '^(catalog|appcatalog)$/*',
                { authenticationRequired: false },
                (props: RouteProps) => {
                    return <Catalog {...props} {...this.props} />;
                }
            ),
            new Route('feedsold', { label: 'Feeds', authenticationRequired: true }, (props: RouteProps) => {
                return (
                    <PluginWrapper2
                        {...props}
                        {...this.props}
                        name="feeds"
                        view="feeds"
                        syncHash={false}
                    />
                );
            }),

            new Route('feeds', { label: 'Feeds', authenticationRequired: true }, (props: RouteProps) => {
                if (this.props.authState.status !== AuthenticationStatus.AUTHENTICATED) {
                    // this should not be possible ... actually this should be enforced
                    // by the router...
                    return <div>impossible!</div>;
                }
                return (
                    <FeedsController
                        {...props}
                        config={this.props.config}
                        authState={this.props.authState}
                        setTitle={this.props.setTitle}
                    />
                );
            }),
            new Route('^jobbrowser$', { label: 'Job Browser', authenticationRequired: true }, (props: RouteProps) => {
                if (this.props.authState.status !== AuthenticationStatus.AUTHENTICATED) {
                    // this should not be possible ... actually this should be enforced
                    // by the router...
                    return <div>impossible!</div>;
                }
                return (
                    <JobBrowser
                        {...props}
                        config={this.props.config}
                        authState={this.props.authState}
                        setTitle={this.props.setTitle} />
                );
            }),
            new Route(
                '^(people|user)$/:username?',
                { label: 'User Profile', authenticationRequired: true },
                (props: RouteProps) => {
                    if (this.props.authState.status !== AuthenticationStatus.AUTHENTICATED) {
                        // this should not be possible ... actually this should be enforced
                        // by the router...
                        return <div>impossible!</div>;
                    }
                    return (
                        <UserProfile
                            {...props}
                            config={this.props.config}
                            authState={this.props.authState}
                            setTitle={this.props.setTitle}
                            username={props.match.params.get('username')!}
                        />
                    );
                }
            ),
            new Route(
                '^login|signin|signup$', 
                {authenticationRequired: false}, 
                (props: RouteProps) => {
                    return <SignIn 
                        {...props}  
                        source="login"
                        config={this.props.config}
                        authState={this.props.authState}
                        setTitle={this.props.setTitle}
                    />
                }
            ),
            new Route(
                '^auth2/signedout$', 
                {authenticationRequired: false}, 
                (props: RouteProps) => {
                    return <SignedOutController 
                        {...props}  
                        config={this.props.config}
                        authState={this.props.authState}
                        setTitle={this.props.setTitle}
                    />
                }
            ),
            new Route(
                '^signedout$', 
                {authenticationRequired: false}, 
                (props: RouteProps) => {
                    return <SignedOutController 
                        {...props}  
                        config={this.props.config}
                        authState={this.props.authState}
                        setTitle={this.props.setTitle}
                    />
                }
            ),
            new Route(
                '^auth2/login/continue$', 
                {authenticationRequired: false}, 
                (props: RouteProps) => {
                    return <EuropaContext.Consumer>
                        {(value) => {
                            if (value.status !== AsyncProcessStatus.SUCCESS) {
                                return;
                            }
                            return <SignInContinue 
                            {...props}  
                            config={this.props.config}
                            authState={this.props.authState}
                            messenger={value.value.messenger}
                            setTitle={this.props.setTitle}
                            />
                        }}
                    </EuropaContext.Consumer>
                }
            ), 
            new Route(
                '^auth2/link/continue$', 
                {authenticationRequired: true}, 
                (props: RouteProps) => {
                    if (this.props.authState.status !== AuthenticationStatus.AUTHENTICATED) {
                        return <div>impossible!</div>;
                    }
                    return <LinkContinueController 
                        {...props}  
                        config={this.props.config}
                        authState={this.props.authState}
                        setTitle={this.props.setTitle}
                    />
                }
            ),
            new Route(
                '^account$/:tab?', 
                {authenticationRequired: true, label: 'Account Manager'}, 
                (props: RouteProps) => {
                    if (this.props.authState.status !== AuthenticationStatus.AUTHENTICATED) {
                        // this should not be possible ... actually this should be enforced
                        // by the router...
                        return <div>impossible!</div>;
                    }
                    return <AccountManager 
                        {...props}  
                        config={this.props.config}
                        authState={this.props.authState}
                        setTitle={this.props.setTitle}
                        // logout={this.props.authState.logout}
                    />
                }
            ),
            // new Route(
            //     '^(auth2|signup|logout)$/*',
            //     { authenticationRequired: false },
            //     (props: RouteProps) => {
            //         return <Auth {...props} {...this.props} />;
            //     }
            // ),
            new Route('^(org|orgs)$/*', { label: 'KBase Organizations', authenticationRequired: true }, (props: RouteProps) => {
                return <Organizations {...props} {...this.props} />;
            }),
            new Route('search', { authenticationRequired: true, label: 'Data Search' }, (props: RouteProps) => {
                return (
                    <PluginWrapper2
                        {...props}
                        {...this.props}
                        name="data-search"
                        view="search"
                        syncHash={false}
                    />
                );
            }),
            new Route('public-search', { label: 'Public Search', authenticationRequired: false }, (props: RouteProps) => {
                return (
                    <PluginWrapper2
                        {...props}
                        {...this.props}
                        name="public-search"
                        view="main"
                        syncHash={false}
                    />
                );
            }),
            new Route('jgi-search', { label: 'JGI Search', authenticationRequired: true }, (props: RouteProps) => {
                return (
                    <PluginWrapper2
                        {...props}
                        {...this.props}
                        name="jgi-search"
                        view="search"
                        syncHash={false}
                    />
                );
            }),
            new Route('dashboard4', { label: 'Yet Another Dashboard', authenticationRequired: true }, (props: RouteProps) => {
                return (
                    <PluginWrapper2
                        {...props}
                        {...this.props}
                        name="dashboard4"
                        view="main"
                        syncHash={false}
                    />
                );
            }),
            new Route('biochem-search', { label: 'Biochemistry Search', authenticationRequired: true }, (props: RouteProps) => {
                return (
                    <PluginWrapper2
                        {...props}
                        {...this.props}
                        name="biochem-search"
                        view="search"
                        syncHash={false}
                    />
                );
            }),
            // Type and module views
            new Route(
                '^(spec|typeview)$/type/:typeid',
                { label: 'Workspace Type Viewer', authenticationRequired: false },
                (props: RouteProps) => {
                    return <TypeViewController 
                        {...this.props}
                        typeId={props.match.params.get('typeid')!} />;
                }
            ),
            new Route(
                'spec/module/:moduleid',
                { label: 'Module Viewer', authenticationRequired: false },
                (props: RouteProps) => {
                    return <ModuleViewController 
                    {...this.props}
                    moduleId={props.match.params.get('moduleid')!} />;
                }
            ),
            // Object views
            new Route(
                'dataview/:workspaceId/:objectId/:objectVersion?',
                { label: 'Data Landing Pages', authenticationRequired: false },
                (props: RouteProps) => {
                    return (
                        <PluginWrapper2
                            {...props}
                            {...this.props}
                            name="dataview"
                            view="dataView"
                            syncHash={false}
                        />
                    );
                }
            ),
            // new Route(
            //     'dataview2/:workspaceId/:objectId/:objectVersion?',
            //     { label: 'Data Landing Pages', authenticationRequired: false },
            //     (props: RouteProps) => {
            //         return (
            //             <Dataview
            //                 {...props}
            //                 {...this.props}
            //             />
            //         );
            //     }
            // ),
            new Route(
                'jsonview/:workspaceId/:objectId/:objectVersion?',
                { authenticationRequired: false },
                (props: RouteProps) => {
                    return (
                        <PluginWrapper2
                            {...props}
                            {...this.props}
                            name="dataview"
                            view="jsonView"
                            syncHash={false}
                        />
                    );
                }
            ),
            new Route(
                'provenance/:workspaceId/:objectId/:objectVersion?',
                { label: 'Provenance Viewer', authenticationRequired: false },
                (props: RouteProps) => {
                    return (
                        <PluginWrapper2
                            {...props}
                            {...this.props}
                            name="dataview"
                            view="provenanceView"
                            syncHash={false}
                        />
                    );
                }
            ),
            new Route(
                'objgraphview/:workspaceId/:objectId/:objectVersion?',
                { label: 'Provenance Viewer', authenticationRequired: false },
                (props: RouteProps) => {
                    return (
                        <PluginWrapper2
                            {...props}
                            {...this.props}
                            name="dataview"
                            view="provenanceView"
                            syncHash={false}
                        />
                    );
                }
            ),

            // Samples
            new Route(
                'samples/view/:sampleId/:sampleVersion?',
                { label: 'Samples', authenticationRequired: false },
                (props: RouteProps) => {
                    return (
                        <PluginWrapper2
                            {...props}
                            {...this.props}
                            name="samples"
                            view="view"
                            syncHash={false}
                        />
                    );
                }
            ),
            new Route('samples/about', { label: 'Samples', authenticationRequired: false }, (props: RouteProps) => {
                return (
                    <PluginWrapper2
                        {...props}
                        {...this.props}
                        name="samples"
                        view="about"
                        syncHash={false}
                    />
                );
            }),

            // Ontology
            // ontology/term/:namespace/:id/:-timestamp?tab=:-tab
            new Route(
                'ontology/term/:namespace/:id?',
                { label: 'Ontology Viewer', authenticationRequired: true },
                (props: RouteProps) => {
                    return (
                        <PluginWrapper2
                            {...props}
                            {...this.props}
                            name="ontology"
                            view="term"
                            syncHash={false}
                        />
                    );
                }
            ),
            new Route('ontology/about', { label: 'Ontology Viewer About Page', authenticationRequired: false }, (props: RouteProps) => {
                return (
                    <PluginWrapper2
                        {...props}
                        {...this.props}
                        name="ontology"
                        view="about"
                        syncHash={false}
                    />
                );
            }),
            new Route('ontology/help', { label: 'Ontology Viewer Help Page', authenticationRequired: false }, (props: RouteProps) => {
                return (
                    <PluginWrapper2
                        {...props}
                        {...this.props}
                        name="ontology"
                        view="help"
                        syncHash={false}
                    />
                );
            }),

            // Taxonomy
            // taxonomy/taxon/:namespace/:id/:-timestamp?tab=:-tab
            new Route(
                'taxonomy/taxon/:namespace/:id/:timestamp?',
                { authenticationRequired: true, label: 'Taxonomy Viewer' },
                (props: RouteProps) => {
                    return (
                        <PluginWrapper2
                            {...props}
                            {...this.props}
                            name="taxonomy"
                            view="taxon"
                            syncHash={false}
                        />
                    );
                }
            ),
            new Route('taxonomy/about', { authenticationRequired: false }, (props: RouteProps) => {
                return (
                    <PluginWrapper2
                        {...props}
                        {...this.props}
                        name="taxonomy"
                        view="about"
                        syncHash={false}
                    />
                );
            }),
            new Route('taxonomy/help', { authenticationRequired: false }, (props: RouteProps) => {
                return (
                    <PluginWrapper2
                        {...props}
                        {...this.props}
                        name="taxonomy"
                        view="help"
                        syncHash={false}
                    />
                );
            }),

            // Internal Apps
            new Route('navigator', { authenticationRequired: true, label: 'Narratives Navigator' }, (props: RouteProps) => {
                return <Navigator {...props} {...this.props} />;
            }),
            new Route('about/:name?', { authenticationRequired: false }, (props: RouteProps) => {
                return <About {...this.props} {...props} />;
            }),
            new Route('gallery', { authenticationRequired: false }, (props: RouteProps) => {
                return <Gallery {...props} {...this.props} />;
            }),
            new Route('gallery/:name', { authenticationRequired: false }, (props: RouteProps) => {
                return <Gallery {...props} {...this.props} />;
            }),
            new Route(
                'developer',
                { authenticationRequired: false, rolesRequired: ['DevToken'] },
                () => {
                    return <Developer {...this.props} />;
                }
            ),
            new Route('load-narrative', { authenticationRequired: true }, (props: RouteProps) => {
                return <NarrativeLoader {...this.props} {...props} />;
            }),
            new Route(
                'narrativemanager/new',
                { authenticationRequired: true },
                (props: RouteProps) => {
                    if (this.props.authState.status !== AuthenticationStatus.AUTHENTICATED) {
                        throw new Error('May only access a Narrative if authenticated');
                    }
                    return (
                        <NarrativeManagerNew
                            config={this.props.config}
                            authInfo={this.props.authState.authInfo}
                            setTitle={this.props.setTitle}
                            {...props}
                        />
                    );
                }
            ),
            new Route(
                'narrativemanager/start',
                { authenticationRequired: true },
                (props: RouteProps) => {
                    if (this.props.authState.status !== AuthenticationStatus.AUTHENTICATED) {
                        throw new Error('May only access a Narrative if authenticated');
                    }
                    return (
                        <NarrativeManagerStart
                            config={this.props.config}
                            authInfo={this.props.authState.authInfo}
                            setTitle={this.props.setTitle}
                            {...props}
                        />
                    );
                }
            ),

            // Redirect from the traditional #dashboard and the unused but
            // perhaps unintentially used #narratives, to /narratives.
            new Route(
                '^(dashboard|narratives)$',
                { authenticationRequired: true },
                () => {
                    return this.gotoDefaultPath();
                }
            ),
            
            /*
            Empty route, this is the default location when going to the bare origin.
            */
            new Route('', { authenticationRequired: false }, () => {
                // Direct redirect to /narratives; something is preventing a hashchange then
                // pathchange in CI. Does not occur locally, so may be a race condition triggered
                // by slightly slower connection to CI compared to local.
                return this.waitingForNavigation()
            }),
        ];
    }

    gotoDefaultPath(): React.ReactNode {
        navigate2(this.props.config.ui.defaults.path);
        return <Loading message="Loading Default Path..." />;
    }

    waitingForNavigation(): React.ReactNode {
        return <Loading message="Waiting for Navigation..." />;
    }

    shouldComponentUpdate(
        nextProps: Readonly<BodyProps>
    ): boolean {
        if (
            this.props.authState === nextProps.authState &&
            this.props.config === nextProps.config
        ) {
            return false;
        }
        return true;
    }

    render() {
        return (
            <div className={[styles.main, 'm-2'].join(' ')} data-k-b-testhook-component="body">
                <RouterWrapper>
                    <RouterContext.Consumer>
                        {(value) => {
                            switch (value.status) {
                                case AsyncProcessStatus.NONE:
                                    return <div />;
                                case AsyncProcessStatus.PENDING:
                                    return <div />;
                                case AsyncProcessStatus.ERROR:
                                    return <ErrorMessage message={value.error.message} />;
                                case AsyncProcessStatus.SUCCESS:
                                    return (
                                        <Router
                                            routes={this.routes}
                                            authRoute={new Route(
                                                    '^login|signin|signup$', 
                                                    {authenticationRequired: false}, 
                                                    (props: RouteProps) => {
                                                        return <SignIn 
                                                            {...props} 
                                                            key={props.hashPath.hash} 
                                                            config={this.props.config}
                                                            source="authorization"
                                                            authState={this.props.authState}
                                                            setTitle={this.props.setTitle}
                                                        />
                                                    }
                                                )
                                            }
                                            hashPath={value.value.hashPath}
                                        />
                                    );
                            }
                        }}
                    </RouterContext.Consumer>
                </RouterWrapper>
            </div>
        );
    }
}
