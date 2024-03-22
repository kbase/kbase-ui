import Empty from 'components/Empty';
import Well, { Variant } from 'components/Well';
import { AuthenticationState, AuthenticationStateAuthenticated, AuthenticationStateUnauthenticated, AuthenticationStatus } from 'contexts/EuropaContext';
import { Role } from 'lib/kb_lib/Auth2';
import { Component } from 'react';
import { Table } from 'react-bootstrap';

export interface AboutSessionControllerProps {
    authState: AuthenticationState
    setTitle: (title: string) => void;
}

export default class AboutSessionController extends Component<
    AboutSessionControllerProps
> {
    componentDidMount() {
        this.props.setTitle('About Your Session');
    }

    renderRoles(roles: Array<Role>) {
        if (roles.length === 0) {
            return <Empty message="No roles" size="inline" />
        }
        const rows = roles.map(({ id, desc }) => {
            return <tr key={id}>
                <td>{id}</td>
                <td>{desc}</td>
            </tr>
        })

        return <Table className="w-auto subdued-headers">
            <thead>
                <tr>
                    <th>Role Id</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </Table>
    }

    renderCustomRoles(roles: Array<string>) {
        if (roles.length === 0) {
            return <Empty message="No custom roles" size="inline" />
        }
        return roles.map((roleId) => {
            return <div key={roleId}>
                {roleId}
            </div>
        })
    }

    renderAuthenticated(authState: AuthenticationStateAuthenticated) {
        const { authInfo: { token, tokenInfo: { user, expires }, account: { roles, customroles } } } = authState;

        return <Table className="subdued-headers">
            <tbody>
                <tr>
                    <th style={{ width: '8rem' }}>Token</th>
                    <td>{token}</td>
                </tr>
                <tr>
                    <th>Expires</th>
                    <td>{Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'medium' }).format(expires)}</td>
                </tr>
                <tr>
                    <th>Username</th>
                    <td>{user}</td>
                </tr>
                <tr>
                    <th>Roles</th>
                    <td>{this.renderRoles(roles)}</td>
                </tr>
                <tr>
                    <th>Custom Roles</th>
                    <td>{this.renderCustomRoles(customroles)}</td>
                </tr>
            </tbody>
        </Table>
    }

    renderUnauthenticated(_authState: AuthenticationStateUnauthenticated) {
        return <Empty noBorder>
            You are not signed in, and therefore do not have a KBase Session.
        </Empty>
    }

    renderState() {
        switch (this.props.authState.status) {
            case AuthenticationStatus.NONE:
                return <Empty message="No Auth State" />
            case AuthenticationStatus.UNAUTHENTICATED:
                return this.renderUnauthenticated(this.props.authState);
            case AuthenticationStatus.AUTHENTICATED:
                return this.renderAuthenticated(this.props.authState)
        }
    }

    renderVariant(): Variant {
        switch (this.props.authState.status) {
            case AuthenticationStatus.NONE:
                return 'secondary';
            case AuthenticationStatus.UNAUTHENTICATED:
                return 'warning';
            case AuthenticationStatus.AUTHENTICATED:
                return 'secondary';
        }
    }

    render() {
        return <Well variant={this.renderVariant()}>
            <Well.Body>
                {this.renderState()}
            </Well.Body>
        </Well>
    }
}
