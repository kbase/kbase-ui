import { AuthenticationStateAuthenticated } from "contexts/EuropaContext";
import { navigate2 } from "lib/navigation";
import { Component } from "react";
import { Nav, Tab, TabContainer } from "react-bootstrap";
import { Config } from "types/config";
import AccountEditorController from "./Account/controller";
import DevTokensController from "./DevToken/controller";
import LinkedIdProvidersController from "./LinkedIDProviders/controller";
import LoginTokensController from "./LoginTokens/controller";
import ServTokensController from "./ServToken/controller";
import TermsAndConditionsController from "./TermsAndConditions/controller";

export interface AccountManagerViewProps {
    config: Config;
    authState: AuthenticationStateAuthenticated,
    tab?: string;
    setTitle: (title: string) => void;
    // logout: () => void;
}

export default class AccountManagerView extends Component<AccountManagerViewProps> {
    renderDevTokenTab() {
        if (!this.props.authState.authInfo.account.roles.find(({ id }) => {
            return id === 'DevToken'
        })) {
            return;
        }
        return <Tab eventKey="developerTokens" title="Developer Tokens" className="ms-4 me-4">
            <div className="mt-4">
                <DevTokensController
                    setTitle={this.props.setTitle}
                    authURL={this.props.config.services.Auth2.url}
                    token={this.props.authState.authInfo.token}
                    roles={this.props.authState.authInfo.account.roles}
                />
            </div>
        </Tab>
    }

    renderServerTokenTab() {
        if (!this.props.authState.authInfo.account.roles.find(({ id }) => {
            return id === 'ServToken'
        })) {
            return;
        }
        return <Tab eventKey="serviceTokens" title="Service Tokens" className="ms-4 me-4">
            <div className="mt-4">
                <ServTokensController
                    setTitle={this.props.setTitle}
                    authURL={this.props.config.services.Auth2.url}
                    token={this.props.authState.authInfo.token}
                    roles={this.props.authState.authInfo.account.roles}
                />
            </div>
        </Tab>
    }

    // renderx() {
    //     return <Tabs
    //         activeKey={this.props.tab || 'account'}
    //         className="ms-4 me-4"
    //         mountOnEnter
    //         onSelect={(eventKey: string | null) => {
    //             if (eventKey === null) {
    //                 eventKey = 'account';
    //             }
    //             // navigate(`account/${eventKey}`, {params: {tab: eventKey}});
    //             navigate(`account&tab=${eventKey}`);
    //         }}
    //         unmountOnExit>
    //         <Tab eventKey="account" title="Update Your Account" className="ms-4 me-4">
    //             <div className="mt-4">
    //                 <AccountEditorController
    //                     setTitle={this.props.setTitle}
    //                     config={this.props.config}
    //                     authState={this.props.authState}
    //                 />
    //             </div>
    //         </Tab>
    //         <Tab eventKey="links" title="Linked Sign-In Accounts" className="ms-4 me-4">
    //             <div className="mt-4">
    //                 <LinkedIdProvidersController
    //                     setTitle={this.props.setTitle}
    //                     config={this.props.config}
    //                     authURL={this.props.config.services.Auth2.url}
    //                     token={this.props.authState.authInfo.token}
    //                 />
    //             </div>
    //         </Tab>
    //         <Tab eventKey="loginTokens" title="Sign-Ins" className="ms-4 me-4">
    //             <div className="mt-4">
    //                 <LoginTokensController
    //                     setTitle={this.props.setTitle}
    //                     authURL={this.props.config.services.Auth2.url}
    //                     token={this.props.authState.authInfo.token}
    //                     roles={this.props.authState.authInfo.account.roles}
    //                 />
    //             </div>
    //         </Tab>
    //         {this.renderDevTokenTab()}
    //         {this.renderServerTokenTab()}
    //         <Tab eventKey="usePolicyAgreements" title="Terms and Conditions" className="ms-4 me-4">
    //             <div className="mt-4">
    //                 <TermsAndConditionsController
    //                     authURL={this.props.config.services.Auth2.url}
    //                     token={this.props.authState.authInfo.token}
    //                     setTitle={this.props.setTitle}
    //                 />
    //             </div>
    //         </Tab>
    //     </Tabs>
    // }

