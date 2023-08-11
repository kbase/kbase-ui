import { Component } from 'react';
import { AuthService } from '../../../../utils/AuthService';
import { UserPerms } from './Definitions';
import PermSearch from './PermSearch';
import ShareUser from './ShareUser';

import AlertMessage from 'components/AlertMessage';
import Loading from 'components/Loading';
import Well from 'components/Well';
import { UserPermission, default as Workspace, default as WorkspaceClient } from 'lib/kb_lib/comm/coreServices/Workspace';
import React from 'react';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import { ControlMenuItemProps } from '../ToolMenu';
import GlobalPerms from './GlobalPerms';

interface State {
    isLoading: boolean;
    perms: NarrativePerms;
}

interface NarrativePerms {
    allUserPerms: Array<UserPerms>;
    curUserPerm: UserPerms;
    isGlobal: boolean;
}

export default class SharingItem extends Component<
    ControlMenuItemProps,
    State
> {
    private workspaceClient: Workspace;

    constructor(props: ControlMenuItemProps) {
        super(props);

        this.workspaceClient = new Workspace({
            url: this.props.config.services.Workspace.url,
            timeout: 1000,
            token: this.props.authInfo.token,
        });

        const userId = this.props.authInfo.tokenInfo.user;

        this.state = {
            isLoading: true,
            perms: {
                allUserPerms: [],
                isGlobal: false,
                curUserPerm: {
                    userId,
                    userName: '',
                    perm: 'n',
                },
            },
        };
    }

    componentDidMount() {
        this.updateSharedUserInfo();
    }

    async updateSharedUserInfo() {
        const sharedUserInfo: NarrativePerms = await this.fetchSharedUsers();
        this.setState({
            isLoading: false,
            perms: sharedUserInfo,
        });
    }

    async fetchSharedUsers(): Promise<NarrativePerms> {
        const wsId = this.props.narrative.access_group;
        // get shared perms from workspace
        const ws = new WorkspaceClient({
            url: this.props.config.services.Workspace.url,
            timeout: 1000,
            token: this.props.authInfo.token
        });
        const result = await ws.get_permissions_mass(
            { workspaces: [{ id: wsId }] },
        )
        const perms = result.perms[0];

        // Global permissions are represented as the user "*", with permissions
        // restricted to 'r' and 'n'.
        const isGlobal = '*' in perms && perms['*'] !== 'n';

        const narrativePerms: NarrativePerms = {
            isGlobal: isGlobal,
            allUserPerms: [],
            curUserPerm: this.state.perms.curUserPerm,
        };
        const userList = Object.keys(perms).reduce(
            (users, userId): string[] => {
                if (userId !== '*') {
                    users.push(userId);
                }
                return users;
            },
            [] as string[]
        );
        // get user infos from auth
        const auth = new AuthService(
            this.props.config.services.Auth2.url,
            this.props.authInfo.token
        );

        const userNames: { [key: string]: string } = await auth.getUsernames(
            userList
        );
        userList.forEach((u) => {
            const userPerm: UserPerms = {
                userId: u,
                userName: userNames[u],
                perm: perms[u],
            };
            if (u === narrativePerms.curUserPerm.userId) {
                narrativePerms.curUserPerm = userPerm;
            } else {
                narrativePerms.allUserPerms.push(userPerm);
            }
        });
        narrativePerms.allUserPerms = narrativePerms.allUserPerms.sort(
            (a, b) => {
                return a.userName.localeCompare(b.userName);
            }
        );
        return narrativePerms;
    }

    async togglePublic() {
        // this.setState({ isLoading: true });
        const isGlobal = this.state.perms.isGlobal;
        try {
            await this.workspaceClient.set_global_permission(
                {
                    id: this.props.narrative.access_group,
                    new_permission: isGlobal ? 'n' : 'r',
                },
            );

            this.setState((prevState) => ({
                isLoading: false,
                perms: {
                    isGlobal: !isGlobal,
                    allUserPerms: prevState.perms.allUserPerms,
                    curUserPerm: prevState.perms.curUserPerm,
                },
            }));
        } catch (ex) {
            console.error('ERROR should be handled', ex);
        }
    }

    makePermissionText(perm: string) {
        switch (perm) {
            case 'a':
                return 'You can view, edit, and share this Narrative.';
            case 'r':
                return 'You can view this Narrative, but not edit or share it.';
            case 'w':
                return 'You can view and edit this Narrative, but not share it.';
            case 'n':
            default:
                return 'You have no permissions on this Narrative.';
        }
    }

    async updatePermission(username: string, newPermission: UserPermission) {
        try {
            await this.workspaceClient.set_permissions(
                {
                    id: this.props.narrative.access_group,
                    users: [username],
                    new_permission: newPermission,
                },
            );

            await this.updateSharedUserInfo();
        } catch (ex) {
            console.error('ERROR should be handled', ex);
        }
    }

    async updatePermissions(usernames: Array<string>, newPermission: UserPermission) {
        try {
            await this.workspaceClient.set_permissions(
                {
                    id: this.props.narrative.access_group,
                    users: usernames,
                    new_permission: newPermission,
                },
            );

            await this.updateSharedUserInfo();
        } catch (ex) {
            console.error('ERROR should be handled', ex);
        }
    }

    renderPermSearch() {
        if (this.state.perms.curUserPerm.perm !== 'a') {
            return null;
        }
        return (
            <PermSearch
                authInfo={this.props.authInfo}
                addPermissions={this.updatePermissions.bind(this)}
                currentUsername={this.state.perms.curUserPerm.userId}
                config={this.props.config}
            />
        );
    }

    async removeAccess(username: string) {
        await this.updatePermission(username, 'n');
        this.updateSharedUserInfo();
    }

    renderSharedUsers() {
        if (this.state.perms.allUserPerms.length === 0) {
            return (
                <AlertMessage
                    variant="info"
                    message="This Narrative is not shared with any users"
                />
            );
        }
        return this.state.perms.allUserPerms.map(
            (userPermission: UserPerms) => {
                const {
                    userId: username,
                    userName: realname,
                    perm: permission,
                } = userPermission;
                return (
                    <ShareUser
                        key={username}
                        username={username}
                        realname={realname}
                        permission={permission}
                        currentUserPermission={
                            this.state.perms.curUserPerm.perm
                        }
                        updatePermission={this.updatePermission.bind(this)}
                        removeAccess={this.removeAccess.bind(this)}
                    />
                );
            }
        );
    }

    renderCloseButton() {
        return (
            <Button onClick={this.props.cancelFn} variant="secondary">
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    <span
                        className="fa fa-times fa-2x"
                        style={{ marginRight: '0.25em' }}
                    />{' '}
                    Close
                </div>
            </Button>
        );
    }

    renderModal(body: JSX.Element, footer?: JSX.Element) {
        if (!footer) {
            footer = this.renderCloseButton();
        }
        return (
            <React.Fragment>
                <Modal.Body>
                    <Container fluid>
                        <Row>
                            <Col>{body}</Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Container fluid>
                        <Row className="justify-content-center">
                            <Col md="auto">{footer}</Col>
                        </Row>
                    </Container>
                </Modal.Footer>
            </React.Fragment>
        );
    }

    renderForm() {
        const curPerm = this.state.perms.curUserPerm.perm;
        return (
            <div style={{ minHeight: '10rem' }}>
                <p>
                    {this.makePermissionText(this.state.perms.curUserPerm.perm)}
                </p>
                <Well variant="light">
                    <Well.Header icon="globe">
                        Global Access
                    </Well.Header>
                    <Well.Body>
                        <GlobalPerms
                            isGlobal={this.state.perms.isGlobal}
                            isAdmin={curPerm === 'a'}
                            togglePublic={this.togglePublic.bind(this)}
                        />
                    </Well.Body>
                </Well>
                <Well className="mt-3" variant="light">
                    <Well.Header icon="share-alt">
                        Sharing with Other Users
                    </Well.Header>

                    <Well.Body>
                        <div className="fs-6 fw-bold text-secondary">Share with 1 or more users</div>
                        {this.renderPermSearch()}
                        <div className="fs-6 fw-bold text-secondary mt-2">Already shared with</div>
                        {this.renderSharedUsers()}
                    </Well.Body>
                </Well>
            </div>
        );
    }

    render() {
        if (this.state.isLoading) {
            return this.renderModal(<Loading message="Loading..." />);
        }

        return this.renderModal(this.renderForm());
    }
}
