import ErrorMessage from 'components/ErrorMessage';
import { AuthInfo } from 'contexts/EuropaContext';
import { NarrativeSearchDoc } from 'lib/clients/NarrativeModel';
import WorkspaceClient, { UserPermission } from 'lib/kb_lib/comm/coreServices/Workspace';
import { Component } from 'react';
import {
    AsyncProcess,
    AsyncProcessStatus,
} from '../../../../../lib/AsyncProcess';
import { Config } from '../../../../../types/config';
import ToolMenu from './ToolMenu';
// import { PermissionLevel } from './sharing/Definitions';

export interface Permission {
    permission: UserPermission;
    isGlobal: boolean;
    isOwner: boolean;
}

export interface ToolMenuWrapperProps {
    config: Config;
    authInfo: AuthInfo;
    narrative: NarrativeSearchDoc;
    doneFn: () => void;
    cancelFn?: () => void;
}

type ToolMenuWrapperState = AsyncProcess<Permission, string>;

export default class ToolMenUWrapper extends Component<
    ToolMenuWrapperProps,
    ToolMenuWrapperState
> {
    constructor(props: ToolMenuWrapperProps) {
        super(props);
        this.state = {
            status: AsyncProcessStatus.NONE,
        };
    }

    async componentDidMount() {
        this.setState({
            status: AsyncProcessStatus.PENDING,
        });
        try {
            const currentUserPermission = await this.fetchPermission();
            this.setState({
                status: AsyncProcessStatus.SUCCESS,
                value: currentUserPermission,
            });
        } catch (ex) {
            this.setState({
                status: AsyncProcessStatus.ERROR,
                error: ex instanceof Error ? ex.message : 'Unknown error',
            });
        }
    }

    async fetchPermission(): Promise<Permission> {
        const workspaceId = this.props.narrative.access_group;

        // get shared perms from workspace
        const ws = new WorkspaceClient({
            url: this.props.config.services.Workspace.url,
            timeout: this.props.config.ui.constants.clientTimeout,
            token: this.props.authInfo.token
        });
        const result = await ws.get_permissions_mass(
            { workspaces: [{ id: workspaceId }] },
        )
        const perms = result.perms[0];

        const isGlobal = '*' in perms && perms['*'] !== 'n';

        const isOwner =
            this.props.narrative.owner === this.props.authInfo.account.user;

        const permission = perms[this.props.authInfo.account.user];

        return { isGlobal, isOwner, permission };
    }

    render() {
        switch (this.state.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                // return <Loading message="Determining user permission..." />;
                return null;
            case AsyncProcessStatus.SUCCESS:
                return (
                    <ToolMenu
                        narrative={this.props.narrative}
                        doneFn={this.props.doneFn}
                        permission={this.state.value}
                        cancelFn={this.props.cancelFn}
                        authInfo={this.props.authInfo}
                        config={this.props.config}
                    />
                );
            case AsyncProcessStatus.ERROR:
                return <ErrorMessage message={this.state.error} />;
        }
    }
}
