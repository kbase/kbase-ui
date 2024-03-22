export interface SimpleMap<T> {
    [key: string]: T;
}

export type Receiver = (payload: any) => void;

export type ServiceConfig = Record<string, unknown>;

export type PluginType = 'applet' | 'plugin';

export abstract class Service<T extends ServiceConfig> {
    abstract pluginHandler(
        serviceConfig: T,
        type: PluginType,
        name: string
    ): void;
    // abstract pluginHandler(serviceConfig: T, pluginDef: PluginDefinition, pluginConfig: PluginConfig): void;
}

export type AMDRequire = (
    modules: Array<string>,
    success: (...result: any) => void,
    error?: (result: any) => void
) => void;
