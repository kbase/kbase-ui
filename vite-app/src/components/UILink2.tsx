import { navigationPathToURL } from 'contexts/RouterContext';
import { NavigationType } from 'lib/navigation';
import { CSSProperties, Component, PropsWithChildren } from 'react';

export interface UILinkProps extends PropsWithChildren {
  path: string;
  type: NavigationType;
  params?: Record<string, string>;
  newWindow?: boolean;
  label?: string;
  linkIsLabel?: boolean;
  title?: string;
  className?: string;
  style?: CSSProperties;
}
/**
 * Creates a link to another ui endpoint.
 *
 * Supports several use cases:
 *
 * - internal kbase-ui navigation - i.e. within kbase-ui in the same window - simply create a
 *   link on the current window changing only the hash; secondarily if there are params
 *   form them as a search component but with '$' as a prefix rather than '?'. Note that
 *   the origin must be consistent with kbase-ui, not europa.
 *
 * - external kbase-ui navigation - i.e. within kbase ui but opening a separate window;
 *   must use the europa origin, not kbase-ui, and may use either the hash form or the
 *   path + search form, with 'legacy/' prefixing the path
 *
 * - europa navigation
 *
 */
export default class UILink extends Component<UILinkProps> {
  renderLabel(url: URL) {
    if (this.props.linkIsLabel) {
      return url.toString();
    }
    if (this.props.label) {
      return this.props.label;
    }
    return this.props.children;
  }
  render() {
    const {} = this.props.path;
    const url = navigationPathToURL(
      { path: this.props.path, params: this.props.params, type: this.props.type },
      !!this.props.newWindow,
    );

    const target = (() => {
      if (this.props.type === 'kbaseui') {
        if (this.props.newWindow) {
          return '_blank';
        }
        return '_self';
      }
      if (this.props.newWindow) {
        return '_blank';
      }
      return '_top';
    })();

    return (
      <a
        href={url.toString()}
        title={this.props.title}
        target={target}
        className={this.props.className}
        style={this.props.style}
      >
        {this.renderLabel(url)}
      </a>
    );
  }
}
