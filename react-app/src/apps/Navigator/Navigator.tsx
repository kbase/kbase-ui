import React from 'react';
import {
    AuthenticationState,
    AuthenticationStatus,
    AuthInfo,
} from '../../contexts/Auth';
import { Config } from '../../types/config';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import NotFoundPage from './components/NotFoundPage';
import Main from './components/Main';
import { SearchOptions } from './utils/NarrativeSearch';
import ErrorBoundary from './ErrorBoundary';
import NavigatorContextWrapper from './context/NavigatorContextWrapper';
import { DetailOptions } from './context/DataModel';
import { pushHistory } from './utils/navigation';

// Styles
import './bootstrapOverrides.css';
import styles from './Navigator.module.css';

const DEFAULT_CATEGORY = 'own';

export interface NavigatorProps extends RouteComponentProps {
    authState: AuthenticationState;
    config: Config;
    setTitle: (title: string) => void;
}

interface NavigatorState {}

export interface NavigatorRouteParams {
    category?: string;
    narrativeId?: string;
}

export interface NavigatorSearchParams {
    offset?: number;
    limit?: number;

    category?: string;
    query?: string;
    sort?: string;
}

export interface NarrativeDetailParams {
    narrativeId?: number;
    view?: string;
}

export default class Navigator extends React.Component<
    NavigatorProps,
    NavigatorState
> {
    componentDidMount() {
        this.props.setTitle('Narratives Navigator');
    }

    /**
     * Extracts any parameters that may be provided in the url search.
     *
     * Converts to target type if need be.
     *
     *
     * @param props
     * @returns The captured paramters
     */
    searchParamsFromSearch(props: RouteComponentProps): NavigatorSearchParams {
        const queryParams = new URLSearchParams(props.location.search);

        const params: NavigatorSearchParams = {};

        // String params
        if (queryParams.has('category')) {
            params.category = queryParams.get('category')!;
        }

        if (queryParams.has('sort')) {
            params.sort = queryParams.get('sort')!;
        }
        if (queryParams.has('query')) {
            params.query = queryParams.get('query')!;
        }

        // Integer params.
        if (queryParams.has('offset')) {
            params.offset = parseInt(queryParams.get('offset')!);
        }
        if (queryParams.has('limit')) {
            params.limit = parseInt(queryParams.get('limit')!);
        }

        return params;
    }

    detailParamsFromSearch(props: RouteComponentProps): NarrativeDetailParams {
        const queryParams = new URLSearchParams(props.location.search);

        const params: NarrativeDetailParams = {};

        // String params
        if (queryParams.has('id')) {
            params.narrativeId = parseInt(queryParams.get('id')!);
        }
        if (queryParams.has('view')) {
            params.view = queryParams.get('view')!;
        }

        return params;
    }

    /**
     * Given url path params and search params, produce a set of
     * search options.
     *
     * Note that some search options are not part of this set and are
     * only runtime (page size, which is measured from the ui.)
     *
     * Defaulting happens here, since SearchOptions requires some params.
     *
     * @param props
     * @returns Search options captured from the url.
     */
    paramsToSearchOptions(
        props: RouteComponentProps<NavigatorRouteParams>
    ): SearchOptions {
        const searchParams = this.searchParamsFromSearch(props);
        return {
            category: searchParams.category || DEFAULT_CATEGORY,
            sort: searchParams.sort || '-updated',
            query: searchParams.query,
            offset: searchParams.offset || 0,
        };
    }

    paramsToDetailOptions(
        props: RouteComponentProps<NavigatorRouteParams>
    ): DetailOptions {
        const detailParams = this.detailParamsFromSearch(props);
        return { ...detailParams };
    }

    makePath(extraPath?: string) {
        if (extraPath) {
            return `${this.props.match.path}/${extraPath}`;
        } else {
            return this.props.match.path;
        }
    }
    // narrativeId;
    renderNav(authInfo: AuthInfo) {
        return (
            <div className={`${styles.Navigator} Navigator`}>
                <Switch>
                    <Route
                        exact
                        path={this.makePath()}
                        render={(props: RouteComponentProps) => {
                            return (
                                <ErrorBoundary>
                                    <NavigatorContextWrapper
                                        authInfo={authInfo}
                                        config={this.props.config}
                                        routeProps={props}
                                        searchOptions={this.paramsToSearchOptions(
                                            props
                                        )}
                                        detailOptions={this.paramsToDetailOptions(
                                            props
                                        )}
                                    >
                                        <Main authInfo={authInfo} />
                                    </NavigatorContextWrapper>
                                </ErrorBoundary>
                            );
                        }}
                    />
                    <Route path="*">
                        <NotFoundPage />
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
                pushHistory('login');

                return null;
            // return (
            //     <ErrorMessage message="The Navigator requires authentication" />
            // );
            case AuthenticationStatus.AUTHENTICATED:
                return this.renderNav(authState.authInfo);
        }
    }
}
