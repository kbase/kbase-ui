export interface SimpleMap<T> { [key: string]: T; }



interface UIServiceParams {
    config: any,
    params: any;
}


export type Receiver = (payload: any) => void;

type UIService = any;

export interface Runtime {
    receive: (channel: string, messageId: string, handler: Receiver) => void;
    send: (channel: string, messageId: string, payload: any) => void;
    drop: (receiver: Receiver) => void;
    service: (name: string) => UIService;
}