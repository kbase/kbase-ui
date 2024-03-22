import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faEye, faEyeSlash, faRefresh, faSpinner, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Empty from 'components/Empty';
import UILink from 'components/UILink2';
import { FeedNotification } from 'lib/clients/Feeds';
import { Component, ReactNode } from 'react';
import { Alert, Badge, Button, OverlayTrigger, Table, ToggleButton, ToggleButtonGroup, Tooltip } from 'react-bootstrap';
import { MegaphoneFill, PersonFill } from 'react-bootstrap-icons';
import { FeedItem, UnseenNotificationCount } from '../api/Feeds';
import GroupsNotification from '../notifications/GroupsNotification';
import NarrativeNotification from '../notifications/NarrativeNotification';
import NoNotification from '../notifications/NoNotifications';
import Notification, { TimeAgo } from '../notifications/Notification';
import Entity from './Entity';
import { FeedWithId, FeedsFilter, NotificationsFilter } from './controller';
import styles from './view.module.css';

export interface FeedsViewProps {
  currentUserId: string;
  isAdmin: boolean;
  global?: FeedWithId;
  user?: FeedWithId;
  feeds: Array<FeedWithId>;
  notifications: Array<FeedNotification>;
  unseen: UnseenNotificationCount;
  totalUnseenCount: number;
  selectedFeed?: FeedWithId;
  feedsFilter: FeedsFilter;
  feedsLayout: FeedsLayout;
  notificationsFilter: NotificationsFilter;
  selectFeed: (feed: FeedWithId) => void;
  filterFeeds: (filter: FeedsFilter) => void;
  changeLayout: (layout: FeedsLayout) => void;
  filterNotifications: (filter: NotificationsFilter) => void;
  toggleSeen: (notification: FeedNotification) => void;
  refresh: () => void;
  isReloading: boolean;
}

export type Variant = 'danger' | 'warning' | 'info';

export type FeedsLayout = 'source' | 'notification';

export interface EntityIconProps {
  type: string;
}

// const DEFAULT_ICON = 'cog';

export default class FeedsView extends Component<FeedsViewProps> {
  renderGroupsNotification(notification: FeedItem, isGlobal: boolean) {
    const { id, actor, verb, target, object, level, seen } = notification;
    const username = this.props.currentUserId;
    const variant: Variant = ((): Variant => {
      switch (level) {
        case 'request':
          return 'warning';
        default:
          return 'danger';
      }
    })();
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
                <span>
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

    const controls = (() => {
      const iconClassSuffix = seen ? 'eye-slash' : 'eye';
      const seenLabel = seen ? 'unseen' : 'seen';

      const seenButton = (() => {
        if (isGlobal) {
          return;
        }
        return (
          <span className="feed-seen">
            <span
              className={`fa fa-${iconClassSuffix}`}
              data-toggle="tooltip"
              data-placement="left"
              title={`Mark ${seenLabel}`}
              style={{ cursor: 'pointer' }}
            />
          </span>
        );
      })();

      // TODO: see feedTabs.js in the original (lines 86 and 114) - the expire
      // note btn is never set, but there is code to set it to pop up a
      // confirmation dialog, with a warning, and then do it, but only for the
      // global feed and for an admin.
      // But, like I said, the button code is not actually initialized to the
      // button kjparameter passed in here.. and we'd do it in a different way anyay.
      const expireButton = (
        <span className="feed-expire">
          <span
            className="fa fa-times"
            data-toggle="tooltip"
            data-placement="left"
            title="Expire this notification"
            style={{ cursor: 'pointer' }}
          />
        </span>
      );

      return (
        <span>
          {seenButton} {expireButton}
        </span>
      );
    })();

    return (
      <Alert key={id} variant={variant}>
        {controls} {message}
      </Alert>
    );
  }

