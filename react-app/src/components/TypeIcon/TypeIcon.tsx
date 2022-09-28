import { Component } from 'react';
import iconConfigRaw from './icons.json';

export interface TypeIconConfig {
    typeName: string;
    classNames: Array<string>;
    iconType: 'kbase' | 'fontAwesome';
    color: string;
}

export interface IconConfig {
    typeIcons: Array<TypeIconConfig>;
    colors: Array<string>;
}

const ICON_CONFIG: IconConfig = iconConfigRaw as unknown as IconConfig;

const ICON_CONFIG_MAP: Map<string, TypeIconConfig> = ICON_CONFIG.typeIcons.reduce((iconConfigMap, iconConfig) => {
    iconConfigMap.set(iconConfig.typeName, iconConfig);
    return iconConfigMap;
}, new Map<string, TypeIconConfig>())

export interface TypeIconProps {
    typeName: string;
    size?: string
}

interface TypeIconState { }

export default class TypeIcon extends Component<TypeIconProps, TypeIconState> {
    // constructor(props: TypeIconProps) {
    //     super(props);
    // }

    getDefaultIcon(typeName: string) {
        return {
            type: 'fontAwesome',
            classNames: ['fa-file-o'],
            color: this.getColor(typeName)
        };
    }

    getIcon() {
        const iconConfig = ICON_CONFIG_MAP.get(this.props.typeName);
        if (!iconConfig) {
            console.warn(`No icon defined for type ${this.props.typeName}, defaulting`);
            return this.getDefaultIcon(this.props.typeName);
        }
        const classNames = iconConfig.classNames.slice();
        switch (iconConfig.iconType) {
            case 'kbase':
                classNames.push('icon');
                if (this.props.size) {
                    switch (this.props.size) {
                        case 'small':
                            classNames.push('icon-sm');
                            break;
                        case 'medium':
                            classNames.push('icon-md');
                            break;
                        case 'large':
                            classNames.push('icon-lg');
                            break;
                    }
                }
                break;
            case 'fontAwesome':
                classNames.push('fa');
                break;
        }

        return {
            classNames,
            iconType: iconConfig.iconType,
            color: iconConfig.color
        };
    }

    getColor(typeName: string) {
        let code = 0;
        const colors = ICON_CONFIG.colors;

        for (let i = 0; i < typeName.length; i += 1) {
            code += typeName.charCodeAt(i);
        }
        return colors[code % colors.length];
    }

    render() {
        const icon = this.getIcon();
        return <div>
            <span className="fa-stack fa-2x">
                <i className="fa fa-circle fa-stack-2x"
                    style={{ color: icon.color }}></i>
                <i className={`fa fa-inverse fa-stack-1x ${icon.classNames.join(' ')}`}></i>
            </span>
        </div>;
    }
}
