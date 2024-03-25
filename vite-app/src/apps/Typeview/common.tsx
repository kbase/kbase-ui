import { JSONObject } from "lib/json";

export function renderTimestamp(time: Date) {
    if (!time) {
        return 'n/a';
    }
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
        hour12: true
    };
    const timestamp = Intl.DateTimeFormat('en-US', options).format(time);
    return <span className="Timestamp">{timestamp}</span>
}
export interface TypeInfo extends JSONObject {
    id: string;
    module: string;
    name: string;
    version: string;
}

export function parseTypeId(typeId: string): TypeInfo {
    const match = /^([^.]+)\.([^-]+)-([^.]+)\.(.*)$/.exec(
        typeId
    );
    if (match === null) {
        throw Error('invalid type id');
    }
    const [, module, name, major, minor] = match;
    return {id: typeId, module, name, version: `${major}.${minor}`};
}

export interface ModuleIdentifier {
    id: string;
    name: string;
    version?: number;
}

export function parseModuleId(moduleId: string): ModuleIdentifier {
    const [name, versionString] = moduleId.split('-');
    const version = typeof versionString !== 'string' ? parseInt(versionString, 10) : undefined;

    return {id: moduleId, name, version};
}