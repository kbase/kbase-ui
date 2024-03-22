import { v4 as uuidv4 } from 'uuid';


type Payload = any;

type EnvelopeType = 'plain' | 'request' | 'reply';

interface EnvelopeBase {
    type: EnvelopeType;
    from: string;
    to: string;
    id: string;
    created: number;
}

interface PlainEnvelope extends EnvelopeBase {
    type: 'plain';
}

interface RequestEnvelope extends EnvelopeBase {
    type: 'request';
}

interface ReplyEnvelope extends EnvelopeBase {
    type: 'reply';
    inReplyTo: string;
    status: 'ok' | 'error';
}

type Envelope = PlainEnvelope | RequestEnvelope | ReplyEnvelope;

class ChannelMessage {
    name: string;
    payload: any;
    id: string;
    created: Date;
    envelope: Envelope;

    constructor({
        name,
        payload,
        envelope,
    }: {
        name: string;
        payload: any;
        envelope: Envelope;
    }) {
        this.name = name;
        this.payload = payload;
        this.id = uuidv4();
        this.created = new Date();
        this.envelope = envelope;
    }

    toJSON() {
        return {
            envelope: this.envelope,
            name: this.name,
            payload: this.payload,
        };
    }
}


// export interface WindowChannelInitParams {
//     window?: Window;
//     host?: string;
//     id?: string;
//     to?: string;
// }



export interface WindowChannelParams {
    window: Window;
    targetOrigin: string;
    id: string;
    to: string;
}

interface Stats {
    sent: number;
    received: number;
    ignored: number;
}


export class SendChannel {
    private readonly window: Window;
    private readonly targetOrigin: string;
    private readonly id: string;
    private partnerId: string;
    private readonly stats: Stats;

    constructor({ window, targetOrigin, id, to }: WindowChannelParams) {
        // The given window upon which we will listen for messages.
        this.window = window;

        // The host for the window; required for postmessage
        this.targetOrigin = targetOrigin;

        // The channel id. Used to filter all messages received to
        // this channel.
        this.id = id;

        this.partnerId = to;

        this.stats = {
            sent: 0,
            received: 0,
            ignored: 0,
        };
    }

    getId(): string {
        return this.id;
    }

    getPartnerId(): string {
        return this.partnerId;
    }

    getStats(): Stats {
        return this.stats;
    }

    sendMessage(message: ChannelMessage) {
        this.stats.sent += 1;
        this.window.postMessage(message.toJSON(), this.targetOrigin);
    }

    send(name: string, payload: Payload) {
        const envelope: PlainEnvelope = {
            type: 'plain',
            from: this.id,
            to: this.partnerId,
            created: Date.now(),
            id: uuidv4(),
        };
        const message = new ChannelMessage({ name, payload, envelope });
        this.sendMessage(message);
    }

    setPartner(id: string) {
        this.partnerId = id;
    }
}
