import Well from "components/Well";
import { Component } from "react";
import { IDProvider } from "types/config";

export interface SignedOutViewProps {
    providers: Array<IDProvider>
}

export default class SignedOutView extends Component<SignedOutViewProps> {
    render() {
        const providerLinksList = this.props.providers.map(({ id, logoutUrl, label }) => {
            return <li key={id}>
                <a href={logoutUrl} target="_blank" role="link">Log out from {label}</a>
            </li>
        });
        return <Well variant="success" className="ms-auto me-auto">
            <Well.Header>
                You are signed out of KBase.
            </Well.Header>
            <Well.Body>
                <p>
                    Although signed out of KBase, you may still be logged into an identity
                    provider you have recently
                    used to sign in to KBase in this browser.
                    This could allow your KBase account to be accessed merely by
                    using the Sign In button and choosing the sign-in provider.
                </p>
                <p>
                    If you wish to ensure that your KBase account is inaccessible from this browser,
                    you should sign out of any accounts you have used to access KBase as well.
                </p>
                <ul>
                    {providerLinksList}
                </ul>
                <p>
                    Additional security measures include:
                </p>
                <ul>
                    <li>Remove all browser cookies</li>
                    <li>Use your browser's private-browsing feature</li>
                </ul>
            </Well.Body>
        </Well>
    }
}
