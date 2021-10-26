import React from 'react';

import ErrorMessage from './components/ErrorMessage';
import {AuthenticationState, AuthenticationStatus, AuthInfo} from "../../contexts/Auth";

import {Config} from '../../types/config';
import {Route, RouteComponentProps, Switch} from "react-router-dom";
import NotFoundPage from "./components/NotFoundPage";
import {Dashboard} from "./components/dashboard";
import {sorts} from "./utils/NarrativeSearch";
import './Navigator.css';

const SORT_SLUG_DEFAULT = Object.keys(sorts)[0];

export interface NavigatorProps extends RouteComponentProps {
    authState: AuthenticationState;
    config: Config;
    setTitle: (title: string) => void;
}

interface NavigatorState {
}

interface NavigatorRouteParams {
    category?: string;
    id?: string;
    obj?: string;
    ver?: string;
}

export default class Navigator extends React.Component<NavigatorProps, NavigatorState> {
    componentDidMount() {
        this.props.setTitle('Narratives Navigator');
    }

    optionsFromSearch(urlSearch: string) {
        const queryParams = new URLSearchParams(urlSearch);
        const paramLimit = queryParams.get('limit');
        const limit = paramLimit ? parseInt(paramLimit) : 0;
        const search = queryParams.get('search') || '';
        const sort = queryParams.get('sort') || SORT_SLUG_DEFAULT;
        const view = queryParams.get('view') || 'data';
        return {
            limit, search, sort, view
        }
    }

    renderDashboard(props: RouteComponentProps<NavigatorRouteParams>, authInfo: AuthInfo) {
        const {limit, search, sort, view} = this.optionsFromSearch(props.location.search);
        const {category, id, obj, ver} = props.match.params;
        return <Dashboard
            authInfo={authInfo}
            limit={limit}
            search={search}
            sort={sort}
            view={view}
            category={category}
            id={id}
            obj={obj}
            ver={ver}
        />;
    }

    makePath(extraPath?: string) {
        if (extraPath) {
            return `${this.props.match.path}/${extraPath}`;
        } else {
            return this.props.match.path;
        }
    }

    renderNav(authInfo: AuthInfo) {
        return (
            <div className="Navigator">
                <Switch>
                    <Route
                        exact
                        path={this.makePath()}
                        render={(props) => {
                            return this.renderDashboard(props, authInfo);
                        }}
                    />
                    <Route
                        exact
                        path={this.makePath(':id/:obj/:ver')}
                        render={(props) => {
                            return this.renderDashboard(props, authInfo);
                        }}
                    />
                    <Route
                        exact
                        path={this.makePath(':category')}
                        render={(props) => {
                            return this.renderDashboard(props, authInfo);
                        }}
                    />
                    <Route
                        exact
                        path={this.makePath(':category/:id/:obj/:ver')}
                        render={(props) => {
                            return this.renderDashboard(props, authInfo);
                        }}
                    />
                    <Route path="*">
                        <NotFoundPage/>
                    </Route>
                </Switch>
            </div>
        );
    }

    render() {
        const authState = this.props.authState;
        switch (authState.status) {
            case AuthenticationStatus.NONE:
            case AuthenticationStatus.UNAUTHENTICATED:
                return <ErrorMessage message="The Navigator requires authentication"/>
            case AuthenticationStatus.AUTHENTICATED:
                return (
                    this.renderNav(authState.authInfo)
                );
        }
    }
}
