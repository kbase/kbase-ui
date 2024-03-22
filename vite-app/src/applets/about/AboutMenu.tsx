import { navigate2 } from "lib/navigation";
import { Component } from "react";
import { Nav } from "react-bootstrap";

export interface AboutMenuProps {
    tab: string;
}

export default class AboutMenu extends Component<AboutMenuProps> {
    onSelect(eventKey: string | null) {
        navigate2({type: 'kbaseui', path: `about/${eventKey || 'kbase-ui'}`});
    }

    render() {
        return <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}} className="ms-2 mb-2">
            <div style={{fontSize: '130%', fontWeight: 'bold'}} className="me-2">About</div>
            <Nav variant="pills" activeKey={this.props.tab}
                onSelect={this.onSelect.bind(this)}
                >
                <Nav.Item>
                    <Nav.Link eventKey="kbase-ui">
                        kbase-ui
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="services">
                        services
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="plugins">
                        plugins
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="session">
                        session
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </div>
    }
}
