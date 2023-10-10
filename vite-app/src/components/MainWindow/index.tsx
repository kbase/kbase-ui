import ErrorMessage from 'components/ErrorMessage';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { AuthenticationState } from '../../contexts/Auth';
import { Config } from '../../types/config';
import MainWindow from './view';


export interface SimpleError {
    message: string;
}
export interface ControllerProps {
    authState: AuthenticationState;
    config: Config;
    setTitle: (title: string) => void;
}

export interface LoadingInfo {
    hideHeader: boolean;
    hideNavigation: boolean;
    hideUI: boolean;
}

export type LoadingState = AsyncProcess<LoadingInfo, SimpleError>;

interface ControllerState {
    loadingState: LoadingState
}

export default class Controller extends Component<ControllerProps, ControllerState> {
    constructor(props: ControllerProps) {
        super(props);
        this.state = {
            loadingState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }

    componentDidMount() {
        const url = new URL(document.location.toString())
        const uiOptions = (url.searchParams.get("ui_options") || '').split(',');
        const hideUI = uiOptions.includes('hide-ui');
        // const showHeader = !(url.searchParams.get('showHeader') === "false");
        // const showNavigation = !(url.searchParams.get('showNavigation') === "false");
        this.setState({
            loadingState: {
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    // showHeader, showNavigation
                    hideUI,
                    hideHeader: this.props.config.ui.defaults.hideHeader,
                    hideNavigation: this.props.config.ui.defaults.hideNavigation
                }
            }
        });
    }

    renderLoading() {
        return <Loading message="Loading ..." />
    }

    renderError({ message }: SimpleError) {
        return <ErrorMessage message={message} />
    }

    renderSuccess({ hideUI, hideHeader, hideNavigation }: LoadingInfo) {
        return <MainWindow {...this.props}
            hideUI={hideUI}
            hideHeader={hideHeader}
            hideNavigation={hideNavigation}
        />
    }

    render() {
        const loadingState = this.state.loadingState;
        switch (loadingState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading()
            case AsyncProcessStatus.ERROR:
                return this.renderError(loadingState.error);
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(loadingState.value)
        }
    }
}