import { AuthenticationStatus, EuropaContext } from "contexts/EuropaContext";
import { AsyncProcessStatus } from "lib/AsyncProcess";
import { Component } from "react";
import QueryLinksController from "./controller";


export default class OverviewContext extends Component {
    render() {
        return <EuropaContext.Consumer>
            {(value) => {
                if (value && value.status === AsyncProcessStatus.SUCCESS) {
                    const {authState, config} = value.value;
                    if (authState.status === AuthenticationStatus.AUTHENTICATED) {
                        return <QueryLinksController config={config} auth={authState} />
                    }
                }
            }}
        </EuropaContext.Consumer>
    }
}