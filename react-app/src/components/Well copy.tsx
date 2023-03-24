import React, { Component, PropsWithChildren } from 'react';
import styles from './Well.module.css';

export type Variant = 'primary' | 'secondary' | 'info' | 'warning' | 'danger' | 'success';

// export type WellProps = PropsWithChildren<{
//     style?: React.CSSProperties
// }>

// HEADER

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
    }
}

function getVariantClasses(variant: Variant): Array<string> {
    const baseClasses = ['border', 'border-4'];
    switch (variant) {
        case 'primary':
            return [...baseClasses, 'border-primary'];
        case 'secondary':
            return [...baseClasses, 'border-secondary'];
        case 'info':
            return [...baseClasses, 'border-info'];
        case 'warning':
            return [...baseClasses, 'border- warning'];
        case 'danger':
            return [...baseClasses, 'border-danger'];
        case 'success':
            return [...baseClasses, 'border-success'];
    }
}

function getFooterVariantClasses(variant: Variant): Array<string> {
    const baseClasses = ['border-top', 'border-1'];
    switch (variant) {
        case 'primary':
            return [...baseClasses, 'border-primary'];
        case 'secondary':
            return [...baseClasses, 'border-secondary'];
        case 'info':
            return [...baseClasses, 'border-info'];
        case 'warning':
            return [...baseClasses, 'border- warning'];
        case 'danger':
            return [...baseClasses, 'border-danger'];
        case 'success':
            return [...baseClasses, 'border-success'];
    }
}

export interface HeaderProps {
    style?: React.CSSProperties;
}

export class Header extends Component<PropsWithChildren<HeaderProps>> {
    render() {
        return this.props.children;
    }
}

export interface InternalHeaderProps {
    style?: React.CSSProperties;
    variant: Variant;
}

export class InternalHeader extends Component<PropsWithChildren<InternalHeaderProps>> {
    render() {
        const classes = getHeaderVariantClasses(this.props.variant);
        classes.push(styles.header);

        return (
            <div className={classes.join(' ')} style={this.props.style}>
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
    variant: Variant;
}

export class InternalBody extends Component<PropsWithChildren<InternalBodyProps>> {
    render() {
        return (
            <div className={styles.body} style={this.props.style}>
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
    variant: Variant;
}

export class InternalFooter extends Component<PropsWithChildren<InternalFooterProps>> {
    render() {
        const classes = getFooterVariantClasses(this.props.variant);
        classes.push(styles.footer);
        return (
            <div className={classes.join(' ')} style={this.props.style}>
                {this.props.children}
            </div>
        );
    }
}
// Main Component

export type WellProps = {
    style?: React.CSSProperties;
    children?: React.ReactNode | Array<React.ReactNode>;
    variant: Variant;
    className?: string;
};

interface WellState {}

export default class Well extends Component<WellProps, WellState> {
    static Header = Header;
    static Body = Body;
    static Footer = Footer;

    renderHeader() {
        const { children } = this.props;

        const headerComponent = React.Children.toArray(children).filter((child) => {
            if (typeof child === 'object') {
                return child.constructor === Header;
            }
            return false;
        })[0];

        if (!headerComponent) {
            return headerComponent;
        }

        const hc = headerComponent as unknown as Header;

        return (
            <InternalHeader style={hc.props.style} variant={this.props.variant}>
                {hc.props.children}
            </InternalHeader>
        );
    }

    renderBody() {
        const { children } = this.props;

        const component = React.Children.toArray(children).filter((child) => {
            if (typeof child === 'object') {
                console.log('ok', child.constructor);
                return child.constructor === Body;
            }
            return false;
        })[0];

        if (!component) {
            return component;
        }

        const hc = component as unknown as Header;

        return (
            <InternalBody style={hc.props.style} variant={this.props.variant}>
                {hc.props.children}
            </InternalBody>
        );
    }

    renderFooter() {
        const { children } = this.props;

        const component = React.Children.toArray(children).filter((child) => {
            if (typeof child === 'object') {
                return child.constructor === Footer;
            }
            return false;
        })[0];

        if (!component) {
            return component;
        }

        const hc = component as unknown as Footer;

        return (
            <InternalFooter style={hc.props.style} variant={this.props.variant}>
                {hc.props.children}
            </InternalFooter>
        );
    }

    // renderChildren() {
    //     if (typeof this.props.children === 'undefined') {
    //         return;
    //     }
    //     return Children.map(this.props.children, (child) => {
    //         if (React.isValidElement(child)) {
    //             const props: WellProps = { variant: this.props.variant };
    //             if ('children' in child.props) {
    //                 props.children = child.props.children;
    //             } else {
    //                 delete props.children;
    //             }
    //             return React.cloneElement(child, props);
    //         }
    //         return child;
    //     });
    // }

    render() {
        return (
            <div
                className={[styles.well, ...getVariantClasses(this.props.variant)].join(' ')}
                style={this.props.style}
            >
                {this.renderHeader()}
                {this.renderBody()}
                {this.renderFooter()}
            </div>
        );
    }
}
