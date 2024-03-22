// import { navigationPathToURL } from "contexts/RouterContext";
import { navigationPathToURL } from "contexts/RouterContext";
import { NavigationPath } from "lib/navigation";
import { Component, PropsWithChildren } from "react";
import { Button } from "react-bootstrap";
import { Variant } from "react-bootstrap/esm/types";

export interface UILinkButtonProps extends PropsWithChildren {
    origin?: string;
    newWindow?: boolean;
    label?: string;
    urlIsLabel?: boolean;
    title?: string;
    // className?: string;
    variant: Variant;
    path: NavigationPath;
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
export default class UILinkButton extends Component<UILinkButtonProps> {
    renderLabel(url: URL) {
        if (this.props.urlIsLabel) {
            return url.toString();
        }
        if (this.props.label) {
            return this.props.label;
        }
        return this.props.children;
    }
    render() {
        const url = navigationPathToURL(this.props.path, !!this.props.newWindow)
        
        const target = (() => {
            if (this.props.path.type === 'kbaseui') {
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

        return <Button 
            href={url.toString()} 
            title={this.props.title}
            target={target}
            variant={this.props.variant}
        >
            {this.renderLabel(url)}
        </Button>
    }
}
