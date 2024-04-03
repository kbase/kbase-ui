import { providerLabel, providerLogoSrc } from "apps/Auth2/Providers";
import TextSpan from "apps/Auth2/TextSpan";
import Well from "components/Well";
import { Identity } from "lib/kb_lib/Auth2";
import { Component } from "react";
import { Alert, Button, Dropdown, Form } from "react-bootstrap";
import { IDProvider } from "types/config";
import styles from './view.module.css';

export interface LinkedIdProvidersViewProps {
    providers: Array<IDProvider>;
    identities: Array<Identity>;
    linkIdentity: (id: string) => void;
    unlinkIdentity: (id: string) => void;
}

interface LinkedIdProvidersViewState {
    canUnlink: boolean;
    selectedProvider: IDProvider | null
}

export default class LinkedIdProvidersView extends Component<LinkedIdProvidersViewProps, LinkedIdProvidersViewState> {
    constructor(props: LinkedIdProvidersViewProps) {
        super(props);
        this.state = {
            canUnlink: this.props.identities.length > 1,
            selectedProvider: null
        }
    }

    renderProviderLabel(providerId: string) {
        return <div className={styles.providerLabel} >
                <div className={styles.logo}>
                    <img 
                        src={`${providerLogoSrc(providerId)}`}
                        style={{height: '24px'}} 
                    />
                </div>
                <div className={styles.label}>
                    {providerLabel(providerId)}
                </div>
            </div>
    }

    renderLinkedAccounts() {
        const rows = this.props.identities.map((identity) => {
            const tooltip = (() => {
                if (this.state.canUnlink) {
                    return `Unlink this ${identity.provider} account from your KBase account`;
                }
                return 'Since this is the only external sign-in account linked to your KBase account, you cannot unlink it';

            })();
            return <tr key={identity.id}>
                    <td>
                        {this.renderProviderLabel(identity.provider)}
                    </td>
                    <td>
                        {identity.provusername}
                    </td>
                    <td>
                        <Button variant="danger" 
                            disabled={!this.state.canUnlink}
                            // dataPlacement="top"
                            title={tooltip}
                            onClick={() => {this.props.unlinkIdentity(identity.id);}}>
                            Unlink
                        </Button>
                    </td>
                </tr>
        });
        return <table className="table"> 
            <thead>
                <tr>
                    <th>Provider</th>
                    <th>Username</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>;
    }

    doSubmitLinkRequest() {
        if (this.state.selectedProvider === null) {
            return;
        }
        this.props.linkIdentity(this.state.selectedProvider.id);
    }

    selectProvider(provider: IDProvider) {
        this.setState({
            selectedProvider: provider
        });
    }

    renderAccountLinker() {
        const availableProviders = this.props.providers.filter(({id}) => {
            return !this.props.identities.some(({provider}) => {
                return provider === id;
            });
        });

        if (availableProviders.length === 0) {
            return <Alert variant="info">
                All available id providers have been linked
            </Alert>
        }

        return <Form className="form-inline" 
                     onSubmit={(e) => {e.preventDefault(); this.doSubmitLinkRequest();}}>
            <div>
                <Button variant="primary"
                    type="submit"
                    disabled={this.state.selectedProvider === null}
                >
                    Link
                </Button>
                <TextSpan>an account from the identity provider</TextSpan>
                <div style={{
                    position: 'relative',
                    display: 'inline-block'
                }}>
                    <Dropdown>
                        <Dropdown.Toggle variant="primary">
                            Select a Provider
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                        {
                            availableProviders.map((provider) => {
                                return <Dropdown.Item key={provider.id} onClick={() => {this.selectProvider(provider)}}>
                                    {this.renderProviderLabel(provider.id)}
                                </Dropdown.Item>
                            })
                        }
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        </Form>;
    }

    render() {
        return <div className={styles.main}>
            <Well variant="secondary" className="mb-4">
                <Well.Header>
                    Currently Linked Accounts
                </Well.Header>
                <Well.Body>
                    {this.renderLinkedAccounts()}
                </Well.Body>
            </Well>

            <Well variant="secondary">
                <Well.Header>
                    Link an additional sign-in account to this KBase Account
                </Well.Header>
                <Well.Body>
                    {this.renderAccountLinker()}
                </Well.Body>
            </Well>
        </div>
    }
}