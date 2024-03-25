import { AuthenticationStatus, EuropaContext } from "contexts/EuropaContext";
import { AsyncProcessStatus } from "lib/AsyncProcess";
import { Component } from "react";
import ServiceInfoController from "./controller";


export default class ServiceInfoContext extends Component {
    render() {
        return <EuropaContext.Consumer>
            {(value) => {
                if (value && value.status === AsyncProcessStatus.SUCCESS) {
                    const {authState, config} = value.value;
                    if (authState.status === AuthenticationStatus.AUTHENTICATED) {
                        return <ServiceInfoController config={config} auth={authState} />
                    }
                }
            }}
        </EuropaContext.Consumer>
    }
}