  renderNarrativeNotification(notification: FeedItem) {
    const { id, actor, verb, object, context, level } = notification;
    const variant: Variant = ((): Variant => {
      switch (level) {
        case 'request':
          return 'warning';
        default:
          return 'danger';
      }
    })();
    const actorName = (() => {
      switch (actor.type) {
        case 'user': {
          if (actor.id === this.props.currentUserId) {
            return 'You';
          } else {
            return (
              <UILink path={`people/${actor.id}`} type="kbaseui" newWindow={true}>
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
              return 'read only access to';
            case 'w':
              return 'read/write access to';
            case 'a':
              return 'admin access to";';
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
              <UILink path={`narrative/${object.id}`} type="europaui" newWindow={true}>
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
      <Alert key={id} variant={variant}>
        {actorName} <b>{verbName}</b> <i>{what}</i> <b>{objectName}</b>
      </Alert>
    );
  }

  renderFeedNotification(notification: FeedNotification) {
    const { source, id } = notification;
    switch (source) {
      case 'groupsservice':
        // return this.renderGroupsNotification(notification, isGlobal);
        return (
          <Notification
            key={id}
            currentUserId={this.props.currentUserId}
            notification={notification}
            toggleSeen={this.props.toggleSeen}
          >
            <GroupsNotification currentUserId={this.props.currentUserId} notification={notification} />
          </Notification>
        );
      case 'narrativeservice':
        return (
          <Notification
            key={id}
            currentUserId={this.props.currentUserId}
            notification={notification}
            toggleSeen={this.props.toggleSeen}
          >
            <NarrativeNotification currentUserId={this.props.currentUserId} notification={notification} />
          </Notification>
        );
    }
  }

  renderFeed(feed?: FeedWithId) {
    if (!feed) {
      return <NoNotification>There is no feed available to display.</NoNotification>;
    }
    if (feed.feed.feed.length === 0) {
      return (
        <NoNotification>
          There are no notifications in <b>{this.renderFeedName(feed)}</b>!
        </NoNotification>
      );
    }
    return feed.feed.feed
      .filter((notification) => {
        switch (this.props.feedsFilter) {
          case 'all':
            return true;
          case 'unseen':
            if (notification.seen) {
              return false;
            }
            return true;
        }
      })
      .map((notification) => {
        return this.renderFeedNotification(notification);
      });
  }

  renderFeeds() {
    return this.props.feeds.map((feedWithId) => {
      return (
        <div key={feedWithId.id}>
          <h3>{feedWithId.feed.name}</h3>
          <div>{this.renderFeed(feedWithId)}</div>
        </div>
      );
    });
  }

  renderFeedName({ id, feed }: FeedWithId) {
    switch (id) {
      case 'global':
        return 'KBase Announcements';
      case 'user':
        return 'Your Notifications';
      default:
        return feed.name;
    }
  }

  renderFeedsNavigatorItem(feed: FeedWithId, icon?: ReactNode) {
    const isSelected = feed.id === (this.props.selectedFeed && this.props.selectedFeed.id);
    const itemClasses = [styles.FeedsNavigatorItem];
    if (isSelected) {
      itemClasses.push(styles.FeedsNavigatorItemSelected);
    }
    const name = this.renderFeedName(feed);
    const unseen = (() => {
      if (feed.feed.unseen === 0) {
        return;
      }
      return <Badge bg="danger">{feed.feed.unseen}</Badge>;
    })();
    const seen = (() => {
      const seen = feed.feed.feed.length - feed.feed.unseen;
      if (!seen) {
        return;
      }
      return <Badge bg="secondary">{seen}</Badge>;
    })();
    const iconWrapped = icon ? <span style={{ marginRight: '0.5rem' }}>{icon}</span> : null;
    return (
      <div
        className={itemClasses.join(' ')}
        key={feed.id}
        onClick={() => {
          this.props.selectFeed(feed);
        }}
      >
        <div
          className={
            styles.FeedsNavigatorTitleCol + (feed.feed.unseen > 0 ? ` ${styles.FeedsNavigatorFeedHasUnseen}` : '')
          }
        >
          <div style={{ fontSize: '120%' }}>
            {iconWrapped}
            {name}
          </div>
          {/* <div style={{fontStyle: 'italic', color: 'rgb(100, 100, 100'}}>{feedId}</div> */}
        </div>
        <div className={styles.FeedsNavigatorTotalCol}>{seen}</div>
        <div className={styles.FeedsNavigatorNewCol}>{unseen}</div>
      </div>
    );
  }

  renderFeedsNavigator() {
    if (!this.props.global && !this.props.user && this.props.feeds.length === 0) {
      return (
        <div className={styles.FeedsNavigator}>
          <Empty message={`Sorry, no available ${this.props.feedsFilter} feeds`} style={{ marginTop: '1rem' }} />
        </div>
      );
    }
    return (
      <div className={styles.FeedsNavigator}>
        {this.props.global ? this.renderFeedsNavigatorItem(this.props.global, <MegaphoneFill />) : undefined}
        {this.props.user ? this.renderFeedsNavigatorItem(this.props.user, <PersonFill />) : undefined}
        {this.props.feeds.map((feed) => {
          return this.renderFeedsNavigatorItem(feed);
        })}
      </div>
    );
  }

  renderNotifications2() {
    // if (!this.props.global && !this.props.user && this.props.feeds.length === 0)
    // {
    if (this.props.notifications.length === 0) {
      return (
        <div className={styles.FeedsNavigator}>
          <Empty
            message={`Sorry, no available ${this.props.feedsFilter === 'all' ? '' : this.props.feedsFilter} notifications`}
            style={{ marginTop: '1rem' }}
          />
        </div>
      );
    }
    return this.props.notifications.map((notification) => {
      return (
        <div style={{ display: 'flex', flexDirection: 'row' }} key={notification.id}>
          {/* <div style={{flex: '0 0 5rem'}}>
                    {notification.source}, {notification.created}, {notification.id}
                </div> */}
          <div style={{ flex: '1 1 0', marginBottom: '1rem' }}>{this.renderFeedNotification(notification)}</div>
        </div>
      );
    });
  }

  renderNotifications() {
    if (!this.props.global && !this.props.user && this.props.feeds.length === 0) {
      return (
        <div className={styles.FeedsNavigator}>
          <Empty
            message={`Sorry, no available ${this.props.feedsFilter} notifications`}
            style={{ marginTop: '1rem' }}
          />
        </div>
      );
    }
    // return <div className={styles.FeedsNavigator}>
    //     {this.props.global ? this.renderFeedsNavigatorItem(this.props.global, <MegaphoneFill />) : undefined}
    //     {this.props.user ? this.renderFeedsNavigatorItem(this.props.user, <PersonFill />) : undefined }
    //     {
    //         this.props.feeds.map((feed) => {
    //             return this.renderFeedsNavigatorItem(feed);
    //         })
    //     }
    // </div>
    // const icon = ((notification: FeedNotification) => {
    //     switch (notification.source) {
    //         case 'narrativeservice':

    //         case 'groupservice':
    //     }
    // })();
    // return this.props.notifications.map((notification) => {
    //     return <div style={{display: 'flex', flexDirection: 'row'}} key={notification.id}>
    //         <div style={{flex: '0 0 5rem'}}>
    //             {notification.source}, {notification.created}, {notification.id}
    //         </div>
    //         <div style={{flex: '1 1 0'}}>
    //             {this.renderFeedNotification(notification)}
    //         </div>
    //     </div>
    // });

    const renderSeenToggle = (notification: FeedNotification) => {
      const icon = notification.seen ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />;
      const tooltip = notification.seen ? 'mark unseen' : 'mark seen';
      return (
        <OverlayTrigger overlay={<Tooltip>{tooltip}</Tooltip>}>
          <Button
            onClick={() => this.props.toggleSeen(notification)}
            size="sm"
            // bootstrap buttons don't have
            className="border-0"
            // style={{border: 'none'}}
            variant="outline-secondary"
          >
            {icon}
          </Button>
        </OverlayTrigger>
      );
    };

    const renderSourceIcon = (source: string) => {
      switch (source) {
        case 'narrativeservice':
          return <FontAwesomeIcon icon={faFile} />;
        case 'groupsservice':
          return <FontAwesomeIcon icon={faUserGroup} />;
        default:
          return source;
      }
    };

    const renderSourceLabel = (source: string) => {
      switch (source) {
        case 'narrativeservice':
          return 'Narrative';
        case 'groupsservice':
          return 'Organization';
        default:
          return source;
      }
    };

    const rows = this.props.notifications.map((notification) => {
      const { source, actor, object, target, created, seen } = notification;
      const rowClasses: Array<string> = [];
      if (!seen) {
        rowClasses.push('table-success');
      }
      return (
        <tr className={rowClasses.join(' ')}>
          <td>{renderSeenToggle(notification)}</td>
          <td>
            <span style={{ whiteSpace: 'nowrap' }}>
              {renderSourceIcon(source)} {renderSourceLabel(source)}
            </span>
          </td>
          <td>{object.name}</td>
          <td>{actor.id === this.props.currentUserId ? 'You' : actor.name}</td>
          <td>
            {target
              .map<string>((t) => {
                return t.name;
              })
              .join(', ')}
          </td>
          <td>
            <span style={{ whiteSpace: 'nowrap' }}>
              <TimeAgo time={created} />
            </span>
          </td>
          <td>
            <span style={{ whiteSpace: 'nowrap' }}>
              {Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(created))}
            </span>
            {/* { new Date(created).toISOString()} */}
          </td>
          <td></td>
        </tr>
      );
    });

    return (
      <Table>
        <thead>
          <tr>
            <th>Seen?</th>
            <th>Source</th>
            <th>Object</th>
            <th>Actor</th>
            <th>Target</th>
            <th colSpan={2}>Created</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    );
  }

  // renderFeedsTabs() {
  //     return <Nav defaultActiveKey={this.props.selectedFeed.id} className="flex-column" variant="pills">
  //         <Nav.Item>
  //             <Nav.Link eventKey="global" onClick={() => { this.props.selectFeed('global', this.props.global) }}>
  //                 KBase
  //             </Nav.Link>
  //         </Nav.Item>
  //         {
  //             this.props.feeds.map(([feedId, feed]) => {
  //                 const unseen = feed.unseen > 0 ? ` (${feed.unseen})` : '';
  //                 return <Nav.Item key={feedId}>
  //                     <Nav.Link eventKey={feedId} onClick={() => { this.props.selectFeed(feedId, feed) }}>
  //                         <span className={feed.unseen > 0 ? styles.unseen : ''}>{feed.name}{unseen} ({feedId})</span>
  //                     </Nav.Link>
  //                 </Nav.Item>
  //             })
  //         }
  //     </Nav>
  // }

  doRefresh() {
    this.props.refresh();
  }

  renderNavControls() {
    return (
      <>
        <span style={{ fontWeight: 'bold', color: 'rgb(150, 150, 150)', marginRight: '0.25rem' }}>show</span>
        <ToggleButtonGroup
          name="filter-feeds"
          type="radio"
          size="sm"
          value={this.props.feedsFilter}
          onChange={this.props.filterFeeds}
        >
          <ToggleButton id="feeds-filter-all" value="all">
            All
          </ToggleButton>
          <ToggleButton id="feeds-filter-unseen" value="unseen">
            Only Unseen {this.props.totalUnseenCount ? `(${this.props.totalUnseenCount})` : ''}
          </ToggleButton>
        </ToggleButtonGroup>
        <Button size="sm" className="ms-1" variant="outline-secondary" onClick={this.doRefresh.bind(this)}>
          <FontAwesomeIcon icon={this.props.isReloading ? faSpinner : faRefresh} />
        </Button>
      </>
    );
  }

  renderViewControls() {
    return (
      <>
        <span style={{ fontWeight: 'bold', color: 'rgb(150, 150, 150)', marginRight: '0.25rem' }}>view</span>
        <ToggleButtonGroup
          name="feeds-layout"
          type="radio"
          size="sm"
          value={this.props.feedsLayout}
          onChange={this.props.changeLayout}
        >
          <ToggleButton id="feeds-layout-source" value="source">
            by source
          </ToggleButton>
          <ToggleButton id="feeds-layout-notification" value="notification">
            by notification
          </ToggleButton>
        </ToggleButtonGroup>
      </>
    );
  }

  renderBySource() {
    return (
      <>
        <div className={styles.Header}>
          <div className={styles.NavCol}>
            <div className={styles.HeaderLabel}>Feeds</div>
          </div>
          <div className={styles.ContentCol}>
            <div className={styles.HeaderRow}>
              <div className={styles.HeaderLabel}>Notifications</div>
            </div>
          </div>
        </div>
        <div className={styles.Body}>
          <div className={styles.NavCol} style={{ overflowY: 'auto', backgroundColor: 'rgba(200, 200, 200, 0.5)' }}>
            {this.renderFeedsNavigator()}
          </div>
          <div className={styles.ContentCol} style={{ overflowY: 'auto' }}>
            {this.renderFeed(this.props.selectedFeed)}
          </div>
        </div>
      </>
    );
  }

  renderByNotification() {
    return (
      <>
        <div className={styles.Header}>
          <div className={styles.Col}>
            <div className={styles.HeaderLabel}>Notifications</div>
          </div>
        </div>
        <div className={styles.Body}>
          <div className={styles.Col} style={{ overflowY: 'auto' }}>
            {this.renderNotifications2()}
          </div>
          {/* <div className={styles.ContentCol} style={{overflowY: 'auto'}}>
                    {this.renderFeed(this.props.selectedFeed)}
                </div> */}
        </div>
      </>
    );
  }

  renderLayout() {
    switch (this.props.feedsLayout) {
      case 'source':
        return this.renderBySource();
      case 'notification':
        return this.renderByNotification();
    }
  }

  render() {
    return (
      <div className={styles.Main}>
        <div className={styles.Header}>
          <div className={styles.Col}>
            {this.renderNavControls()}
            <span style={{ marginLeft: '1rem' }}>{this.renderViewControls()}</span>
          </div>
        </div>
        {this.renderLayout()}
      </div>
    );
  }
}
