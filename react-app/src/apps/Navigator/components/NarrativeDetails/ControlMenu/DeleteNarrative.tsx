import React, { Component } from 'react';
import { LoadingSpinner } from '../../generic/LoadingSpinner';
import DashboardButton from '../../generic/DashboardButton';
import NarrativeModel from '../../../utils/NarrativeModel';
import GenericClient from "@kbase/ui-lib/lib/lib/comm/JSONRPC11/GenericClient";
import {ControlMenuItemProps} from "./ControlMenu";

type ComponentStatus =
  | 'none'
  | 'loading'
  | 'ready'
  | 'deleting'
  | 'error'
  | 'success';

interface ComponentStateBase {
  status: ComponentStatus;
}

interface ComponentStateNone extends ComponentStateBase {
  status: 'none';
}

interface ComponentStateLoading extends ComponentStateBase {
  status: 'loading';
}

interface ComponentStateReady extends ComponentStateBase {
  status: 'ready';
}

interface ComponentStateDeleting extends ComponentStateBase {
  status: 'deleting';
}

interface ComponentStateError extends ComponentStateBase {
  status: 'error';
  error: {
    message: string | Array<string>;
  };
}

interface ComponentStateSuccess extends ComponentStateBase {
  status: 'success';
}

type ComponentState =
  | ComponentStateNone
  | ComponentStateLoading
  | ComponentStateReady
  | ComponentStateDeleting
  | ComponentStateError
  | ComponentStateSuccess;

export default class DeleteNarrative extends Component<
  ControlMenuItemProps,
  ComponentState
> {
  constructor(props: ControlMenuItemProps) {
    super(props);
    this.state = {
      status: 'none',
    };
  }

  async componentDidMount() {
    this.setState({
      status: 'loading',
    });
    try {
      const client = new NarrativeModel({
        workspaceURL: this.props.config.services.Workspace.url,
        token: this.props.authInfo.token
      });
      const perm = await client.getUserPermission(
         this.props.narrative.access_group,
          this.props.authInfo.account.user
      );
      if (perm === 'a') {
        this.setState({
          status: 'ready',
        });
      } else {
        this.setState({
          status: 'error',
          error: {
            message: 'You do not have permission to delete this Narrative.',
          },
        });
      }
    } catch (ex) {
      // TODO: [SCT-2923] the underlying exception does not provide a message!
      // This comes from a KBase jsonrpc client.
      this.setState({
        status: 'error',
        error: {
          message: [
            'This Narrative has already been deleted.',
            'The display may take up to 30 seconds to reflect a prior Narrative deletion.',
            'You may click the Refresh button to immediately conduct a fresh search, but the deleted narrative may still persist for up to 30 seconds.',
          ],
        },
      });
    }
  }

  async doDelete() {
    this.setState({
      status: 'deleting',
    });

    const workspaceClient = new GenericClient({
      module: 'Workspace',
      url: this.props.config.services.Workspace.url,
      token: this.props.authInfo.token,
      timeout: 1000
    });
    try {
      await workspaceClient.callFunc('delete_workspace', [
        { id: this.props.narrative.access_group },
      ]);
      this.setState({
        status: 'success',
      });
    } catch (error) {
      const message = (() => {
        if (error instanceof Error) {
          return error.message;
        }
        return 'Unknown error';
      })();

      this.setState({
        status: 'error',
        error: {
          message,
        },
      });
    }
  }

  renderError({ error: { message } }: ComponentStateError) {
    const messageContent = (() => {
      if (typeof message === 'string') {
        return <p>{message}</p>;
      } else {
        return message.map((message, index) => {
          return <p key={index}>{message}</p>;
        });
      }
    })();
    const done = () => {
      this.props.doneFn();
      if (this.props.cancelFn) {
        this.props.cancelFn();
      }
    };
    return (
      <>
        <div style={{ fontWeight: 'bold', color: 'red' }}>Error</div>
        {messageContent}
        <div style={{ textAlign: 'center' }}>
          <DashboardButton onClick={done}>Close</DashboardButton>
        </div>
      </>
    );
  }

  renderLoading(message: string) {
    return (
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner loading={true} />
      </div>
    );
  }

  renderSuccess() {
    const done = () => {
      this.props.doneFn();
      if (this.props.cancelFn) {
        this.props.cancelFn();
      }
    };
    return (
      <div style={{ textAlign: 'center' }}>
        <p>The Narrative has been successfully deleted.</p>
        <p>
          It may take up to 30 seconds for this to be reflected in the display.
        </p>
        <DashboardButton onClick={done}>Close</DashboardButton>
      </div>
    );
  }

  renderConfirmation() {
    return (
      <>
        <div className="pb2">
          <p>
            Deleting a Narrative will permanently remove it and all its data.
          </p>
          <p style={{ fontWeight: 'bold' }}>This action cannot be undone!</p>
        </div>
        <div className="pb2">Continue?</div>
        <div>
          <DashboardButton
            onClick={() => this.doDelete()}
            bgcolor={'red'}
            textcolor={'white'}
          >
            Delete
          </DashboardButton>
          <DashboardButton onClick={this.props.cancelFn}>
            Cancel
          </DashboardButton>
        </div>
      </>
    );
  }

  render() {
    switch (this.state.status) {
      case 'none':
      case 'loading':
        return this.renderLoading('Loading');
      case 'ready':
        return this.renderConfirmation();
      case 'deleting':
        return this.renderLoading('Deleting');
      case 'success':
        return this.renderSuccess();
      case 'error':
        return this.renderError(this.state);
    }
  }
}
