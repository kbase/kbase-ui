import { faExternalLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UILink from 'components/UILink2';
import { navigationPathToURL } from 'contexts/RouterContext';
import { FeedNotification } from 'lib/clients/Feeds';
import { Component } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

export interface NarrativeNotificationProps {
  currentUserId: string;
  notification: FeedNotification;
}

export default class NarrativeNotification extends Component<NarrativeNotificationProps> {
  narrativeURL() {
    switch (this.props.notification.verb) {
      case 'requested':
      case 'invited':
        return navigationPathToURL({ type: 'europaui', path: `narrative/${this.props.notification.object.id}` }, true);
      // return <UILink newWindow={true}
      //     path={{type: 'europaui', path: `narrative/${this.props.notification.object.id}`}}
      // >
      //     {this.props.notification.object.name}
      // </UILink>;
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

  render() {
    const { actor, verb, object, context } = this.props.notification;
    // const variant: Variant = ((): Variant => {
    //     switch (level) {
    //         case 'request': return 'warning';
    //         default: return 'danger';
    //     }
    // })();
    const actorName = (() => {
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

    const verbName = (() => {
      return verb;
    })();

    const what = (() => {
      switch (object.type) {
        case 'narrative':
          if (context === null) {
            return '???';
          }
          switch (context['level']) {
            case 'r':
              return 'view only access to';
            case 'w':
              return 'edit and save access to';
            case 'a':
              return 'edit, save, and share access to";';
            default:
              return '(unknown context)';
          }
        default:
          return '(not handled)';
      }
    })();

    const objectName = (() => {
      switch (object.type) {
        case 'narrative': {
          return (
            <span>
              <UILink type="europaui" path={`narrative/${object.id}`} newWindow={true}>
                Narrative {object.name ? object.name : object.id}
              </UILink>{' '}
              {object.name ? '' : '(name not accessible)'}
            </span>
          );
        }
        default:
          return <span>{object.name}</span>;
      }
    })();

    return (
      <span>
        {actorName} <b>{verbName}</b> <i>{what}</i> <b>{objectName}</b>
      </span>
    );
  }

  // render() {
  //     return <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
  //         <div style={{flex: '0 0 auto'}}>
  //             {this.renderLinkButton()}
  //         </div>
  //         <div style={{flex: '1 1 0'}}>
  //             {this.renderMessage()}
  //         </div>

  //     </div>;
  // }
}
