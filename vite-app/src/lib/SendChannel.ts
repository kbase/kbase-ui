import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a random or pseudo-random string identifier.
 *
 * @returns {string}
 */
function uniqueId() {
  return uuidv4();
}

export interface MessageEnvelope {
  /** The id of the channel for which this message is intended. */
  channel: string;

  /** The id of the message itself */
  id: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MessagePayload {}

export interface ChannelMessageConstructorParams {
  name: string;
  payload: MessagePayload;
  envelope: MessageEnvelope;
}

/**
 * Represents a message in a channel.
 *
 */
export class ChannelMessage {
  /**
   *
   * @param {ChannelMessageConstructorParams} param0 The constructor parameters in
   * object clothing
   */
  name: string;
  payload: MessagePayload;
  envelope: MessageEnvelope;
  constructor({ name, payload, envelope }: ChannelMessageConstructorParams) {
    this.name = name;
    this.payload = payload;
    this.envelope = envelope;
  }

  toJSON() {
    const { envelope, name, payload } = this;
    return { envelope, name, payload };
  }
}

/**
 * The parameter structure for SendChannel's constructor.
 *
 * Follows the named-prameters pattern.
 */
export interface SendChannelConstructorParams {
  /** The window to which to send messages */
  window: Window;

  /** The URL origin of the window to which we are sending messages */
  targetOrigin: string;

  /** The id assigned to this channel */
  channel: string;

  /** Spy on sent messages; useful for debugging */
  spy?: (message: ChannelMessage) => void;
}

/**
 * Supports targeted window message sending.
 *
 */
export default class SendChannel {
  /** The window to which to send messages */
  window: Window;

  /** The URL origin of the window to which we are sending messages */
  targetOrigin: string;

  /** The id assigned to this channel */
  channel: string;

  /** Spy on sent messages; useful for debugging */
  spy?: (message: ChannelMessage) => void;

  constructor({ window, targetOrigin, channel, spy }: SendChannelConstructorParams) {
    this.window = window;
    this.targetOrigin = targetOrigin;
    this.channel = channel;
    this.spy = spy;
  }

  /**
   * Sends a message to the configured window.
   *
   * @param {string} name
   * @param {MessagePayload} payload
   */
  send(name: string, payload: MessagePayload): ChannelMessage {
    const envelope: MessageEnvelope = {
      channel: this.channel,
      id: uniqueId(),
    };
    const message = new ChannelMessage({ name, payload, envelope });
    this.window.postMessage(message.toJSON(), this.targetOrigin);

    if (this.spy) {
      try {
        this.spy(message);
      } catch (ex) {
        const errorMessage = ex instanceof Error ? ex.message : 'Unknown error';
        // eslint-disable-next-line no-console
        console.error('Error running spy', errorMessage, ex);
      }
    }

    return message;
  }
}
