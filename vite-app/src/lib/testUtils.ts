// Some commonly used test values
export const WAIT_FOR_TIMEOUT = 1000;
export const WAIT_FOR_INTERVAL = 100;
export const CHANNEL_ID = 'my_channel_id';
export const UI_ORIGIN = 'http://localhost';

/**
 * Send a window message in the format supported by SendMessage and ReceiveMessage.
 *
 * Useful for sending messages in the format supported by SendMessage and ReceiveMessage.
 *
 * Note that we cannot use postMessage, as jsDOM has bugs with postMessage support.
 * Important for these tests is that the origin is missing.
 * See: https://github.com/jsdom/jsdom/issues/2745
 *
 * @param name The message name
 * @param channel The channel id
 * @param payload The payload, arbitrary
 * @param origin The origin for the recipient window; optional, defaulting to current
 * window origin.
 */
export function genericPostMessage(name: string, channel: string, payload: unknown, origin?: string) {
  const data = { name, envelope: { channel }, payload };
  const targetOrigin = origin || window.location.origin;
  // Cannot use the following, due to jsDOM:
  window.dispatchEvent(new MessageEvent('message', { source: window, origin: targetOrigin, data }));
}

/**
 * Sends a window message with arbitrary payload (data).
 *
 * Useful for modeling the sending of invalid messages.
 *
 * @param data The message payload, arbitrary
 * @param origin The origin for the recipient window; optional, no default is provided,
 * so it should adopt the DOM default, which is '/' which indicates same-origin.
 */
export function genericRawPostMessage(data: unknown, origin?: string) {
  window.dispatchEvent(new MessageEvent('message', { source: window, origin, data }));
}

export function sleepFor(duration: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve();
    }, duration);
  });
}
