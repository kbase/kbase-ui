import ErrorMessage from "components/ErrorMessage";
import Loading from "components/Loading";
import { AsyncProcessStatus } from "lib/AsyncProcess";
import { Component } from "react";
import { OrgsState } from "../controller";
import Orgs from "./Orgs";

export interface OrgsControllerProps {
    orgsState: OrgsState
}

export default class OrgsController extends Component<OrgsControllerProps> {
    render() {
        switch (this.props.orgsState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <Loading message="Loading organizations..." />
            case AsyncProcessStatus.ERROR:
                return <ErrorMessage message={this.props.orgsState.error.message} />
            case AsyncProcessStatus.SUCCESS:
                return <Orgs orgs={this.props.orgsState.value.orgs} />

        }
    }
}