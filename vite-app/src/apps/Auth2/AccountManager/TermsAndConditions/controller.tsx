import PolicyAndAgreement, { PolicyAgreement } from "apps/Auth2/SignInContinue/PolicyAndAgreement";
import ErrorMessage from "components/ErrorMessage";
import Loading from "components/Loading";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { SimpleError } from 'lib/SimpleError';
import { Auth2 } from "lib/kb_lib/Auth2";
import { Component } from "react";
import TermsAndConditionsView from "./view";

export interface TermsAndConditionsControllerProps {
    authURL: string;
    token: string;
    // authState: AuthenticationState,
    // config: Config,
    setTitle: (title: string) => void;
}

export interface TermsAndConditions {
    agreement: PolicyAgreement
}

type TermsAndConditionsControllerState = AsyncProcess<TermsAndConditions, SimpleError>;


export default class TermsAndConditionsController extends Component<TermsAndConditionsControllerProps, TermsAndConditionsControllerState> {
    constructor(props: TermsAndConditionsControllerProps) {
        super(props);
        this.state = {
            status: AsyncProcessStatus.NONE
        }
    }

    componentDidMount() {
        this.props.setTitle('Account Manager - Terms and Conditions');
        this.loadData();
    }

    async loadData() {
        const auth2 = new Auth2({ baseUrl: this.props.authURL })

        this.setState({
            status: AsyncProcessStatus.PENDING
        });

        try {
            const { policyids } = await auth2.getMe(this.props.token);

            const policies = new PolicyAndAgreement({
                policyids
            });

            const policyAgreement = policies.getPolicyAgreement();

            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    agreement: policyAgreement
                }
            });
        } catch (ex) {
            this.setState({
                status: AsyncProcessStatus.ERROR,
                error: {
                    message: ex instanceof Error ? ex.message : 'Unknown Error'
                }
            });
        }
    }

    render() {
        switch (this.state.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <Loading />
            case AsyncProcessStatus.ERROR:
                return <ErrorMessage message={this.state.error.message} />
            case AsyncProcessStatus.SUCCESS:
                return <TermsAndConditionsView agreement={this.state.value.agreement} />
        }
    }
}