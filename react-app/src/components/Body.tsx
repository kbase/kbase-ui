import { Component } from 'react';
// import { HashRouter, Redirect, Switch } from 'react-router-dom';
import PluginWrapper2 from './PluginWrapper/PluginWrapper2';

import { Config } from '../types/config';
import { AuthenticationState, AuthenticationStatus } from '../contexts/Auth';
import About from '../applets/about';
import Organizations from '../apps/Organizations';
import Catalog from '../apps/Catalog';
import Auth from '../apps/Auth';
import Developer from '../applets/developer';
// import DevelopmentAuth from '../applets/development/DevelopmentAuth';
import Navigator from '../apps/Navigator/Navigator';
import NarrativeLoader from '../applets/narrativeLoader';

import styles from './Body.module.css';
import { changeHash2 } from '../apps/Navigator/utils/navigation';
import { RouteProps, Router } from './Router2';
import { Route } from '../lib/Route';
import RouterWrapper, { RouterContext } from '../contexts/RouterContext';
import { AsyncProcessStatus } from '../lib/AsyncProcess2';
import ErrorMessage from './ErrorMessage';
import NarrativeManagerNew from '../apps/NarrativeManager/New';
import NarrativeManagerStart from '../apps/NarrativeManager/Start';
import Loading from './Loading';
import ORCIDLink from '../apps/ORCIDLink/ORCIDLink';

export interface BodyProps {
    config: Config;
    authState: AuthenticationState;
    setTitle: (title: string) => void;
}

interface BodyState {
}

