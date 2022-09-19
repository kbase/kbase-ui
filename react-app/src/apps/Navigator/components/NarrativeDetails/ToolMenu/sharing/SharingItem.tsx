import { Component } from 'react';
import PermSearch from './PermSearch';
import { UserPerms } from './Definitions';
import ShareUser from './ShareUser';
import { AuthService } from '../../../../utils/AuthService';

import { ControlMenuItemProps } from '../ToolMenu';
import Loading from '../../../../../../components/Loading';
import GlobalPerms from './GlobalPerms';
import GenericClient from '../../../../../../lib/kb_lib/comm/JSONRPC11/GenericClient';
import MessageAlert from '../../../../../../components/AlertMessage';
import React from 'react';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import WorkspaceClient from 'lib/kb_lib/comm/coreServices/Workspace';

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
    private workspaceClient: GenericClient;

    constructor(props: ControlMenuItemProps) {
        super(props);

        this.workspaceClient = new GenericClient({
            module: 'Workspace',
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
            await this.workspaceClient.callFuncEmptyResult(
                'set_global_permission',
                [
                    {
                        id: this.props.narrative.access_group,
                        new_permission: isGlobal ? 'n' : 'r',
                    },
                ]
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

    async updatePermission(username: string, newPermission: string) {
        try {
            await this.workspaceClient.callFuncEmptyResult('set_permissions', [
                {
                    id: this.props.narrative.access_group,
                    users: [username],
                    new_permission: newPermission,
                },
            ]);

            await this.updateSharedUserInfo();
        } catch (ex) {
            console.error('ERROR should be handled', ex);
        }
    }

    async updatePermissions(usernames: Array<string>, newPermission: string) {
        try {
            await this.workspaceClient.callFuncEmptyResult('set_permissions', [
                {
                    id: this.props.narrative.access_group,
                    users: usernames,
                    new_permission: newPermission,
                },
            ]);

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
                <MessageAlert
                    type="info"
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
                <div className="well">
                    <div className="well-header">
                        <span className="fa fa-globe"></span> Global Access
                    </div>
                    <div className="well-body">
                        <GlobalPerms
                            isGlobal={this.state.perms.isGlobal}
                            isAdmin={curPerm === 'a'}
                            togglePublic={this.togglePublic.bind(this)}
                        />
                    </div>
                </div>
                <div className="well mt-3">
                    <div className="well-header">
                        <span className="fa fa-share-alt"></span> Sharing with
                        Other Users
                    </div>

                    <div className="well-section">
                        {this.renderPermSearch()}
                    </div>
                    <div className="well-title">Users Shared With</div>
                    <div className="well-section">
                        {this.renderSharedUsers()}
                    </div>
                </div>
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
