import { Component } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { AuthenticationState } from '../../contexts/Auth';
import { Config } from '../../types/config';
import NarrativeManagerNew from './New';
import NarrativeManagerStart from './Start';

export interface NarrativeManagerProps extends RouteComponentProps {
    config: Config;
    authState: AuthenticationState;
    setTitle: (title: string) => void;
}

interface NarrativeManagerState {}

export default class NarrativeManager extends Component<
    NarrativeManagerProps,
    NarrativeManagerState
> {
    makePath(extraPath?: string) {
        if (extraPath) {
            return `${this.props.match.path}/${extraPath}`;
        } else {
            return this.props.match.path;
        }
    }

    render() {
        return (
            <Switch>
                <Route
                    path={this.makePath('start')}
                    render={(props) => {
                        return (
                            <NarrativeManagerStart
                                {...props}
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
                <Route
                    path={this.makePath('new')}
                    render={(props) => {
                        return (
                            <NarrativeManagerNew
                                {...props}
                                setTitle={this.props.setTitle}
                                authState={this.props.authState}
                                config={this.props.config}
                            />
                        );
                    }}
                />
            </Switch>
        );
    }
}
