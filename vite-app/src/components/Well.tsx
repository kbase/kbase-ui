/**
 * Well is a re-implementation of the classic Well bootstrap component, with some
 * extensions, I believe.
 * 
 * It is essentially a container for bounded content, with an optional title. 
 * It is rendered inside of a rounded-corner container, the title is displayed in a
 * header area with reversed colors.
 * 
 * It utilizes bootstrap classes, where possible, and emulates the bootstrap Variant
 * type, which, as far as I can tell at least at some point in recent history, is not
 * exported as such, although specific instances of a Variant type are.
 */
import React, { Component, CSSProperties, PropsWithChildren } from 'react';
import styles from './Well.module.scss';

export type Variant = 'primary' | 'secondary' | 'info' | 'warning' | 'danger' | 'success' | 'light';

// HEADER

export type BorderThickness = '1' | '2' | '3' | '4' | '5';

function getHeaderVariantClasses(variant: Variant): Array<string> {
    switch (variant) {
        case 'primary':
            return ['bg-primary', 'text-white'];
        case 'secondary':
            return ['bg-secondary', 'text-white'];
        case 'info':
            return ['bg-info', 'text-black'];
        case 'warning':
            return ['bg-warning', 'text-black'];
        case 'danger':
            return ['bg-danger', 'text-white'];
        case 'success':
            return ['bg-success', 'text-white'];
        case 'light':
            return ['bg-light', 'text-black'];
    }
}

function getVariantClasses(variant: Variant, border: BorderThickness = '4'): Array<string> {
    const baseClasses = ['border', `border-${border}`];
    switch (variant) {
        case 'primary':
            return [...baseClasses, 'border-primary'];
        case 'secondary':
            return [...baseClasses, 'border-secondary'];
        case 'info':
            return [...baseClasses, 'border-info'];
        case 'warning':
            return [...baseClasses, 'border-warning'];
        case 'danger':
            return [...baseClasses, 'border-danger'];
        case 'success':
            return [...baseClasses, 'border-success'];
        case 'light':
            return [...baseClasses, 'border-light'];
    }
}

function getFooterVariantClasses(variant: Variant, orientation: Orientation): Array<string> {
    const baseClasses = [`border-${orientation === 'vertical' ? 'top' : 'start'}`, 'border-1'];
    switch (variant) {
        case 'primary':
            return [...baseClasses, 'border-primary'];
        case 'secondary':
            return [...baseClasses, 'border-secondary'];
        case 'info':
            return [...baseClasses, 'border-info'];
        case 'warning':
            return [...baseClasses, 'border-warning'];
        case 'danger':
            return [...baseClasses, 'border-danger'];
        case 'success':
            return [...baseClasses, 'border-success'];
        case 'light':
            return [...baseClasses, 'border-light'];
    }
}

export interface HeaderProps {
    style?: React.CSSProperties;
    className?: string;
    icon?: string | JSX.Element;
}

export class Header extends Component<PropsWithChildren<HeaderProps>> {
    render() {
        return this.props.children;
    }
}

export interface InternalHeaderProps {
    style?: React.CSSProperties;
    variant: Variant;
    className?: string;
}

export class InternalHeader extends Component<PropsWithChildren<InternalHeaderProps>> {
    render() {
        const classes = getHeaderVariantClasses(this.props.variant);
        classes.push(styles.header);
        if (this.props.className) {
            classes.push(this.props.className);
        }

        return (
            <div className={classes.join(' ')} style={this.props.style} role="heading">
                {this.props.children}
            </div>
        );
    }
}

// BODY

export interface BodyProps {
    style?: React.CSSProperties;
}

export class Body extends Component<PropsWithChildren<BodyProps>> {
    render() {
        return this.props.children;
    }
}

export interface InternalBodyProps {
    style?: React.CSSProperties;
    className?: string;
    variant: Variant;
}

export class InternalBody extends Component<PropsWithChildren<InternalBodyProps>> {
    render() {
        const className = [styles.body, this.props.className].join(' ');
        return (
            <div className={className} style={this.props.style} role="region">
                {this.props.children}
            </div>
        );
    }
}

// FOOTER

export interface FooterProps {
    style?: React.CSSProperties;
}

export class Footer extends Component<PropsWithChildren<FooterProps>> {
    render() {
        return this.props.children;
    }
}

