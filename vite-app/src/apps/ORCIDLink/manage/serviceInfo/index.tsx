import { AuthenticationStatus } from "contexts/Auth";
import { RuntimeContext } from "contexts/RuntimeContext";
import { Component } from "react";
import ServiceInfoController from "./controller";


export default class ServiceInfoContext extends Component {
    render() {
        return <RuntimeContext.Consumer>
            {(value) => {
                if (value) {
                    if (value.authState.status === AuthenticationStatus.AUTHENTICATED) {
                        return <ServiceInfoController config={value.config} auth={value.authState} />
                    }
                }
            }}
        </RuntimeContext.Consumer>
    }
}