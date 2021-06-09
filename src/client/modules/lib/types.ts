import { ReactiveDB } from "./kb_lib/ReactiveDB";

export interface SimpleMap<T> { [key: string]: T; }

export type Receiver = (payload: any) => void;

type UIService = any;

export interface PluginServiceDefinition {
}

// A plugin's configuration
export interface PluginConfig {
    package: {
        name: string;
        type?: 'iframe' | 'legacy',
    };
    services?: {
        menu: PluginServiceDefinition,
        route: PluginServiceDefinition;
    };
    install?: {
        menu: PluginServiceDefinition,
        route: PluginServiceDefinition;
    };
}

// The ui's definition of a plugin, found in the ui source
// in config/plugins.yml
export interface PluginDefinition {

}


// This is the configuration built (during the build) for loading
// It can be found in modules/config/plugins.json after a build.
export interface PluginLoadConfig {
    name: string;
    globalName: string;
    version: string;
    source: {
        github: {
            account: string;
        };
    };
    disabled?: boolean;
    directory: string;
}

export interface ServiceConfig {

}

export type PluginType = 'applet' | 'plugin';

export abstract class Service<T extends ServiceConfig> {
    abstract pluginHandler(serviceConfig: T, type: PluginType, name: string): void;
    // abstract pluginHandler(serviceConfig: T, pluginDef: PluginDefinition, pluginConfig: PluginConfig): void;
}

export interface Runtime {
    receive: (channel: string, messageId: string, handler: Receiver) => void;
    send: (channel: string, messageId: string, payload: any) => void;
    drop: (receiver: Receiver) => void;
    service: (name: string) => UIService;
    config: <T>(key: string, defaultValue?: T) => any;
    db: () => ReactiveDB;
    hasService: (serviceName: string) => boolean;
    // TODO: how to preserve typing for a generic getService call?
    getService: (serviceName: string) => Service<any>;
}

export type AMDRequire = (modules: Array<string>, success: (...result: any) => void, error?: (result: any) => void) => void;
export declare var require: AMDRequire;