export interface InternalFooterProps {
    style?: React.CSSProperties;
    orientation?: Orientation;
    variant: Variant;
}

export class InternalFooter extends Component<PropsWithChildren<InternalFooterProps>> {
    render() {
        const classes = getFooterVariantClasses(this.props.variant, this.props.orientation || 'vertical');
        classes.push(styles[`footer-${this.props.orientation || 'vertical'}`]);
        return (
            <div className={classes.join(' ')} style={this.props.style}>
                {this.props.children}
            </div>
        );
    }
}

// Main Component

export type Orientation = 'vertical' | 'horizontal';

export type WellProps = {
    style?: React.CSSProperties;
    children?: React.ReactNode | Array<React.ReactNode>;
    variant: Variant;
    className?: string;
    border?: BorderThickness;
    padding?: string;
    orientation?: Orientation;
    disabled?: boolean;
    // implementing...
    stretch?: boolean;
    // not yet implemented
    autoScroll?: boolean;
};

interface WellState { }

export default class Well extends Component<WellProps, WellState> {
    static Header = Header;
    static Body = Body;
    static Footer = Footer;

    renderHeader(style: CSSProperties) {
        const { children } = this.props;

        const headerComponent = React.Children.toArray(children).filter((child) => {
            if (typeof child === 'object') {
                // This is a bit yucky, is for TS.
                if ('type' in child) {
                    return child.type === React.createElement(Header).type;
                }
            }
            return false;
        })[0];

        if (!headerComponent) {
            return headerComponent;
        }

        const hc = headerComponent as unknown as Header;

        const icon = (() => {
            if (hc.props.icon) {
                if (typeof hc.props.icon === 'string') {
                    return <span className={`fa fa-lg fa-${hc.props.icon}`} style={{ verticalAlign: '0', lineHeight: 'normal', marginRight: '0.25rem' }} />
                } else {
                    return hc.props.icon;
                }
            }
        })();

        return (
            <InternalHeader style={{ ...style, ...hc.props.style }} className={hc.props.className} variant={this.props.variant}>
                {icon}{hc.props.children}
            </InternalHeader>
        );
    }

    renderBody(style: CSSProperties) {
        const { children } = this.props;

        const component = React.Children.toArray(children).filter((child) => {
            if (typeof child === 'object') {
                // This is a bit yucky, is for TS.
                if ('type' in child) {
                    return child.type === React.createElement(Body).type;
                }
            }
            return false;
        })[0];

        if (!component) {
            return component;
        }

        // TODO: improve this to use the stretch class
        const classNames: Array<string> = [];
        if (this.props.stretch) {
            classNames.push(styles.stretch);
        }

        const hc = component as unknown as Body;

        return (
            <InternalBody style={{ ...style, ...hc.props.style }} variant={this.props.variant} className={classNames.join(' ')}>
                {hc.props.children}
            </InternalBody>
        );
    }

    renderFooter(style: CSSProperties) {
        const { children } = this.props;

        const component = React.Children.toArray(children).filter((child) => {
            if (typeof child === 'object') {
                // This is a bit yucky, is for TS.
                if ('type' in child) {
                    return child.type === React.createElement(Footer).type;
                }
            }
            return false;
        })[0];

        if (!component) {
            return component;
        }

        const hc = component as unknown as Footer;

        return (
            <InternalFooter
                style={{ ...style, ...hc.props.style }}
                orientation={this.props.orientation}
                variant={this.props.variant}>
                {hc.props.children}
            </InternalFooter>
        );
    }

    renderDisabledOverlay() {
        if (!this.props.disabled) {
            return;
        }

        return <div className={styles.DisabledOverlay} />;
    }

    render() {
        const style: CSSProperties = {
            padding: this.props.padding || '1em',
        };
        const classNames = [
            styles[`well-${this.props.orientation || 'vertical'}`],
            ...getVariantClasses(this.props.variant, this.props.border),
            
            this.props.className || ''
        ];
        if (this.props.className) {
            classNames.push(this.props.className);
        }
        if (this.props.stretch) {
            classNames.push(styles.stretch);
        }
        return (
            <div
                className={classNames.join(' ')}
                style={this.props.style}
                role="article"
            >
                {this.renderDisabledOverlay()}
                {this.renderHeader(style)}
                {this.renderBody(style)}
                {this.renderFooter(style)}
            </div>
        );
    }
}
