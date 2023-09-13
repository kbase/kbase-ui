import { Component } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { XCircle } from 'react-bootstrap-icons';
import QueryLinkingSessionsContext from "./linkingSessions";
import OverviewContext from "./overview";
import QueryLinks from "./queryLinks/index";
import './view.css';

export interface ORCIDLinkManageProps {
    viewedLinks: Array<string>;
    addViewedLink: (username: string) => void;
    removeViewedLink: (username: string) => void;
}

interface ORCIDLinkManageState {
    activeKey: string | null;
}

export default class ORCIDLinkManageView extends Component<ORCIDLinkManageProps, ORCIDLinkManageState> {
    constructor(props: ORCIDLinkManageProps) {
        super(props);
        this.state = {
            activeKey: null
        }
    }

    viewLink(username: string) {
        this.setState({
            activeKey: `link-${username}`
        });
        this.props.addViewedLink(username);
    }

    unviewLink(username: string) {
        this.props.removeViewedLink(username);
        this.setState({
            activeKey: null
        })
    }

    render() {
        const viewedLinkTabs = this.props.viewedLinks.map((username) => {
            const title = <span>
                Link for {username}
                <a href="#"
                    className="text-danger"
                    style={{ marginLeft: '0.5rem' }}
                    onClick={(e) => {
                        e.preventDefault();
                        this.unviewLink(username);
                    }}><XCircle /></a>
            </span>
            return <Tab eventKey={`link-${username}`} title={title} >
                <div>
                    <p>This will be the link for {username}</p>
                </div>
            </Tab>
        })

        return <div className="ORCIDLinkManageView">
            <Tabs variant="tabs"
                defaultActiveKey="overview"
                activeKey={this.state.activeKey || undefined}
                onSelect={(eventKey: string | null) => {
                    this.setState({
                        activeKey: eventKey
                    })
                }}
                mountOnEnter unmountOnExit>
                <Tab eventKey="overview" title="Overview">
                    <OverviewContext />
                </Tab>
                <Tab eventKey="links" title="Links">
                    <QueryLinks viewLink={this.viewLink.bind(this)} />
                </Tab>

                {...viewedLinkTabs}

                <Tab eventKey="sessions" title="Linking Sessions">
                    <QueryLinkingSessionsContext />
                </Tab>

                <Tab eventKey="audit" title="Audit Trail">
                    <p>TO DO</p>
                </Tab>



                {/* <Tab eventKey="tasks" title="Maintenance Tasks">
                    <ListGroup style={{ marginTop: '1rem' }}>
                        <ListGroup.Item>Prune expired sessions</ListGroup.Item>
                    </ListGroup>
                </Tab> */}

            </Tabs>
        </div>
    }
}
