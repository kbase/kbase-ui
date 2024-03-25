import { waitFor } from '@testing-library/react';
import SendChannel, { ChannelMessage } from './SendChannel';
import { UI_ORIGIN, WAIT_FOR_TIMEOUT } from './testUtils';

import { MockInstance, beforeEach, describe, expect, test, vi } from 'vitest';

describe('SendChannel', () => {
  let errorLogSpy: MockInstance;
  beforeEach(() => {
    vi.resetAllMocks();
    errorLogSpy = vi.spyOn(console, 'error');
  });
  test('can be created', () => {
    const channel = 'abc123';
    const targetOrigin = UI_ORIGIN;
    const sendChannel = new SendChannel({ window, channel, targetOrigin });
    expect(sendChannel).toBeTruthy();
  });

  test('can send basic message', () => {
    const channel = 'abc123';
    const targetOrigin = UI_ORIGIN;
    const sendChannel = new SendChannel({ window, channel, targetOrigin });
    expect(sendChannel).toBeTruthy();

    // We'll set up a listener on this window.
    let receivedMessage: unknown = null;
    let monitorValue: unknown = null;
    window.addEventListener('message', (ev) => {
      monitorValue = 'bar';
      receivedMessage = ev.data;
    });

    const message = sendChannel.send('foo', 'bar');

    waitFor(() => {
      expect(receivedMessage).toEqual({
        name: 'foo',
        envelop: { channel, id: message.envelope.id },
        payload: 'bar',
      });
      expect(receivedMessage).toEqual(message);
      expect(monitorValue).toEqual('bar');
    });
  });

  test('can spy on message send', async () => {
    const channel = 'abc123';
    const messageName = 'foo';
    const expectedPayload = 'baz';

    let spied: unknown = null;
    const spy = (message: ChannelMessage) => {
      spied = message.payload;
    };
    const targetOrigin = UI_ORIGIN;

    const sendChannel = new SendChannel({ window, channel, targetOrigin, spy });

    sendChannel.send(messageName, expectedPayload);

    await waitFor(
      () => {
        expect(spied).toEqual(expectedPayload);
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );
  });

  test('emits an error message to the console if a spy throws', async () => {
    const channel = 'abc123';
    const messageName = 'foo';
    const expectedPayload = 'baz';

    const spy = (_message: ChannelMessage) => {
      throw new Error('Oops, I did it again');
    };
    const targetOrigin = UI_ORIGIN;

    const sendChannel = new SendChannel({ window, channel, targetOrigin, spy });

    sendChannel.send(messageName, expectedPayload);

    await waitFor(
      () => {
        // expect(errorLogSpy).toHaveBeenCalledWith(
        //   'Error in error handler',
        //   'Oops, I did it again',
        //   expect.any(Error)
        // );
        expect(errorLogSpy).toHaveBeenCalledWith('Error running spy', 'Oops, I did it again', expect.any(Error));
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );
  });

  test('emits an error message to the console if a spy throws a non-Error object', async () => {
    const channel = 'abc123';
    const messageName = 'foo';
    const expectedPayload = 'baz';
    const errorMessage = 'A string is not an Error!';

    const spy = (_message: ChannelMessage) => {
      // eslint-disable-next-line no-throw-literal
      throw errorMessage;
    };
    const targetOrigin = UI_ORIGIN;

    const sendChannel = new SendChannel({ window, channel, targetOrigin, spy });

    sendChannel.send(messageName, expectedPayload);

    await waitFor(
      () => {
        expect(errorLogSpy).toHaveBeenCalledWith('Error running spy', 'Unknown error', expect.any(String));
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );
  });
});