    render() {
        const hasServToken = this.props.authState.authInfo.account.roles.find(({ id }) => {
            return id === 'ServToken'
        })
        const hasDevToken = this.props.authState.authInfo.account.roles.find(({ id }) => {
            return id === 'DevToken'
        })
        return <TabContainer
            activeKey={this.props.tab || 'account'}
            // className="ms-4 me-4" 
            mountOnEnter
            onSelect={(eventKey: string | null) => {
                if (eventKey === null) {
                    eventKey = 'account';
                }
                navigate2({path: `account`, params: {tab: eventKey}, type: "kbaseui"})
                // navigate(`account&tab=${eventKey}`);
            }}
            unmountOnExit>
            <div style={{flex: '1 1 0', display: 'flex', flexDirection: 'column'}}>
                <div>
                    <Nav variant="tabs">
                        <Nav.Item>
                            <Nav.Link eventKey="account">Update Your Account</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="links">Linked Sign-In Accounts</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="loginTokens">Active Sign-In Sessions</Nav.Link>
                        </Nav.Item>
                        {
                            (() => {
                                if (!hasServToken) {
                                    return;
                                }
                                return <Nav.Item>
                                    <Nav.Link eventKey="ServToken">Service Tokens</Nav.Link>
                                </Nav.Item>;
                            })()
                        }
                        {
                            (() => {
                                if (!hasDevToken) {
                                    return;
                                }
                                return <Nav.Item>
                                    <Nav.Link eventKey="DevToken">Developer Tokens</Nav.Link>
                                </Nav.Item>;
                            })()
                        }
                        <Nav.Item>
                            <Nav.Link eventKey="usePolicyAgreements">Terms and Conditions</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </div>
                <div style={{flex: '1 1 0', overflowY: 'auto', marginTop: '1rem'}}>
                    <Tab.Content>
                        <Tab.Pane eventKey="account">
                            <AccountEditorController
                                setTitle={this.props.setTitle}
                                config={this.props.config}
                                authState={this.props.authState}
                            />
                        </Tab.Pane>
                        <Tab.Pane eventKey="links">
                            <LinkedIdProvidersController
                                setTitle={this.props.setTitle}
                                config={this.props.config}
                                authURL={this.props.config.services.Auth2.url}
                                token={this.props.authState.authInfo.token}
                            />
                        </Tab.Pane>
                        <Tab.Pane eventKey="loginTokens">
                            <LoginTokensController
                                setTitle={this.props.setTitle}
                                // logout={this.props.logout}
                                authURL={this.props.config.services.Auth2.url}
                                token={this.props.authState.authInfo.token}
                                roles={this.props.authState.authInfo.account.roles}
                            />
                        </Tab.Pane>

                        {
                            (() => {
                                if (!hasServToken) {
                                    return;
                                }
                                return <Tab.Pane eventKey="ServToken">
                                    <ServTokensController
                                        setTitle={this.props.setTitle}
                                        authURL={this.props.config.services.Auth2.url}
                                        token={this.props.authState.authInfo.token}
                                        roles={this.props.authState.authInfo.account.roles}
                                    />
                                </Tab.Pane>
                            })()
                        }

                        {
                            (() => {
                                if (!hasDevToken) {
                                    return;
                                }
                                return  <Tab.Pane eventKey="DevToken">
                                    <DevTokensController
                                        setTitle={this.props.setTitle}
                                        authURL={this.props.config.services.Auth2.url}
                                        token={this.props.authState.authInfo.token}
                                        roles={this.props.authState.authInfo.account.roles}
                                    />
                                </Tab.Pane>;
                            })()
                        }
                        
                        <Tab.Pane eventKey="usePolicyAgreements">
                            <TermsAndConditionsController
                                authURL={this.props.config.services.Auth2.url}
                                token={this.props.authState.authInfo.token}
                                setTitle={this.props.setTitle}
                            />
                        </Tab.Pane>
                    </Tab.Content>
                </div>
            </div>
        </TabContainer>
    }
}
