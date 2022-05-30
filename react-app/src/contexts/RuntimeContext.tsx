import React, {PropsWithChildren} from 'react';
import { Messenger } from '../lib/messenger';
import { Config } from '../types/config';
import { AuthenticationState } from './Auth';

/**
 * Holds the current config information
 */
// export interface RuntimeInfo {
//     title: string;
//     setTitle: (title: string) => void;
//     config: Config;
//     authState: AuthenticationState;
// }

// export type RuntimeState = SyncProcess<RuntimeInfo>

export interface RuntimeState {
    title: string;
    setTitle: (title: string) => void;
    messenger: Messenger;
    config: Config;
    authState: AuthenticationState;
}

// Context

/**
 * The RuntimeContext is the basis for propagating auth state
 * throughout the app.
 */

export const RuntimeContext = React.createContext<RuntimeState | null>(null);

// Runtime Wrapper Component

export type RuntimeWrapperProps = PropsWithChildren<{
    config: Config;
    authState: AuthenticationState;
}>;

type RuntimeWrapperState = {
    title: string;
};

// export interface RuntimeDB {
//     title: string;
// }
//
// const db = new Observed<RuntimeDB>({
//     title: '',
// });
//
// export function setTitle(title: string) {
//     db.setValue({
//         title,
//     });
// }

const $GlobalMessageBus = new Messenger();

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
export default class RuntimeWrapper extends React.Component<
    RuntimeWrapperProps,
    RuntimeWrapperState
> {
    constructor(props: RuntimeWrapperProps) {
        super(props);
        this.state = {
            title: '',
        };
    }

    // componentDidMount() {
    //     db.onChange(({ title }: RuntimeDB) => {
    //         this.setState({ title });
    //     });
    // }

    setTitle(title: string): void {
        this.setState({
            title,
        });
        document.title = `${title} | KBase`;
    }

    render() {
        const contextValue: RuntimeState = {
            title: this.state.title,
            setTitle: this.setTitle.bind(this),
            messenger: $GlobalMessageBus,
            authState: this.props.authState,
            config: this.props.config,
        };
        return (
            <RuntimeContext.Provider value={contextValue}>
                {this.props.children}
            </RuntimeContext.Provider>
        );
    }
}
