import { AuthenticationStatus } from "contexts/Auth";
import { RuntimeContext } from "contexts/RuntimeContext";
import { Component } from "react";
import QueryLinksController from "./controller";

export interface QueryLinksContextProps {
    viewLink: (username: string) => void;
}


export default class QueryLinksContext extends Component<QueryLinksContextProps> {
    render() {
        return <RuntimeContext.Consumer>
            {(value) => {
                if (value) {
                    if (value.authState.status === AuthenticationStatus.AUTHENTICATED) {
                        return <QueryLinksController
                            config={value.config}
                            auth={value.authState}
                            viewLink={this.props.viewLink}
                            notify={value.addNotification}
                        />
                    }
                }
            }}
        </RuntimeContext.Consumer>
    }
}