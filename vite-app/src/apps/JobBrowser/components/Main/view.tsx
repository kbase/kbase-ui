import { faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AuthenticationStateAuthenticated } from 'contexts/EuropaContext';
import React, { CSSProperties, ReactNode } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { Config } from 'types/config';
import AdminJobs from '../AdminJobs';
import MyJobs from '../MyJobs';
import PublicAppStats from '../PublicAppStats';
import UserRunSummary from '../UserRunSummary';
import './style.css';

export interface MainProps {
    config: Config;
    authState: AuthenticationStateAuthenticated;
    isAdmin: boolean;
    // params: MainParams;
    // view: string;
    tab?: string;
    setTitle: (title: string) => void;
    // setView: (view: string) => void;
    // setParams: (params: MainParams) => void;
}

interface MainState {
}

export default class Main extends React.Component<MainProps, MainState> {
    defaultTabKey: string;
    constructor(props: MainProps) {
        super(props);
        this.defaultTabKey = 'myJobs';
    }

    componentDidMount() {
        this.props.setTitle('Job Browser');
    }

    renderTabs() {
        const tabPaneStyle: CSSProperties = {
            position: 'absolute', top: '0', right: '0', bottom: '0', left: '0', display: 'flex', flexDirection: 'column'
        }
        const tabContentStyle: CSSProperties = { flex: '1 1 0', position: 'relative' }
        return <Tab.Container id="main-tabs" defaultActiveKey="myJobs" mountOnEnter unmountOnExit>
            <div>
                <Nav variant="tabs" className="flex-row">
                    <Nav.Item>
                        <Nav.Link eventKey="myJobs">My Jobs</Nav.Link>
                    </Nav.Item>
                    {
                        ((): ReactNode => {
                            if (!this.props.isAdmin) {
                                return;
                            }
                            return <Nav.Item>
                                <Nav.Link eventKey="userJobs">User Jobs <FontAwesomeIcon icon={faLockOpen} /></Nav.Link>
                            </Nav.Item>
                        })()
                    }
                    <Nav.Item>
                        <Nav.Link eventKey="publicAppStats">Public App Stats</Nav.Link>
                    </Nav.Item>
                    {
                        ((): ReactNode => {
                            if (!this.props.isAdmin) {
                                return;
                            }
                            return <Nav.Item>
                                <Nav.Link eventKey="userRunSummary">User Run Summary <FontAwesomeIcon icon={faLockOpen} /></Nav.Link>
                            </Nav.Item>
                        })()
                    }
                </Nav>
            </div>
            <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column' }}>
                <Tab.Content style={tabContentStyle}>
                    <Tab.Pane eventKey="myJobs" style={tabPaneStyle}>
                        <MyJobs
                            config={this.props.config}
                            authState={this.props.authState}
                        />
                    </Tab.Pane>
                    {
                        ((): ReactNode => {
                            if (!this.props.isAdmin) {
                                return;
                            }
                            return <Tab.Pane eventKey="userJobs" style={tabPaneStyle}>
                                <AdminJobs
                                    config={this.props.config}
                                    authState={this.props.authState}
                                />
                            </Tab.Pane>
                        })()
                    }
                    <Tab.Pane eventKey="publicAppStats" style={tabPaneStyle}>
                        <PublicAppStats
                            config={this.props.config}
                            auth={this.props.authState}
                        />
                    </Tab.Pane>
                    {
                        ((): ReactNode => {
                            if (!this.props.isAdmin) {
                                return;
                            }
                            return <Tab.Pane eventKey="userRunSummary" style={tabPaneStyle}>
                                <UserRunSummary
                                    config={this.props.config}
                                    auth={this.props.authState}
                                />
                            </Tab.Pane>
                        })()
                    }
                </Tab.Content>
            </div>
        </Tab.Container>
    }

    render() {
        return <div
            className="Main Col Col-scrollable"
            data-k-b-testhook-plugin="job-browser2"
        >
            {this.renderTabs()}
        </div>;
    }
}
