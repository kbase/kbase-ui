import { Component } from 'react';
import iconsData from './typeIcons.json';

export interface IconConfig {
    methods: {
        method: string,
        app: string
    },
    data: Record<string, string>,
    colors: Array<string>;
    color_mapping: Record<string, string>
}

export const iconConfig = iconsData as unknown as IconConfig;

export interface TypeIconProps {
    size: 'small' | 'medium' | 'large';
    typeName: string;
}

interface ObjectTypeConfig {
    classNames: Array<string>
    color: string;
    type: string;
}

export default class TypeIcon extends Component<TypeIconProps> {
       objectTypesConfig: Record<string, ObjectTypeConfig>;
        constructor(props: TypeIconProps) {
            super(props);
            this.objectTypesConfig = this.fixIconConfig();
        }

        fixIconConfig() {
            const objectTypes = new Set(Object.keys(iconConfig.data).concat(Object.keys(iconConfig.color_mapping)));
            objectTypes.delete('DEFAULT');

            // const objectTypesConfig: Record<string, ObjectTypeConfig>

            return Array.from(objectTypes.keys()).reduce<Record<string, ObjectTypeConfig>>((objectTypesConfig, typeName) => {
                const classNames = (() => {
                    if (typeName in iconConfig.data) {
                       return iconConfig.data[typeName][0].split(/\s+/);
                    } else {
                        return iconConfig.data.DEFAULT[0].split(/\s+/);
                    }
                })();

                const color = (() => {
                    if (typeName in iconConfig.color_mapping) {
                        return iconConfig.color_mapping[typeName];
                    } else {
                        console.warn('Type without color assigned, defaulting', typeName);
                        return this.getColor(typeName)
                    }
                })();

                // TODO: the type config should specify this.
                const type = (() => {
                    if (classNames.some((className) => { return className.includes("fa-"); })) {
                        return 'fontAwesome';
                    } else {
                        return 'kbase';
                    }
                })();
               
               
                objectTypesConfig[typeName] = {
                    classNames, color, type
                };
                return objectTypesConfig;
            }, {});
        }

        getDefaultIcon(typeName: string) {
            return {
                type: 'fontAwesome',
                classNames: ['fa-file-o'],
                color: this.getColor(typeName)
            };
        }

        getIcon() {
            const iconConfig = this.objectTypesConfig[this.props.typeName];
            if (!iconConfig) {
                console.warn(`No icon defined for type ${this.props.typeName}, defaulting`);
                return this.getDefaultIcon(this.props.typeName);
            }
            const classNames = iconConfig.classNames.slice();
            switch (iconConfig.type) {
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
                type: iconConfig.type,
                color: iconConfig.color,
                html: `<span class="${classNames.join(' ')}"></span>`
            };
        }

        getColor(typeName: string) {
            let code = 0;
            const colors = iconConfig.colors;

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
                       style={{color: icon.color}}></i>
                    <i className={`fa fa-inverse fa-stack-1x ${icon.classNames.join(' ')}`}></i>
                </span>
            </div>
        }
    }

