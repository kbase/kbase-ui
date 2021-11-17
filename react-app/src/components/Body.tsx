import { Component } from 'react';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
import './Body.css';
import NotFound from './NotFoundChecked/NotFoundChecked';
import PluginWrapper from './PluginWrapper/PluginWrapper';
import { Config } from '../types/config';
import { AuthenticationState } from '../contexts/Auth';
import About from '../applets/about';
import Organizations from '../apps/Organizations';
import Catalog from '../apps/Catalog';
import Auth from '../apps/Auth';
import Developer from '../applets/developer';
import DevelopmentAuth from '../applets/development/DevelopmentAuth';
import Navigator from '../apps/Navigator/Navigator';
import NarrativeLoader from '../applets/narrativeLoader';

export interface BodyProps {
    config: Config;
    authState: AuthenticationState;
    setTitle: (title: string) => void;
}

interface BodyState {}

export default class Body extends Component<BodyProps, BodyState> {
    renderRouting() {
        return (
            <HashRouter>
                <Switch>
                    {/*<Route*/}
                    {/*    path="/navigator"*/}
                    {/*    render={() => {*/}
                    {/*        return (*/}
                    {/*            <ExternalRedirect*/}
                    {/*                url={`${this.props.config.deploy.ui.origin}/narratives`}*/}
                    {/*                kind={RedirectKind.REPLACE}*/}
                    {/*            />*/}
                    {/*        );*/}
                    {/*    }}*/}
                    {/*/>*/}
                    <Route
                        path="/navigator"
                        render={(props) => {
                            return <Navigator {...props} {...this.props} />;
                        }}
                    />
                    <Route
                        path="/dashboard"
                        render={(props) => {
                            return <Navigator {...props} {...this.props} />;
                        }}
                    />
                    <Route
                        path="/dashboard4"
                        render={(props) => {
                            return (
                                <PluginWrapper
                                    {...props}
                                    name="dashboard4"
                                    view="main"
                                    setTitle={this.props.setTitle}
                                    authState={this.props.authState}
                                    config={this.props.config}
                                />
                            );
                        }}
                    />
                    {/*<Route*/}
                    {/*    path="/dashboard4"*/}
                    {/*    render={(props) => {*/}
                    {/*        switch (process.env.NODE_ENV) {*/}
                    {/*            case 'development':*/}
                    {/*            case 'test':*/}
                    {/*                return (*/}
                    {/*                    <PluginWrapper*/}
                    {/*                        {...props}*/}
                    {/*                        name="dashboard4"*/}
                    {/*                        view="main"*/}
                    {/*                        setTitle={this.props.setTitle}*/}
                    {/*                        authState={this.props.authState}*/}
                    {/*                        config={this.props.config}*/}
                    {/*                    />*/}
                    {/*                );*/}
                    {/*            case 'production':*/}
                    {/*                return (*/}
                    {/*                    <ExternalRedirect*/}
                    {/*                        url={`${this.props.config.deploy.ui.origin}/narratives`}*/}
                    {/*                        kind={RedirectKind.REPLACE}*/}
                    {/*                    />*/}
                    {/*                );*/}
                    {/*        }*/}
                    {/*    }}*/}
                    {/*/>*/}
                    {/* <Route
                        path="/dashboard"
                        render={() => {
                            return (
                                <ExternalRedirect
                                    url={`${this.props.config.deploy.ui.origin}/narratives`}
                                    kind={RedirectKind.REPLACE}
                                />
                            );
                        }}
                    /> */}

                    <Route
                        path="/orgs"
                        render={(props) => {
                            return <Organizations {...props} {...this.props} />;
                        }}
                    />

                    <Route
                        path="/(catalog|appcatalog)"
                        render={(props) => {
                            return <Catalog {...props} {...this.props} />;
                        }}
                    />

                    <Route
                        path="/search"
                        render={(props) => {
                            return (
                                <PluginWrapper
                                    {...props}
                                    name="data-search"
                                    view="search"
                                    {...this.props}
                                />
                            );
                        }}
                    />
                    <Route
                        path="/jgi-search"
                        render={(props) => {
                            return (
                                <PluginWrapper
                                    {...props}
                                    name="jgi-search"
                                    view="search"
                                    {...this.props}
                                />
                            );
                        }}
                    />
                    <Route
                        path="/jobbrowser"
                        render={(props) => {
                            return (
                                <PluginWrapper
                                    {...props}
                                    name="job-browser2"
                                    view="browse"
                                    {...this.props}
                                />
                            );
                        }}
                    />

                    <Route
                        path="/(auth2|account|signup)"
                        render={(props) => {
                            return <Auth {...props} {...this.props} />;
                        }}
                    />
                    <Route
                        path="/(login|logout)"
                        render={(props) => {
                            switch (process.env.NODE_ENV) {
                                case 'development':
                                case 'test':
                                    return <DevelopmentAuth {...this.props} />;
                                case 'production':
                                    return <Auth {...props} {...this.props} />;
                            }
                        }}
                    />

                    <Route
                        path="/feeds"
                        render={(props) => {
                            return (
                                <PluginWrapper
                                    {...props}
                                    name="feeds"
                                    view="feeds"
                                    {...this.props}
                                />
                            );
                        }}
                    />
                    <Route
                        path="/people/:username?"
                        render={(props) => {
                            return (
                                <PluginWrapper
                                    {...props}
                                    name="react-profile-view"
                                    view="user-profile"
                                    {...this.props}
                                />
                            );
                        }}
                    />
                    <Route
                        path="/user/:username?"
                        render={(props) => {
                            return (
                                <PluginWrapper
                                    {...props}
                                    name="react-profile-view"
                                    view="user-profile"
                                    {...this.props}
                                />
                            );
                        }}
                    />
                    <Route
                        path="/spec/type/:typeid"
                        render={(props) => {
                            return (
                                <PluginWrapper
                                    {...props}
                                    name="typeview"
                                    view="type"
                                    {...this.props}
                                />
                            );
                        }}
                    />
                    <Route
                        path="/typeview/type/:typeid"
                        render={(props) => {
                            return (
                                <PluginWrapper
                                    {...props}
                                    name="typeview"
                                    view="type"
                                    {...this.props}
                                />
                            );
                        }}
                    />
                    <Route
                        path="/spec/module/:moduleid"
                        render={(props) => {
                            return (
                                <PluginWrapper
                                    {...props}
                                    name="typeview"
                                    view="module"
                                    {...this.props}
                                />
                            );
                        }}
                    />
                    <Route
                        path="/typeview/type/:typeid"
                        render={(props) => {
                            return (
                                <PluginWrapper
                                    {...props}
                                    name="typeview"
                                    view="type"
                                    {...this.props}
                                />
                            );
                        }}
                    />
                    <Route
                        path="/dataview/:workspaceId/:objectId/:objectVersion?"
                        render={(props) => {
                            return (
                                <PluginWrapper
                                    {...props}
                                    name="dataview"
                                    view="dataView"
                                    {...this.props}
                                />
                            );
                        }}
                    />
                    <Route
                        path="/jsonview/:workspaceId/:objectId/:objectVersion?"
                        render={(props) => {
                            return (
                                <PluginWrapper
                                    {...props}
                                    name="dataview"
                                    view="jsonView"
                                    {...this.props}
                                />
                            );
                        }}
                    />
                    <Route
                        path="/objgraphview/:workspaceId/:objectId/:objectVersion?"
                        render={(props) => {
                            return (
                                <PluginWrapper
                                    {...props}
                                    name="dataview"
                                    view="provenanceView"
                                    {...this.props}
                                />
                            );
                        }}
                    />
                    <Route
                        path="/objgraphview2/:workspaceId/:objectId/:objectVersion?"
                        render={(props) => {
                            return (
                                <PluginWrapper
                                    {...props}
                                    name="dataview"
                                    view="provenanceView2"
                                    {...this.props}
                                />
                            );
                        }}
                    />
                    <Route
                        path="/provenance/:workspaceId/:objectId/:objectVersion?"
                        render={(props) => {
                            return (
                                <PluginWrapper
                                    {...props}
                                    name="dataview"
                                    view="provenanceView"
                                    {...this.props}
                                />
                            );
                        }}
                    />
                    <Route
                        path="/provenance2/:workspaceId/:objectId/:objectVersion?"
                        render={(props) => {
                            return (
                                <PluginWrapper
                                    {...props}
                                    name="dataview"
                                    view="provenanceView2"
                                    {...this.props}
                                />
                            );
                        }}
                    />
                    <Route
                        path="/samples/view/:sampleId/:sampleVersion?"
                        render={(props) => {
                            return (
                                <PluginWrapper
                                    {...props}
                                    name="samples"
                                    view="view"
                                    {...this.props}
                                />
                            );
                        }}
                    />
                    <Route
                        path="/samples/about"
                        render={(props) => {
                            return (
                                <PluginWrapper
                                    {...props}
                                    name="samples"
                                    view="about"
                                    {...this.props}
                                />
                            );
                        }}
                    />

                    <Route
                        path="/load-narrative"
                        render={(props) => {
                            return (
                                <NarrativeLoader {...this.props} {...props} />
                            );
                        }}
                    />

                    <Route
                        path="/about"
                        render={(props) => {
                            return <About {...this.props} />;
                        }}
                    />
                    <Route
                        path="/developer/:tab?"
                        render={(props) => {
                            return <Developer {...this.props} />;
                        }}
                    />
                    <Route exact path="/">
                        <Redirect to="/dashboard" />
                    </Route>
                    <Route
                        exact={true}
                        render={(props) => {
                            return (
                                <NotFound
                                    {...this.props}
                                    realPath={props.location.pathname}
                                    hashPath={props.location.hash}
                                    params={
                                        new URLSearchParams(
                                            props.location.search.substring(1)
                                        )
                                    }
                                />
                            );
                        }}
                    ></Route>
                </Switch>
            </HashRouter>
        );
    }

    render() {
        return (
            <div className="Body" data-k-b-testhook-component="body">
                {this.renderRouting()}
            </div>
        );
    }
}
