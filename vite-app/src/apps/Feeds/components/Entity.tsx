import UILink from 'components/UILink2';
import { Component } from 'react';
import { FeedEntity } from '../api/Feeds';

export type Variant = 'danger' | 'warning' | 'info';

export interface EntityIconProps {
  type: string;
}

const DEFAULT_ICON = 'cog';

const ENTITY_ICONS: Record<string, string> = {
  user: 'user',
  narrative: 'file-o',
  workspace: 'file-o',
  job: 'suitcase',
  group: 'users',
};

export class EntityIcon extends Component<EntityIconProps> {
  render() {
    const iconClassFragment = ENTITY_ICONS[this.props.type] || DEFAULT_ICON;
    return <span className={`fa fa-${iconClassFragment}`} />;
  }
}

export interface EntityProps {
  username: string;
  entity: FeedEntity;
}

export default class Entity extends Component<EntityProps> {
  renderNarrativeLink(id: string, name: string) {
    name = name || id;
    return (
      <UILink path={`narrative/${id}`} type="europaui" newWindow={false}>
        {name}
      </UILink>
    );
  }

  renderWorkspaceLink(id: string, name: string) {
    name = name || id;
    return (
      <UILink path={`narrative/${id}`} type="europaui" newWindow={false}>
        {name}
      </UILink>
    );
  }

  renderGroupLink(id: string, name: string) {
    name = name || id;
    return (
      <UILink path={`orgs/${id}`} type="kbaseui" newWindow={false}>
        {name || '(name not accessible)'}
      </UILink>
    );
  }

  renderUserLink(userId: string, name: string) {
    let label = name ? name : userId;
    if (userId === this.props.username) {
      label += ' (you)';
    }
    return (
      <UILink path={`people/${userId}`} type="kbaseui" newWindow={false}>
        {label}
      </UILink>
    );
  }

  renderEntityLink(type: string, id: string, name: string) {
    switch (type) {
      case 'user':
        return this.renderUserLink(id, name);
      case 'group':
        return this.renderGroupLink(id, name);
      case 'workspace':
        return this.renderWorkspaceLink(id, name);
      case 'narrative':
        return this.renderNarrativeLink(id, name);
      default:
        return name === null ? id : `${name} (${id})`;
    }
  }

  render() {
    const { type, id, name } = this.props.entity;
    return (
      <span className="feed-entity">
        <EntityIcon type={type} /> {this.renderEntityLink(type, id, name)}
      </span>
    );
  }
}
