import iconData from './icons.json';
import GenericClient from '@kbase/ui-lib/lib/lib/comm/JSONRPC11/GenericClient';

export interface IconInfo {
    icon?: string;
    color: string;
    url?: string;
    isImage: boolean;
}

interface LoadedIconData {
    defaults: { [key: string]: string };
    data: { [key: string]: string };
    colors: Array<string>;
    color_mapping: { [key: string]: string };
}

export enum AppTag {
    release = 'release',
    beta = 'beta',
    dev = 'dev',
}

interface AppIconCache {
    release: { [key: string]: IconInfo };
    beta: { [key: string]: IconInfo };
    dev: { [key: string]: IconInfo };
}
const ICON_DATA: LoadedIconData = iconData;

export default class IconProvider {
    private typeIconInfos: { [key: string]: IconInfo };
    private defaultApp: IconInfo;
    private defaultType: IconInfo;
    private appIconCache: AppIconCache;
    private nmsURL: string;
    private nmsImageURL: string;
    private token: string;
    constructor({
        nmsURL,
        nmsImageURL,
        token,
    }: {
        nmsURL: string;
        nmsImageURL: string;
        token: string;
    }) {
        this.nmsURL = nmsURL;
        this.nmsImageURL = nmsImageURL;
        this.token = token;
        // fetch all icon info for types.
        // set up clients to get icons from NMS/Catalog
        this.typeIconInfos = {};
        this.appIconCache = {
            release: {},
            beta: {},
            dev: {},
        };
        this.defaultApp = {
            icon: ICON_DATA.defaults.app,
            color: '#683AB7',
            isImage: false,
        };
        this.defaultType = {
            icon: ICON_DATA.defaults.type,
            color: ICON_DATA.colors[0],
            isImage: false,
        };
        this.processLoadedTypes();
    }

    private processLoadedTypes() {
        Object.keys(ICON_DATA.data).forEach((t) => {
            this.typeIconInfos[t.toLowerCase()] = {
                isImage: false,
                color: ICON_DATA.color_mapping[t],
                icon: ICON_DATA.data[t],
            };
        });
    }

    async appIcon(appId: string, appTag: AppTag): Promise<IconInfo> {
        if (!(appTag in this.appIconCache)) {
            return this.defaultApp;
        }
        if (!this.appIconCache[appTag][appId]) {
            const client = new GenericClient({
                module: 'NarrativeMethodStore',
                url: this.nmsURL,
                token: this.token,
                timeout: 1000,
            });
            try {
                const [result] = await client.callFunc(
                    'get_method_brief_info',
                    [{ ids: [appId], tag: appTag }]
                );

                const icon = result[0].icon.url;
                if (!icon) {
                    this.appIconCache[appTag][appId] = this.defaultApp;
                } else {
                    this.appIconCache[appTag][appId] = {
                        isImage: true,
                        url: `${this.nmsImageURL}/${icon}`,
                        color: 'silver',
                    };
                }
            } catch {
                this.appIconCache[appTag][appId] = this.defaultApp;
            }
        }
        return this.appIconCache[appTag][appId];
    }

    // public static get Instance() {
    //   return this._instance || (this._instance = new this());
    // }

    public typeColor(typeName: string): string {
        let code = 0;
        for (let i = 0; i < typeName.length; i += 1) {
            code += typeName.charCodeAt(i);
        }
        return iconData.colors[code % iconData.colors.length];
    }

    public typeIcon(objectType: string): IconInfo {
        // TODO: this really isn't valid. An object type should always be present,
        // anything else is nonsensical.
        if (!objectType) {
            console.warn(
                `[typeIcon] Using default type icon for object type "${objectType}"`
            );
            return this.defaultType;
        }
        // TODO: use a regex
        if (objectType.includes('.')) {
            objectType = objectType.split('.')[1];
        }
        if (objectType.includes('-')) {
            objectType = objectType.split('-')[0];
        }
        const lcObjType = objectType.toLowerCase();
        return this.typeIconInfos[lcObjType]
            ? this.typeIconInfos[lcObjType]
            : this.defaultType;
    }
}
