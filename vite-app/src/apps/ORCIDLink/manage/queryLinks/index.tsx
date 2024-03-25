import { AuthenticationStatus, EuropaContext } from "contexts/EuropaContext";
import { AsyncProcessStatus } from "lib/AsyncProcess";
import { Component } from "react";
import QueryLinksController from "./controller";

export interface QueryLinksContextProps {
    viewLink: (username: string) => void;
}


export default class QueryLinksContext extends Component<QueryLinksContextProps> {
    render() {
        return <EuropaContext.Consumer>
            {(value) => {
                if (value && value.status === AsyncProcessStatus.SUCCESS) {
                    const {authState, config, notify} = value.value;
                    if (authState.status === AuthenticationStatus.AUTHENTICATED) {
                        return <QueryLinksController
                            config={config}
                            auth={authState}
                            viewLink={this.props.viewLink}
                            notify={notify}
                        />
                    }
                }
            }}
        </EuropaContext.Consumer>
    }
}