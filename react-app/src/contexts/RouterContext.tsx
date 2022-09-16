import React, { PropsWithChildren } from 'react';
import { AsyncProcess, AsyncProcessStatus } from '../lib/AsyncProcess';

/**
 * Holds the current config information
 */
export interface RouterInfo {
    hashPath: HashPath
}

export interface ErrorInfo {
    message: string;
}

export type RouterState = AsyncProcess<RouterInfo, ErrorInfo>;

// Route stuff

export interface HashPath {
    hash: string;
    path: Array<string>;
    realPath: string;
    query: URLSearchParams;
    // params: Map<string, string>;
}


// Context

/**
 * The AuthContext is the basis for propagating auth state
 * throughout the app.
 */

export const RouterContext = React.createContext<RouterState>({
    status: AsyncProcessStatus.NONE,
});

// Auth Wrapper Component

export type RouterWrapperProps = PropsWithChildren<{}>;

interface RouterWrapperState {
    routerState: RouterState;
}

/**
 * Wraps a component tree, ensuring that authentication status is
 * resolved and placed into the AuthContext. The auth state in the
 * context can then be used by descendants to do "the right thing".
 * In this app, the right thing is to show an error message if
 * there is lack of authentication (no token, invalid token), and to
 * proceed otherwise.
 *
 * Also note that the auth state is itself wrapped into an AsyncProcess,
 * which ensures that descendants can handle the async behavior of
 * determining the auth state (because we may need to call the auth service),
 * which includes any errors encountered.
 */
export default class RouterWrapper extends React.Component<
    RouterWrapperProps,
    RouterWrapperState
> {
    hashListener: (() => void) | null;
    constructor(props: RouterWrapperProps) {
        super(props);
        this.state = {
            routerState: {
                status: AsyncProcessStatus.NONE,
            },
        };
        this.hashListener = null;
    }

    componentDidMount() {
        // First time through, seed the navigation context
        this.setState({
            routerState: {
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    hashPath: this.getHashPath()
                }
            }
        }, () => {
            this.hashListener = () => {
                const hashPath = this.getHashPath();
                if (this.state.routerState.status === 'SUCCESS' &&
                    hashPath === this.state.routerState.value.hashPath) {
                    return;
                }
                this.setState({
                    routerState: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: {
                            hashPath
                        }
                    }
                });
            }
            window.addEventListener('hashchange', this.hashListener);
        });
    }

    componentWillUnmount() {
        if (this.hashListener !== null) {
            window.removeEventListener('hashchange', this.hashListener);
        }
    }

    getHashPath(): HashPath {
        const hash = document.location.hash.substring(1);

        // Oddly, sometimes the query appears as part of the hash...
        const [pathString, queryString] = hash.split('?');

        const path = pathString.split('/')
            .filter((component) => {
                return component.length > 0;
            });

        const hashQuery = new URLSearchParams(queryString);

        const searchQuery = new URLSearchParams(document.location.search);

        const query = new URLSearchParams([
            ...Array.from(hashQuery.entries()),
            ...Array.from(searchQuery.entries())
        ]);

        // Some older plugins stick the query into the hash; weird, but we must accomodate.
        if (path.length > 0) {
            const last = path[path.length - 1];
            if (last.includes("?")) {
                const [lastElement, searchString] = last.split('?');
                path[path.length - 1] = lastElement;
                const fakeQuery = new URLSearchParams(searchString);
                fakeQuery.forEach((value, key) => {
                    query.set(key, value);
                })
            }
        }

        return {
            hash,
            path,
            query,
            realPath: document.location.pathname,
        }
    }

    render() {
        return (
            <RouterContext.Provider value={this.state.routerState}>
                {this.props.children}
            </RouterContext.Provider>
        );
    }
}
