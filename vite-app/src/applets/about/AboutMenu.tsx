import { AuthenticationState, AuthenticationStatus } from 'contexts/EuropaContext';
import { navigate2 } from 'lib/navigation';
import { Component } from 'react';
import { Nav } from 'react-bootstrap';

export interface AboutMenuProps {
  tab: string;

  authState: AuthenticationState;
}

export default class AboutMenu extends Component<AboutMenuProps> {
  onSelect(eventKey: string | null) {
    navigate2({ type: 'kbaseui', path: `about/${eventKey || 'kbase-ui'}` });
  }

  renderAboutBuild() {
    if (
      this.props.authState.status === AuthenticationStatus.AUTHENTICATED &&
      this.props.authState.authInfo.account.roles.some(({ id }) => ['DevToken', 'ServToken', 'Admin'].includes(id))
    ) {
      return (
        <Nav.Item>
          <Nav.Link eventKey="build">build</Nav.Link>
        </Nav.Item>
      );
    }
  }

  renderConnectionStatus() {
    if (
      this.props.authState.status === AuthenticationStatus.AUTHENTICATED &&
      this.props.authState.authInfo.account.roles.some(({ id }) => ['DevToken', 'ServToken', 'Admin'].includes(id))
    ) {
      return (
        <Nav.Item>
          <Nav.Link eventKey="connection">connection</Nav.Link>
        </Nav.Item>
      );
    }
  }

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }} className="ms-2 mb-2">
        <div style={{ fontSize: '130%', fontWeight: 'bold' }} className="me-2">
          About
        </div>
        <Nav variant="pills" activeKey={this.props.tab} onSelect={this.onSelect.bind(this)}>
          {/* <Nav.Item>
                    <Nav.Link eventKey="kbase-ui">
                        kbase-ui
                    </Nav.Link>
                </Nav.Item> */}
          <Nav.Item>
            <Nav.Link eventKey="services">services</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="plugins">plugins</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="session">session</Nav.Link>
          </Nav.Item>
          {this.renderAboutBuild()}
          {this.renderConnectionStatus()}
        </Nav>
      </div>
    );
  }
}
