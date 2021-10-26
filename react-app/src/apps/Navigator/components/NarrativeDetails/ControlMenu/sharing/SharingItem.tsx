// as of now eslint cannot detect when imported interfaces are used
import React, { Component, CSSProperties } from 'react'; // eslint-disable-line no-unused-vars
import { LoadingSpinner } from '../../../generic/LoadingSpinner';
import PermSearch from './PermSearch';
import { UserPerms } from './Definitions';
import ShareUser from './ShareUser';
import { AuthService } from '../../../../utils/AuthService';
import {ServiceClient} from "@kbase/ui-lib/lib/lib/comm/JSONRPC11/ServiceClient";
import GenericClient from "@kbase/ui-lib/lib/lib/comm/JSONRPC11/GenericClient";
import {ControlMenuItemProps} from "../ControlMenu";

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
  private workspaceClient: ServiceClient;

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
    const [result] = await this.workspaceClient.callFunc('get_permissions_mass', [
      { workspaces: [{ id: wsId }] },
    ]);
    const perms = result.perms[0];
    const isGlobal = '*' in perms && perms['*'] != 'n';
    const narrativePerms: NarrativePerms = {
      isGlobal: isGlobal,
      allUserPerms: [],
      curUserPerm: this.state.perms.curUserPerm,
    };
    const userList = Object.keys(perms).reduce((users, userId): string[] => {
      if (userId !== '*') {
        users.push(userId);
      }
      return users;
    }, [] as string[]);
    // get user infos from auth
    const auth = new AuthService(this.props.config.services.Auth2.url, this.props.authInfo.token);

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
    narrativePerms.allUserPerms = narrativePerms.allUserPerms.sort((a, b) => {
      return a.userName.localeCompare(b.userName);
    });
    return narrativePerms;
  }

  async togglePublic() {
    this.setState({ isLoading: true });
    const isGlobal = this.state.perms.isGlobal;
    try {
      await this.workspaceClient
          .callFunc('set_global_permission', [
            {
              id: this.props.narrative.access_group,
              new_permission: isGlobal ? 'n' : 'r',
            },
          ]);

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

  async updatePerms(userIds: string[], newPerm: string) {
    this.setState({ isLoading: true });
    try {
      await this.workspaceClient.callFunc('set_permissions', [
            {
              id: this.props.narrative.access_group,
              users: userIds,
              new_permission: newPerm,
            },
          ]);

      await this.updateSharedUserInfo();
    } catch (ex) {
     console.error('ERROR should be handled', ex);
    }
  }

  render() {
    const curPerm = this.state.perms.curUserPerm.perm;
    if (this.state.isLoading) {
      return (
        <div style={{ width: '35rem', textAlign: 'center' }}>
          <LoadingSpinner loading={true} />
        </div>
      );
    }

    let sharedUsers = null;
    if (this.state.perms.allUserPerms) {
      sharedUsers = this.state.perms.allUserPerms.map((p: UserPerms) => (
        <ShareUser
          {...p}
          key={p.userId}
          updatePerms={this.updatePerms.bind(this)}
          curUserPerm={curPerm}
        />
      ));
    }

    let userPermSearch = null;
    if (curPerm === 'a') {
      userPermSearch = (
        <PermSearch
          authInfo={this.props.authInfo}
          addPerms={this.updatePerms.bind(this)}
          currentUser={this.state.perms.curUserPerm.userId}
          config={this.props.config}
        />
      );
    }

    return (
      <div style={{ width: '35rem', minHeight: '10rem' }}>
        <GlobalPerms
          isGlobal={this.state.perms.isGlobal}
          isAdmin={curPerm === 'a'}
          togglePublic={() => this.togglePublic()}
        />
        <div className="pb2" style={{ textAlign: 'center' }}>
          {this.makePermissionText(this.state.perms.curUserPerm.perm)}
        </div>
        {userPermSearch}
        <div>{sharedUsers}</div>
      </div>
    );
  }
}

interface GlobalProps {
  isGlobal: boolean;
  isAdmin: boolean;
  togglePublic: () => void;
}

function GlobalPerms(props: GlobalProps): React.ReactElement {
  const globalStyle: CSSProperties = {
    textAlign: 'center',
  };
  const icon = props.isGlobal ? 'fa-unlock' : 'fa-lock';

  let className = 'pa2 mb2 br2 ba';
  if (props.isAdmin) {
    className += ' dim pointer';
  }

  let text = '';
  if (props.isGlobal) {
    text = 'Public';
    className += ' bg-light-green dark-green b--green';
    if (props.isAdmin) {
      text += ' (click to make private)';
    }
  } else {
    text = 'Private';
    className += ' bg-lightest-blue dark-blue b--dark-blue';
    if (props.isAdmin) {
      text += ' (click to make public)';
    }
  }

  return (
    <div
      className={className}
      style={globalStyle}
      {...(props.isAdmin && { onClick: props.togglePublic })}
    >
      <span className={`fa ${icon} pr2`} />
      {text}
    </div>
  );
}
