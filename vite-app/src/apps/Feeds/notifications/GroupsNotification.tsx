import { faExternalLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UILink from 'components/UILink2';
import { navigationPathToURL } from 'contexts/RouterContext';
import { FeedNotification } from 'lib/clients/Feeds';
import { Component } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Entity from '../components/Entity';

export interface GroupsNotificationProps {
  currentUserId: string;
  notification: FeedNotification;
}

export default class GroupsNotification extends Component<GroupsNotificationProps> {
  narrativeURL() {
    switch (this.props.notification.verb) {
      case 'requested':
      case 'invited':
        return navigationPathToURL({ type: 'europaui', path: `narrative/${this.props.notification.object.id}` }, true);
    }
  }

  renderLinkButton() {
    const url = this.narrativeURL();
    if (!url) {
      return;
    }
    return (
      <OverlayTrigger overlay={<Tooltip>Open this Narrative</Tooltip>}>
        <Button variant="outline-secondary" href={url.toString()} target="_blank" size="sm" className="border-0">
          <FontAwesomeIcon icon={faExternalLink} />
        </Button>
      </OverlayTrigger>
    );
  }

  renderx() {
    const { actor } = this.props.notification;
    // const variant: Variant = ((): Variant => {
    //     switch (level) {
    //         case 'request': return 'warning';
    //         default: return 'danger';
    //     }
    // })();
    const actorDisplay = (() => {
      switch (actor.type) {
        case 'user': {
          if (actor.id === this.props.currentUserId) {
            return 'You';
          } else {
            return (
              <UILink type="kbaseui" path={`people/${actor.id}`} newWindow={true}>
                {actor.name}
              </UILink>
            );
          }
        }
        default:
          <span>{actor.name}</span>;
      }
    })();

    const verbDisplay = (() => {
      const { actor, verb, target, object } = this.props.notification;
      const username = this.props.currentUserId;
      switch (this.props.notification.verb) {
        case 'requested':
          // We support "join" requests, in which a user joins a group, and
          // "add request", in which a user requests to add some resource
          // (narrative, app) to the group.
          if (target[0].type === 'user' && target[0].id === actor.id) {
            return <span>as requested to join</span>;
          } else {
            return (
              <span>
                has requested to add <Entity username={username} entity={target[0]} /> to{' '}
                <Entity username={this.props.currentUserId} entity={object} />
              </span>
            );
          }
        case 'invited':
          return (
            <span>
              has invited you to join <Entity username={username} entity={object} />
            </span>
          );
        case 'accepted':
          if (target && target.length) {
            const targetEntities = target.map((aTarget, index) => {
              return (
                <span key={index}>
                  <Entity username={username} entity={aTarget} />
                  {index < target.length ? <span>, </span> : undefined}
                </span>
              );
            });
            return (
              <span>
                {targetEntities} {target.length > 1 ? 'have' : 'has'} been added to{' '}
                <Entity username={username} entity={object} />
              </span>
            );
          } else {
            return (
              <span>
                accepted the invitation from <Entity username={username} entity={object} />
              </span>
            );
          }
        default:
          return (
            <span>
              {verb} <Entity username={username} entity={object} />
            </span>
          );
      }
      return verb;
    })();

    const what = (() => {
      return <Entity username={this.props.currentUserId} entity={this.props.notification.object} />;
    })();

    // const objectDisplay = (() => {
    //     switch (object.type) {
    //         case 'narrative': {
    //             return <span><UILink path={{type: 'europaui', path: `narrative/${object.id}}`}} newWindow={true}>
    //                 Narrative {object.name ? object.name : object.id}
    //             </UILink> {object.name ? '' : '(name not accessible)'}</span>
    //         }
    //         default:
    //             return <span>{object.name}</span>
    //     }
    // })();

    return (
      <span>
        {actorDisplay} {verbDisplay} {what}
        {/* {actorName}  <b>{verbName}</b> <i>{what}</i> <b>{objectName}</b> */}
      </span>
    );
  }

  render() {
    const { actor, verb, target, object } = this.props.notification;
    // const notification = this.props.notification;
    // const isGlobal = this.props.notification.id === 'global'
    // const { id, actor, verb, target, object, level, seen } = notification;
    const username = this.props.currentUserId;
    // const variant: StrictVariant = ((): StrictVariant => {
    //     switch (level) {
    //         case 'request': return 'warning';
    //         default: return 'danger';
    //     }
    // })();
    const message = (() => {
      switch (verb) {
        case 'requested':
          if (target.length && target.length === 1) {
            if (target[0].type === 'user' && target[0].id === actor.id) {
              return (
                <span>
                  <Entity username={username} entity={actor} /> has requested to join{' '}
                  <Entity username={username} entity={object} />
                </span>
              );
            } else {
              return (
                <span>
                  <Entity username={username} entity={actor} /> has requested to add{' '}
                  <Entity username={username} entity={target[0]} /> to{' '}
                  <Entity username={this.props.currentUserId} entity={object} />
                </span>
              );
            }
          } else {
            return (
              <span>
                <Entity username={username} entity={actor} /> has requested to join{' '}
                <Entity username={username} entity={object} />
              </span>
            );
          }
        case 'invited':
          return (
            <span>
              <Entity username={username} entity={actor} /> has invited you to join{' '}
              <Entity username={username} entity={object} />
            </span>
          );
        case 'accepted':
          if (target && target.length) {
            const targetEntities = target.map((aTarget, index) => {
              return (
                <span key={index}>
                  <Entity username={username} entity={aTarget} />
                  {index < target.length ? <span>, </span> : undefined}
                </span>
              );
            });
            return (
              <span>
                {targetEntities} {target.length > 1 ? 'have' : 'has'} been added to{' '}
                <Entity username={username} entity={object} />
              </span>
            );
          } else {
            return (
              <span>
                <Entity username={username} entity={actor} /> accepted the invitation from{' '}
                <Entity username={username} entity={object} />
              </span>
            );
          }
        default:
          return (
            <span>
              <Entity username={username} entity={actor} /> {verb} <Entity username={username} entity={object} />
            </span>
          );
      }
    })();
    return <span>{message}</span>;
  }
}