export default class Body extends Component<BodyProps, BodyState> {
    routes: Array<Route>
    constructor(props: BodyProps) {
        super(props);

        this.routes = [
            // Plugins
            // new Route('^(appcatalog)$', (props: RouteProps) => {
            //     return (
            //         <PluginWrapper2
            //             {...props}
            //             {...this.props}
            //             name="catalog"
            //             view="appsBrowser"
            //         />
            //     );
            // }),
            // new Route('^(catalog|appcatalog)$', (props: RouteProps) => {
            //     return (
            //         <Catalog
            //             {...props}
            //             {...this.props}
            //         />
            //     );
            // }),
            new Route('orcidlink/*', { authenticationRequired: false }, (props: RouteProps) => {
                return (
                    <ORCIDLink
                        {...props}
                        {...this.props}
                    />
                );
            }),
            new Route('^(catalog|appcatalog)$/*', { authenticationRequired: false }, (props: RouteProps) => {
                return (
                    <Catalog
                        {...props}
                        {...this.props}
                    />
                );
            }),
            new Route('feeds', { authenticationRequired: true }, (props: RouteProps) => {
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
            new Route('jobbrowser', { authenticationRequired: true }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="job-browser2"
                    view="browse"
                    syncHash={false}
                />
            }),
            new Route('^(people|user)$/:username?', { authenticationRequired: true }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="react-profile-view"
                    view="user-profile"
                    syncHash={false}
                />
            }),
            new Route('^(auth2|account|signup|login|logout)$/*', { authenticationRequired: false }, (props: RouteProps) => {
                return <Auth
                    {...props}
                    {...this.props}
                />
            }),
            new Route('orgs/*', { authenticationRequired: true }, (props: RouteProps) => {
                return <Organizations
                    {...props}
                    {...this.props}
                />
            }),
            new Route('search', { authenticationRequired: true }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="data-search"
                    view="search"
                    syncHash={false}
                />
            }),
            new Route('public-search', { authenticationRequired: false }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="public-search"
                    view="main"
                    syncHash={false}
                />
            }),
            new Route('jgi-search', { authenticationRequired: true }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="jgi-search"
                    view="search"
                    syncHash={false}
                />
            }),
            new Route('dashboard4', { authenticationRequired: true }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="dashboard4"
                    view="main"
                    syncHash={false}
                />
            }),
            new Route('biochem-search', { authenticationRequired: true }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="biochem-search"
                    view="search"
                    syncHash={false}
                />
            }),
            // Type and module views
            new Route('^(spec|typeview)$/type/:typeid', { authenticationRequired: false }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="typeview"
                    view="type"
                    syncHash={false}
                />
            }),
            new Route('spec/module/:moduleid', { authenticationRequired: false }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="typeview"
                    view="module"
                    syncHash={false}
                />
            }),
            // Object views
            new Route('dataview/:workspaceId/:objectId/:objectVersion?', { authenticationRequired: false }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="dataview"
                    view="dataView"
                    syncHash={false}
                />
            }),
            new Route('jsonview/:workspaceId/:objectId/:objectVersion?', { authenticationRequired: false }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="dataview"
                    view="jsonView"
                    syncHash={false}
                />
            }),
            new Route('provenance/:workspaceId/:objectId/:objectVersion?', { authenticationRequired: false }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="dataview"
                    view="provenanceView"
                    syncHash={false}
                />
            }),
            new Route('objgraphview/:workspaceId/:objectId/:objectVersion?', { authenticationRequired: false }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="dataview"
                    view="provenanceView"
                    syncHash={false}
                />
            }),

            // Samples
            new Route('samples/view/:sampleId/:sampleVersion?', { authenticationRequired: true }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="samples"
                    view="view"
                    syncHash={false}
                />
            }),
            new Route('samples/about', { authenticationRequired: false }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="samples"
                    view="about"
                    syncHash={false}
                />
            }),

            // Ontology
            // ontology/term/:namespace/:id/:-timestamp?tab=:-tab
            new Route('ontology/term/:namespace/:id?', { authenticationRequired: true }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="ontology"
                    view="term"
                    syncHash={false}
                />
            }),
            new Route('ontology/about', { authenticationRequired: false }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="ontology"
                    view="about"
                    syncHash={false}
                />
            }),
            new Route('ontology/help', { authenticationRequired: false }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="ontology"
                    view="help"
                    syncHash={false}
                />
            }),

            // Taxonomy
            // taxonomy/taxon/:namespace/:id/:-timestamp?tab=:-tab
            new Route('taxonomy/taxon/:namespace/:id/:timestamp?', { authenticationRequired: true }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="taxonomy"
                    view="taxon"
                    syncHash={false} />
            }),
            new Route('taxonomy/about', { authenticationRequired: false }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="taxonomy"
                    view="about"
                    syncHash={false} />
            }),
            new Route('taxonomy/help', { authenticationRequired: false }, (props: RouteProps) => {
                return <PluginWrapper2
                    {...props}
                    {...this.props}
                    name="taxonomy"
                    view="help"
                    syncHash={false} />
            }),

            // <Route
            //                     path="/search"
            //                     render={(props) => {
            //                         return (
            //                             <PluginWrapper
            //                                 {...props}
            //                                 name="data-search"
            //                                 view="search"
            //                                 {...this.props}
            //                             />
            //                         );
            //                     }}
            //                 />
            //                 <Route
            //                     path="/jgi-search"
            //                     render={(props) => {
            //                         return (
            //                             <PluginWrapper
            //                                 {...props}
            //                                 name="jgi-search"
            //                                 view="search"
            //                                 {...this.props}
            //                             />
            //                         );
            //                     }}
            //                 />

            // Redirects
            new Route('^(dashboard|narratives)$', { authenticationRequired: true }, (props: RouteProps) => {
                window.location.pathname = '/narratives';
                return <Loading message="Loading Navigator..." />
            }),

            //                 <Route
            //                     path="/(auth2|account|signup)"
            //                     render={(props) => {
            //                         return <Auth {...props} {...this.props} />;
            //                     }}
            //                 />

            // new Route('user/:username?', (props: RouteProps) => {
            //     return <PluginWrapper2
            //         {...props}
            //         {...this.props}
            //         name="react-profile-view


            //         view="user-profile"
            //     />
            // }),
            //                 <Route
            //                     path="/people/:username?"
            //                     render={(props) => {
            //                         return (
            //                             <PluginWrapper
            //                                 {...props}
            //                                 name="react-profile-view"
            //                                 view="user-profile"
            //                                 {...this.props}
            //                             />
            //                         );
            //                     }}
            //                 />
            //                 <Route
            //                     path="/user/:username?"
            //                     render={(props) => {
            //                         return (
            //                             <PluginWrapper
            //                                 {...props}
            //                                 name="react-profile-view"
            //                                 view="user-profile"
            //                                 {...this.props}
            //                             />
            //                         );
            //                     }}
            //                 />
            // Internal Apps
            new Route('navigator', { authenticationRequired: true }, (props: RouteProps) => {
                return (
                    <Navigator {...props} {...this.props} />
                );
            }),
            new Route('about/*', { authenticationRequired: false }, (props: RouteProps) => {
                return (
                    <About {...this.props} {...props} />
                );
            }),
            new Route('about', { authenticationRequired: false }, (props: RouteProps) => {
                return (
                    <About {...this.props} {...props} />
                );
            }),
            new Route('developer', { authenticationRequired: true, rolesRequired: ['DevToken'] }, (props: RouteProps) => {
                return (
                    <Developer {...this.props} />
                );
            }),
            new Route('load-narrative', { authenticationRequired: true }, (props: RouteProps) => {
                return (
                    <NarrativeLoader {...this.props} {...props} />
                );
            }),
            new Route('narrativemanager/new', { authenticationRequired: true }, (props: RouteProps) => {
                if (this.props.authState.status !== AuthenticationStatus.AUTHENTICATED) {
                    throw new Error('May only access a Narrative if authenticated');
                }
                return (
                    <NarrativeManagerNew
                        config={this.props.config}
                        authInfo={this.props.authState.authInfo}
                        setTitle={this.props.setTitle}
                        {...props} />
                );
            }),
            new Route('narrativemanager/start', { authenticationRequired: true }, (props: RouteProps) => {
                if (this.props.authState.status !== AuthenticationStatus.AUTHENTICATED) {
                    throw new Error('May only access a Narrative if authenticated');
                }
                return (
                    <NarrativeManagerStart
                        config={this.props.config}
                        authInfo={this.props.authState.authInfo}
                        setTitle={this.props.setTitle}
                        {...props} />
                );
            }),


            // Empty route
            new Route('', { authenticationRequired: false }, (props: RouteProps) => {
                window.location.pathname = '/narratives';
                return <div>Redirecting...</div>;
            }),

            // Not found route
            // new Route('*', (props: RouteProps) => {
            //     window.location.hash = 'navigator';
            //     return null;
            // }),
        ];
    }
    // renderRouting() { <Developer {...this.props} />;
    //     return (
    //         <HashRouter basename="">
    //             <Switch>
    //                 <Route
    //                     path="/narratives"
    //                     render={() => {
    //                         return (
    //                             <ExternalRedirect
    //                                 url={`${this.props.config.deploy.ui.origin}/narratives`}
    //                                 kind={RedirectKind.REPLACE}
    //                             />
    //                         );
    //                     }}
    //                 />
    //                 <Route
    //                     path="/navigator"
    //                     render={(props) => {
    //                         return <Navigator {...props} {...this.props} />;
    //                     }}
    //                 />
    //                 {/* <Route
    //                     path="/dashboard"
    //                     render={(props) => {
    //                         return <Navigator {...props} {...this.props} />;
    //                     }}
    //                 /> */}
    //                 <Route path="/dashboard">
    //                     <Redirect to="/navigator" />
    //                 </Route>
    //                 <Route
    //                     path="/dashboard4"
    //                     render={(props) => {
    //                         return (
    //                             <PluginWrapper
    //                                 {...props}
    //                                 name="dashboard4"
    //                                 view="main"
    //                                 setTitle={this.props.setTitle}
    //                                 authState={this.props.authState}
    //                                 config={this.props.config}
    //                             />
    //                         );
    //                     }}
    //                 />
    //                 {/*<Route*/}
    //                 {/*    path="/dashboard4"*/}
    //                 {/*    render={(props) => {*/}
    //                 {/*        switch (process.env.NODE_ENV) {*/}
    //                 {/*            case 'development':*/}
    //                 {/*            case 'test':*/}
    //                 {/*                return (*/}
    //                 {/*                    <PluginWrapper*/}
    //                 {/*                        {...props}*/}
    //                 {/*                        name="dashboard4"*/}
    //                 {/*                        view="main"*/}
    //                 {/*                        setTitle={this.props.setTitle}*/}
    //                 {/*                        authState={this.props.authState}*/}
    //                 {/*                        config={this.props.config}*/}
    //                 {/*                    />*/}
    //                 {/*                );*/}
    //                 {/*            case 'production':*/}
    //                 {/*                return (*/}
    //                 {/*                    <ExternalRedirect*/}
    //                 {/*                        url={`${this.props.config.deploy.ui.origin}/narratives`}*/}
    //                 {/*                        kind={RedirectKind.REPLACE}*/}
    //                 {/*                    />*/}
    //                 {/*                );*/}
    //                 {/*        }*/}
    //                 {/*    }}*/}
    //                 {/*/>*/}
    //                 {/* <Route
    //                     path="/dashboard"
    //                     render={() => {
    //                         return (
    //                             <ExternalRedirect
    //                                 url={`${this.props.config.deploy.ui.origin}/narratives`}
    //                                 kind={RedirectKind.REPLACE}
    //                             />
    //                         );
    //                     }}
    //                 /> */}

    //                 <Route
    //                     path="/orgs"
    //                     render={(props) => {
    //                         return <Organizations {...props} {...this.props} />;
    //                     }}
    //                 />

    //                 <Route
    //                     path="/(catalog|appcatalog)"
    //                     render={(props) => {
    //                         return <Catalog {...props} {...this.props} />;
    //                     }}
    //                 />

    //                 <Route
    //                     path="/search"
    //                     render={(props) => {
    //                         return (
    //                             <PluginWrapper
    //                                 {...props}
    //                                 name="data-search"
    //                                 view="search"
    //                                 {...this.props}
    //                             />
    //                         );
    //                     }}
    //                 />
    //                 <Route
    //                     path="/jgi-search"
    //                     render={(props) => {
    //                         return (
    //                             <PluginWrapper
    //                                 {...props}
    //                                 name="jgi-search"
    //                                 view="search"
    //                                 {...this.props}
    //                             />
    //                         );
    //                     }}
    //                 />
    //                 <Route
    //                     path="/jobbrowser"
    //                     render={(props) => {
    //                         return (
    //                             <PluginWrapper
    //                                 {...props}
    //                                 name="job-browser2"
    //                                 view="browse"
    //                                 {...this.props}
    //                             />
    //                         );
    //                     }}
    //                 />

    //                 <Route
    //                     path="/(auth2|account|signup)"
    //                     render={(props) => {
    //                         return <Auth {...props} {...this.props} />;
    //                     }}
    //                 />
    //                 <Route
    //                     path="/(login|logout)"
    //                     render={(props) => {
    //                         switch (process.env.NODE_ENV) {
    //                             case 'development':
    //                             case 'test':
    //                             // return <DevelopmentAuth {...this.props} />;
    //                             case 'production':
    //                                 return <Auth {...props} {...this.props} />;
    //                         }
    //                     }}
    //                 />
    //                 <Route
    //                     path="/feeds"
    //                     render={(props) => {
    //                         return (
    //                             <PluginWrapper
    //                                 {...props}
    //                                 name="feeds"
    //                                 view="feeds"
    //                                 {...this.props}
    //                             />
    //                         );
    //                     }}
    //                 />
    //                 <Route
    //                     path="/people/:username?"
    //                     render={(props) => {
    //                         return (
    //                             <PluginWrapper
    //                                 {...props}
    //                                 name="react-profile-view"
    //                                 view="user-profile"
    //                                 {...this.props}
    //                             />
    //                         );
    //                     }}
    //                 />
    //                 <Route
    //                     path="/user/:username?"
    //                     render={(props) => {
    //                         return (
    //                             <PluginWrapper
    //                                 {...props}
    //                                 name="react-profile-view"
    //                                 view="user-profile"
    //                                 {...this.props}
    //                             />
    //                         );
    //                     }}
    //                 />
    //                 <Route
    //                     path="/spec/type/:typeid"
    //                     render={(props) => {
    //                         return (
    //                             <PluginWrapper
    //                                 {...props}
    //                                 name="typeview"
    //                                 view="type"
    //                                 {...this.props}
    //                             />
    //                         );
    //                     }}
    //                 />
    //                 <Route
    //                     path="/typeview/type/:typeid"
    //                     render={(props) => {
    //                         return (
    //                             <PluginWrapper
    //                                 {...props}
    //                                 name="typeview"
    //                                 view="type"
    //                                 {...this.props}
    //                             />
    //                         );
    //                     }}
    //                 />
    //                 <Route
    //                     path="/spec/module/:moduleid"
    //                     render={(props) => {
    //                         return (
    //                             <PluginWrapper
    //                                 {...props}
    //                                 name="typeview"
    //                                 view="module"
    //                                 {...this.props}
    //                             />
    //                         );
    //                     }}
    //                 />
    //                 <Route
    //                     path="/typeview/type/:typeid"
    //                     render={(props) => {
    //                         return (
    //                             <PluginWrapper
    //                                 {...props}
    //                                 name="typeview"
    //                                 view="type"
    //                                 {...this.props}
    //                             />
    //                         );
    //                     }}
    //                 />
    //                 <Route
    //                     path="/dataview/:workspaceId/:objectId/:objectVersion?"
    //                     render={(props) => {
    //                         return (
    //                             <PluginWrapper
    //                                 {...props}
    //                                 name="dataview"
    //                                 view="dataView"
    //                                 {...this.props}
    //                             />
    //                         );
    //                     }}
    //                 />
    //                 <Route
    //                     path="/jsonview/:workspaceId/:objectId/:objectVersion?"
    //                     render={(props) => {
    //                         return (
    //                             <PluginWrapper
    //                                 {...props}
    //                                 name="dataview"
    //                                 view="jsonView"
    //                                 {...this.props}
    //                             />
    //                         );
    //                     }}
    //                 />
    //                 <Route
    //                     path="/objgraphview/:workspaceId/:objectId/:objectVersion?"
    //                     render={(props) => {
    //                         return (
    //                             <PluginWrapper
    //                                 {...props}
    //                                 name="dataview"
    //                                 view="provenanceView"
    //                                 {...this.props}
    //                             />
    //                         );
    //                     }}
    //                 />
    //                 <Route
    //                     path="/objgraphview2/:workspaceId/:objectId/:objectVersion?"
    //                     render={(props) => {
    //                         return (
    //                             <PluginWrapper
    //                                 {...props}
    //                                 name="dataview"
    //                                 view="provenanceView2"
    //                                 {...this.props}
    //                             />
    //                         );
    //                     }}
    //                 />
    //                 <Route
    //                     path="/provenance/:workspaceId/:objectId/:objectVersion?"
    //                     render={(props) => {
    //                         return (
    //                             <PluginWrapper
    //                                 {...props}
    //                                 name="dataview"
    //                                 view="provenanceView"
    //                                 {...this.props}
    //                             />
    //                         );
    //                     }}
    //                 />
    //                 <Route
    //                     path="/provenance2/:workspaceId/:objectId/:objectVersion?"
    //                     render={(props) => {
    //                         return (
    //                             <PluginWrapper
    //                                 {...props}
    //                                 name="dataview"
    //                                 view="provenanceView2"
    //                                 {...this.props}
    //                             />
    //                         );
    //                     }}
    //                 />
    //                 <Route
    //                     path="/samples/view/:sampleId/:sampleVersion?"
    //                     render={(props) => {
    //                         return (
    //                             <PluginWrapper
    //                                 {...props}
    //                                 name="samples"
    //                                 view="view"
    //                                 {...this.props}
    //                             />
    //                         );
    //                     }}
    //                 />
    //                 <Route
    //                     path="/samples/about"
    //                     render={(props) => {
    //                         return (
    //                             <PluginWrapper
    //                                 {...props}
    //                                 name="samples"
    //                                 view="about"
    //                                 {...this.props}
    //                             />
    //                         );
    //                     }}
    //                 />

    //                 <Route
    //                     path="/load-narrative"
    //                     render={(props) => {
    //                         return (
    //                             <NarrativeLoader {...this.props} {...props} />
    //                         );
    //                     }}
    //                 />

    //                 <Route
    //                     path="/about"
    //                     render={() => {
    //                         return <About {...this.props} />;
    //                     }}
    //                 />

    //                 <Route
    //                     path="/narrativemanager"
    //                     render={(props) => {
    //                         return (
    //                             <NarrativeManager {...props} {...this.props} />
    //                         );
    //                     }}
    //                 />

    //                 <Route
    //                     path="/developer/:tab?"
    //                     render={() => {
    //                         return <Developer {...this.props} />;
    //                     }}
    //                 />
    //                 {/* <Route exact path="/" render={() => {
    //                     window.location.hash = "#navigator";
    //                     window.dispatchEvent(new HashChangeEvent("hashchange"));
    //                     return <div />;
    //                 }}>

    //                 </Route> */}
    //                 <Route exact path="/" render={() => {
    //                     changeHash('navigator')
    //                     return null;
    //                 }}>
    //                 </Route>
    //                 <Route
    //                     exact={true}
    //                     render={(props) => {
    //                         return (
    //                             <NotFound
    //                                 {...this.props}
    //                                 realPath={props.location.pathname}
    //                                 hashPath={props.location.hash}
    //                                 params={
    //                                     new URLSearchParams(
    //                                         props.location.search.substring(1)
    //                                     )
    //                                 }
    //                             />
    //                         );
    //                     }}
    //                 />
    //             </Switch>
    //         </HashRouter>
    //     );
    // }

    render() {
        return (
            <div className={styles.main} data-k-b-testhook-component="body">
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
                                    return <Router routes={this.routes} hashPath={value.value.hashPath} />;
                            }
                        }}
                    </RouterContext.Consumer>
                </RouterWrapper>
            </div>
        );
    }
}
