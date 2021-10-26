import React, { Component } from 'react';

import { LoadingSpinner } from '../../generic/LoadingSpinner';
import OrganizationsClient , {
    GroupInfo,
    GroupIdentity,
} from '../../../utils/OrganizationsClient';
import NarrativeModel, {Doc} from '../../../utils/NarrativeModel';
import OrgSelect from './OrgSelect';
import Model, { LinkOrgResult } from './Model';
import {
  AsyncProcess,
  AsyncProcessError,
  AsyncProcessStatus,
  AsyncProcessSuccess,
} from '../../../utils/AsyncProcess';
import {ControlMenuItemProps} from "./ControlMenu";


interface LinkOrgState {
  perm: string;
  linkedOrgs: Array<GroupInfo>;
  userOrgs: Array<GroupIdentity>;
}

interface LinkOrgItemState {
  loadProcess: AsyncProcess<LinkOrgState>;
  linkProcess: AsyncProcess<LinkOrgResult>;
}

export default class LinkOrgItem extends Component<
    ControlMenuItemProps,
  LinkOrgItemState
> {
  constructor(props: ControlMenuItemProps) {
    super(props);
    this.state = {
      loadProcess: { status: AsyncProcessStatus.NONE },
      linkProcess: { status: AsyncProcessStatus.NONE },
    };
  }

  /**
   * Once the component mounts, it should look up the user's permissions
   * on the Narrative, the list of orgs that the user belongs to, and any orgs
   * that the Narrative is already linked to.
   *
   * Next, it filters the user's orgs to remove those that overlap with the orgs
   * that this Narrative is linked to - so they don't show up in the dropdown
   * selector.
   */
  async componentDidMount() {
    this.updateState();
  }

  async updateState() {
    this.setState({
      loadProcess: {
        status: AsyncProcessStatus.PENDING,
      },
    });
    try {
      const narrativeModel = new NarrativeModel({
          workspaceURL: this.props.config.services.Workspace.url,
          token: this.props.authInfo.token
      });
      const perm = await narrativeModel.getUserPermission(
          this.props.narrative.access_group,
          this.props.authInfo.account.user
      );

      const organizationsClient = new OrganizationsClient(({
        groupsURL: this.props.config.services.Groups.url,
        token: this.props.authInfo.token
      }));

      const linkedOrgs = await organizationsClient.getLinkedOrgs(
        this.props.narrative.access_group
      );

      const linkedOrgIds: Set<string> = new Set();
      for (const org of linkedOrgs) {
        linkedOrgIds.add(org.id);
      }

      // reduce the set of userOrgs down to those that are not already linked.
      // Don't want to give the illusion of being able to link again.
      const userOrgs = (await organizationsClient.lookupUserOrgs()).filter(
        (org) => {
          return !linkedOrgIds.has(org.id);
        }
      );

      this.setState({
        loadProcess: {
          status: AsyncProcessStatus.SUCCESS,
          value: {
            perm,
            linkedOrgs,
            userOrgs,
          },
        },
      });
    } catch (ex) {
      const message = (() => {
        if (ex instanceof Error) {
          return ex.message;
        }
        return 'Unknown error';
      })();
      this.setState({
        loadProcess: {
          status: AsyncProcessStatus.ERROR,
          message,
        },
      });
    }
  }

  async doLinkOrg(orgId: string): Promise<void> {
    this.setState({
      linkProcess: {
        status: AsyncProcessStatus.PENDING,
      },
    });
    try {
      const result = await new Model({
        authInfo: this.props.authInfo,
        narrativeId: this.props.narrative.access_group,
        config: this.props.config
      }).linkOrg(orgId);
      this.setState(
        {
          linkProcess: {
            status: AsyncProcessStatus.SUCCESS,
            value: result,
          },
        },
        () => {
          this.updateState();
        }
      );
    } catch (ex) {
      const message = (() => {
        if (ex instanceof Error) {
          return ex.message;
        }
        return 'Unknown error';
      })();
      this.setState({
        linkProcess: {
          status: AsyncProcessStatus.ERROR,
          message,
        },
      });
    }
  }

  makeLinkedOrgsList(state: LinkOrgState) {
    let linkedOrgsText = 'This Narrative is not linked to any organizations.';
    let linkedOrgsList = null;
    if (state.linkedOrgs.length > 0) {
      linkedOrgsList = state.linkedOrgs.map((org: GroupInfo) => (
        <LinkedOrg {...org} key={org.id} />
      ));
      linkedOrgsText = 'Organizations this Narrative is linked to:';
    }
    return (
      <div className="pt2">
        <div style={{ textAlign: 'center', marginTop: '1em' }}>
          {linkedOrgsText}
        </div>
        <div className="pt2">{linkedOrgsList}</div>
      </div>
    );
  }

  renderPending() {
    return (
      <div style={{ width: '35rem', textAlign: 'center' }}>
        <LoadingSpinner loading={true} />
      </div>
    );
  }

  renderLinkPending() {
    return (
      <div style={{ width: '35rem', textAlign: 'center' }}>
        <LoadingSpinner loading={true} message="Linking..." />
      </div>
    );
  }

  renderLoadError(loadProcess: AsyncProcessError) {
    return (
      <div
        className={`pa3 mb2 ba br2 b--gold bg-light-yellow`}
        style={{ textAlign: 'center' }}
      >
        {loadProcess.message}
      </div>
    );
  }

  renderLoaded(loadProcess: AsyncProcessSuccess<LinkOrgState>) {
    if (loadProcess.value.perm !== 'a') {
      return (
        <div style={{ textAlign: 'center' }}>
          You don't have permission to request to add this Narrative to an
          Organization.
        </div>
      );
    }
    return (
      <div style={{ width: '35rem', minHeight: '10rem' }}>
        {this.renderLinkProcess()}
        <OrgSelect
          linkOrg={this.doLinkOrg.bind(this)}
          orgs={loadProcess.value.userOrgs}
        />
        <div>{this.makeLinkedOrgsList(loadProcess.value)}</div>
      </div>
    );
  }

  renderErrorMessage(message: string) {
    return (
      <div
        className={`pa3 mb2 ba br2 b--gold bg-light-yellow`}
        style={{ textAlign: 'center' }}
      >
        {message}
      </div>
    );
  }

  renderWarningMessage(message: string) {
    return (
      <div
        className={`pa3 mb2 ba br2 b--gold bg-light-yellow`}
        style={{ textAlign: 'center' }}
      >
        {message}
      </div>
    );
  }

  renderSuccessMessage(message: string) {
    return (
      <div
        className={`pa3 mb2 ba br2 b--green bg-light-green`}
        style={{ textAlign: 'center' }}
      >
        {message}
      </div>
    );
  }

  renderLinkError(linkProcess: AsyncProcessError) {
    return this.renderErrorMessage(linkProcess.message);
  }

  renderLinked(linkProcess: AsyncProcessSuccess<LinkOrgResult>) {
    switch (linkProcess.value) {
      case 'completed':
        return this.renderSuccessMessage(
          'The Narrative has been successfully linked.'
        );
      case 'requested':
        return this.renderSuccessMessage(
          'A request to link this Narrative has been sent to the Organization admins.'
        );
    }
  }

  renderLinkProcess() {
    switch (this.state.linkProcess.status) {
      case AsyncProcessStatus.NONE:
        return;
      case AsyncProcessStatus.PENDING:
        return this.renderLinkPending();
      case AsyncProcessStatus.ERROR:
        return this.renderLinkError(this.state.linkProcess);
      case AsyncProcessStatus.SUCCESS:
        return this.renderLinked(this.state.linkProcess);
    }
  }

  render() {
    switch (this.state.loadProcess.status) {
      case AsyncProcessStatus.NONE:
      case AsyncProcessStatus.PENDING:
        return this.renderPending();
      case AsyncProcessStatus.ERROR:
        return this.renderLoadError(this.state.loadProcess);
      case AsyncProcessStatus.SUCCESS:
        return this.renderLoaded(this.state.loadProcess);
    }
  }
}

interface LinkedOrgProps extends GroupInfo {
  key: string;
}

const LinkedOrg = (props: LinkedOrgProps) => {
  return (
    <div className="pl2 pt2">
      <a
        className="blue pointer no-underline dim"
        href={`#orgs/${props.id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="fa fa-external-link pr1" />
        {props.name}
      </a>
    </div>
  );
};
