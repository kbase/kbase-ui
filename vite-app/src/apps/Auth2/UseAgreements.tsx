import Well from "components/Well";
import { Component } from "react";
import { Alert, Button } from "react-bootstrap";
import { ExclamationTriangle } from "react-bootstrap-icons";
import { CurrentTermsAndConditionsPolicy } from "./SignInContinue/Policy";

export interface UseAgreementsProps {
    policyToResolve: CurrentTermsAndConditionsPolicy;
    hasPreviousAgreements: boolean;
    onAgreed: (agreedTo: boolean) => void;
}

interface PolicyResolution {
    policy: CurrentTermsAndConditionsPolicy
    isViewed: boolean;
    isAgreedTo: boolean;
}

interface UseAgreementState {
    policyResolution: PolicyResolution
}

export default class UseAgreements extends Component<UseAgreementsProps, UseAgreementState> {
    constructor(props: UseAgreementsProps) {
        super(props);

        this.state = {
            policyResolution: {
                policy: props.policyToResolve,
                isViewed: false,
                isAgreedTo: false
            }
        };
    }

    onViewPolicy() {
        const { policy, isViewed } = this.state.policyResolution;
        if (isViewed) {
            return;
        }
        this.setState({
            policyResolution: {
                ...this.state.policyResolution,
                isViewed: true
            }
        });
        window.open(policy.url.toString(), '_blank');
    }

    toggleIsAgreedTo() {
        const { isAgreedTo } = this.state.policyResolution;
        this.setState({
            policyResolution: {
                ...this.state.policyResolution,
                isAgreedTo: !isAgreedTo
            }
        }, () => {
            this.props.onAgreed(!isAgreedTo);
        });
    }

    render() {
        const { policy, isViewed, isAgreedTo } = this.state.policyResolution;

        const agreementLabel = (() => {
            if (isViewed) {
                if (isAgreedTo) {
                    return <div
                        onClick={() => { this.toggleIsAgreedTo(); }}
                        className="text-success"
                        style={{ fontWeight: 'bold', cursor: 'pointer'}}>
                        I have read and agree to this policy
                    </div>
                }
                return <div
                    onClick={() => { this.toggleIsAgreedTo(); }}
                    className="text-danger"
                    style={{ fontWeight: 'bold', cursor: 'pointer' }}>
                    I have read and agree to this policy
                </div>
            }
            return <div style={{ cursor: 'not-allowed' }}
                className="text-muted"
                title={`The {title} must be opened before you can agree to it`}>
                I have read and agree to this policy
            </div>
        })();

        const mustViewMessage = (() => {
            if (isViewed) {
                if (isAgreedTo) {
                    return <Alert variant="success">
                        You have agreed to this policy.
                    </Alert>
                }
                return <Alert variant="warning">
                    You have opened the policy document and must agree to it in order to complete sign in.
                </Alert>
            }
            return <Alert variant="warning" className="fw-bold">
                You must open the <i>{policy.title}</i> before you may agree to it.
            </Alert>
        })();

        const openPolicyMessage = (() => {
            if (isViewed) {
                return <p>
                    You have opened the {' '}
                    <Button
                        onClick={() => { this.onViewPolicy(); }}>
                        KBase Terms and Conditions (v{policy.version}, {Intl.DateTimeFormat('en-US', {}).format(policy.publishedAt)})
                    </Button>.
                </p>
            }
            return <p>
                Please open and review the {' '}
                <Button
                    onClick={() => { this.onViewPolicy(); }}>
                    KBase Terms and Conditions (v{policy.version}, {Intl.DateTimeFormat('en-US', {}).format(policy.publishedAt)})
                </Button>.
            </p>
        })();

        // const phrase = (() => {
        //     if (this.props.hasPreviousAgreements) {
        //         return 'has been updated';
        //     }
        //     return 'has not yet been agreed to by this account';
        // })();

        return <div className="UseAgreements">
            <Alert variant="warning" style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                <ExclamationTriangle style={{fontSize: '150%', fontWeight: 'bold', marginRight: '1rem'}}/> KBase Terms and Conditions (T&amp;C) have been updated. The new T&amp;C was published on {Intl.DateTimeFormat('en-US', {}).format(this.props.policyToResolve.publishedAt)}
            </Alert>
            {/* <p>
                The following KBase use policy {phrase}.
            </p>
            <p>
                You may sign in to this account after you have agreed to this policy by checking the box next to it.
            </p> */}
            <Well variant={isAgreedTo ? "success" : "danger"} style={{ marginBottom: '1rem' }}>
                <Well.Header>
                    KBase Terms and Conditions
                </Well.Header>
                <Well.Body>
                    <div className="row">
                        <div className="col-md-12">
                            {openPolicyMessage}
                            {mustViewMessage}
                            <div style={{ marginTop: '10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <div style={{ flex: '0 0 1em', marginRight: '0.5rem'  }}>
                                            <input
                                                type="checkbox"
                                                style={{ marginRight: '0.25em' }}
                                                checked={isAgreedTo}
                                                disabled={!isViewed}
                                                title={!isViewed ? `The Terms and Conditions document must be opened before you can agree to it` : ''}
                                                name="agreed"
                                                onClick={() => { this.toggleIsAgreedTo(); }} />
                                        </div>
                                        <div style={{ flex: '1 1 0' }}>
                                            {agreementLabel}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Well.Body>
            </Well>
        </div>
    }
}
