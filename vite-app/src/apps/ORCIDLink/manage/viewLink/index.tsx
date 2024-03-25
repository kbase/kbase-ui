import { AuthenticationStatus, EuropaContext } from "contexts/EuropaContext";
import { AsyncProcessStatus } from "lib/AsyncProcess";
import { Component } from "react";
import ViewLinkController from "./controller";

export interface ViewLinkContextProps {
    username: string;
}

export default class ViewLinkContext extends Component<ViewLinkContextProps> {
    render() {
        return <EuropaContext.Consumer>
            {(value) => {
                 if (value && value.status === AsyncProcessStatus.SUCCESS) {
                    const {authState, config, setTitle} = value.value;
                    if (authState.status === AuthenticationStatus.AUTHENTICATED) {
                        return <ViewLinkController
                            config={config}
                            auth={authState}
                            setTitle={setTitle}
                            username={this.props.username} />
                    }
                }
            }}
        </EuropaContext.Consumer>
    }
}