import GenericClient from '@kbase/ui-lib/lib/comm/JSONRPC11/GenericClient';
import { Component } from 'react';
import ErrorMessage from '../../../../../components/ErrorMessage';
import { AuthInfo } from '../../../../../contexts/Auth';
import {
    AsyncProcess,
    AsyncProcessStatus,
} from '../../../../../lib/AsyncProcess';
import { Config } from '../../../../../types/config';
import { NarrativeSearchDoc } from '../../../utils/NarrativeModel';
import { PermissionLevel } from './sharing/Definitions';
import ToolMenu from './ToolMenu';

export interface UserPermission {
    permission: PermissionLevel;
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

type ToolMenuWrapperState = AsyncProcess<UserPermission, string>;

export default class ToolMenUWrapper extends Component<
    ToolMenuWrapperProps,
    ToolMenuWrapperState
> {
    private workspaceClient: GenericClient;

    constructor(props: ToolMenuWrapperProps) {
        super(props);
        this.workspaceClient = new GenericClient({
            module: 'Workspace',
            url: this.props.config.services.Workspace.url,
            timeout: 1000,
            token: this.props.authInfo.token,
        });
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

    async fetchPermission(): Promise<UserPermission> {
        const workspaceId = this.props.narrative.access_group;

        // get shared perms from workspace
        const [result] = await this.workspaceClient.callFunc(
            'get_permissions_mass',
            [{ workspaces: [{ id: workspaceId }] }]
        );
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
