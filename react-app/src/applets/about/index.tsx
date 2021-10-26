import {Component} from 'react';
import {HashRouter, Route, Switch} from 'react-router-dom';
import NotFound from '../../components/NotFound/NotFound';
import {Config} from '../../types/config';
import AboutBuild from './AboutBuild';
import AboutKBaseUI from './AboutKBaseUI';
import AboutPlugins from './AboutPlugins';
import AboutServices from './AboutServices';
import {AuthenticationState} from '../../contexts/Auth';

export interface AboutProps {
    config: Config;
    authState: AuthenticationState;
    setTitle: (title: string) => void;
}

interface AboutState {
}

export default class About extends Component<AboutProps, AboutState> {
    render() {
        return (
            <HashRouter>
                <Switch>
                    <Route
                        path="/about"
                        exact={true}
                        render={(props) => {
                            return (
                                <AboutKBaseUI {...this.props} />
                            );
                        }}
                    />
                    <Route
                        path="/about/services"
                        exact={true}
                        render={(props) => {
                            return (
                                <AboutServices {...this.props} />
                            );
                        }}
                    />
                    <Route
                        path="/about/build"
                        exact={true}
                        render={(props) => {
                            return (
                                <AboutBuild {...this.props} />
                            );
                        }}
                    />
                    <Route
                        path="/about/plugins"
                        exact={true}
                        render={(props) => {
                            return (
                                <AboutPlugins {...this.props} />
                            );
                        }}
                    />
                    <Route
                        path="/about/*"
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
}
