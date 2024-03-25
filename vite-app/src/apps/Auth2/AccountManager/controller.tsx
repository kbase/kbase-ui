import { RouteProps } from "components/Router2";
import { AuthenticationStateAuthenticated } from "contexts/EuropaContext";
import { Component } from "react";
import { Config } from "types/config";
import AccountManagerView from "./view";

export interface AccountManagerControllerProps extends RouteProps {
    authState: AuthenticationStateAuthenticated,
    config: Config,
    setTitle: (title: string) => void;
    // logout: () => void;
}

interface AccountManagerControllerState {
    
}

export default class AccountManagerController extends Component<AccountManagerControllerProps, AccountManagerControllerState> {
    render() {
        return <AccountManagerView 
            config={this.props.config}
            authState={this.props.authState}
            setTitle={this.props.setTitle} 
            // logout={this.props.logout}
            tab={this.props.match.params.get('tab')}
        />;
    }
}