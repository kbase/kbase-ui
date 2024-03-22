// import { navigationPathToURL } from "contexts/RouterContext";
import { Button } from "antd";
import { ButtonType } from "antd/es/button";
import { navigationPathToURL } from "contexts/RouterContext";
import { NavigationPath } from "lib/navigation";
import { Component, PropsWithChildren, ReactNode } from "react";

export interface UILinkAntdButtonProps extends PropsWithChildren {
    origin?: string;
    newWindow?: boolean;
    label?: string;
    urlIsLabel?: boolean;
    title?: string;
    icon?: ReactNode;
    // className?: string;
    type: ButtonType;
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
export default class UILinkAntdButton extends Component<UILinkAntdButtonProps> {
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
            icon={this.props.icon}
            size='small'
            // Propagate props and don't send "type" prop because wrapping in an antd Tooltip
            // requires that Tooltip provide params to the supported antd element
            // (Button in this case.))
            // type={this.props.type}
            {...this.props}
        >
            {this.renderLabel(url)}
        </Button>
    }
}
