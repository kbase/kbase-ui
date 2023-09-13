import { AuthenticationStatus } from "contexts/Auth";
import { RuntimeContext } from "contexts/RuntimeContext";
import { Component } from "react";
import QueryLinksController from "./controller";


export default class QueryLinkingSessionsContext extends Component {
    render() {
        return <RuntimeContext.Consumer>
            {(value) => {
                if (value) {
                    if (value.authState.status === AuthenticationStatus.AUTHENTICATED) {
                        return <QueryLinksController config={value.config} auth={value.authState} notify={value.addNotification} />
                    }
                }
            }}
        </RuntimeContext.Consumer>
    }
}