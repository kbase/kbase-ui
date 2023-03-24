import { Component, PropsWithChildren } from 'react';

export type Variant = 'primary' | 'secondary' | 'info' | 'warning' | 'danger' | 'success' | 'light';

export interface TagProps extends PropsWithChildren {
    // TODO: variant should be shared, this is stolen from
    // Well.
    variant: Variant;
    fill?: boolean;
    border?: boolean;
}

export class Tag extends Component<TagProps> {
    getFillVariantClass(variant: Variant): Array<string> {
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
    getBorderVariantClass(variant: Variant): Array<string> {
        switch (variant) {
            case 'primary':
                return ['border', 'border-primary', 'border-2'];
            case 'secondary':
                return ['border', 'border-secondary', 'border-2'];
            case 'info':
                return ['border', 'border-info', 'border-2'];
            case 'warning':
                return ['border', 'border-warning', 'border-2'];
            case 'danger':
                return ['border', 'border-danger', 'border-2'];
            case 'success':
                return ['border', 'border-success', 'border-2'];
            case 'light':
                return ['border', 'border-light', 'border-2'];
        }
    }
    render() {
        const variantClass: Array<string> = [];
        if (this.props.border) {
            variantClass.push(...this.getBorderVariantClass(this.props.variant));
            if (this.props.fill) {
                variantClass.push(...this.getFillVariantClass('light'));
            }
        } else {
            if (this.props.fill) {
                variantClass.push(...this.getFillVariantClass(this.props.variant));
            }
        }
        return (
            <div
                style={{
                    flex: '0 0 auto',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    // border: '1px solid silver',
                    // backgroundColor: 'rgba(200, 200, 200, 0.5)',
                    borderRadius: '0.25em',
                    padding: '0.25em 1.5em 0.25em 0.5em',
                    margin: '0.25em',
                    position: 'relative',
                }}
                className={variantClass.join(' ')}
            >
                {this.props.children}
            </div>
        );
    }
}
