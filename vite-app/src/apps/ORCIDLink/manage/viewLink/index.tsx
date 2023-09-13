import { AuthenticationStatus } from "contexts/Auth";
import { RuntimeContext } from "contexts/RuntimeContext";
import { Component } from "react";
import ViewLinkController from "./controller";

export interface ViewLinkContextProps {
    username: string;
}


export default class ViewLinkContext extends Component<ViewLinkContextProps> {
    render() {
        return <RuntimeContext.Consumer>
            {(value) => {
                if (value) {
                    if (value.authState.status === AuthenticationStatus.AUTHENTICATED) {
                        return <ViewLinkController
                            config={value.config}
                            auth={value.authState}
                            setTitle={value.setTitle}
                            username={this.props.username} />
                    }
                }
            }}
        </RuntimeContext.Consumer>
    }
}