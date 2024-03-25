import { waitFor } from '@testing-library/react';
import { MockInstance, beforeEach, describe, expect, test, vi } from 'vitest';
import ReceiveChannel from './ReceiveChannel';
import { ChannelMessage } from './SendChannel';
import { genericPostMessage, genericRawPostMessage } from './testUtils';

const WAIT_FOR_TIMEOUT = 1000;

class ErrorOne extends Error {}

class ErrorTwo extends Error {}

describe('ReceiveChannel', () => {
  let errorLogSpy: MockInstance;
  let warnLogSpy: MockInstance;
  beforeEach(() => {
    vi.resetAllMocks();
    errorLogSpy = vi.spyOn(console, 'error');
    warnLogSpy = vi.spyOn(console, 'warn');
  });

  test('can be created', () => {
    const channel = 'abc123';
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
    });
    expect(receiveChannel).toBeTruthy();
  });

  /**
   * The Hello World of these tests.
   * Just tests that a very simple message, just a string, will be received.
   */
  test('can receive a simple message', async () => {
    const channel = 'abc123';
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
    });

    expect(receiveChannel).toBeTruthy();

    const messageName = 'foo';

    // We simply capture the payload for inspection further down.
    let actualPayload: unknown = null;
    receiveChannel.on(messageName, (payload: unknown) => {
      actualPayload = payload;
    });
    receiveChannel.start();

    const expectedPayload = 'baz';
    genericPostMessage(messageName, channel, expectedPayload);

    await waitFor(
      () => {
        expect(actualPayload).toEqual(expectedPayload);
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    receiveChannel.stop();
  });

  test('a warning is issued of the channel is stopped without starting first', async () => {
    const channel = 'abc123';
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
    });
    receiveChannel.stop();
    await waitFor(
      () => {
        expect(warnLogSpy).toHaveBeenCalledWith('"stop" method called without then channel having been started');
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );
  });

  test('a warning if send a message with no receivers', async () => {
    const channel = 'abc123';
    const messageName = 'foo';
    const expectedPayload = 'baz';

    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
    });

    receiveChannel.start();

    genericPostMessage(messageName, channel, expectedPayload);

    await waitFor(
      () => {
        expect(warnLogSpy).toHaveBeenCalledWith('No listeners for message', messageName);
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    receiveChannel.stop();
  });

  test('can receive multiple messages of the same type', async () => {
    const channel = 'abc123';
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
    });

    const listeners: Array<{
      id: number;
      messageName: string;
      result: { payload: unknown };
    }> = [
      {
        id: 1,
        messageName: 'foo',
        result: {
          payload: null,
        },
      },
      {
        id: 2,
        messageName: 'foo',
        result: {
          payload: null,
        },
      },
    ];

    for (const { messageName, result } of listeners) {
      receiveChannel.on(messageName, (payload: unknown) => {
        result.payload = payload;
      });
    }

    // We simply capture the payload for inspection further down.
    // let actualPayload: unknown = null;

    receiveChannel.start();

    genericPostMessage('foo', channel, 'bar');

    await waitFor(
      () => {
        for (const { result } of listeners) {
          expect(result.payload).toEqual('bar');
        }
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    genericPostMessage('foo', channel, 'baz');

    await waitFor(
      () => {
        for (const { result } of listeners) {
          expect(result.payload).toEqual('baz');
        }
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    receiveChannel.stop();
  });

  test('can receive multiple messages of the same type with order preserved', async () => {
    const channel = 'abc123';
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
    });

    const listeners: Array<{
      messageName: string;
    }> = [
      {
        messageName: 'foo',
      },
      {
        messageName: 'foo',
      },
      {
        messageName: 'foo',
      },
    ];

    const results: Array<unknown> = [];

    for (const { messageName } of listeners) {
      receiveChannel.on(messageName, (payload: unknown) => {
        results.push(payload);
      });
    }

    // We simply capture the payload for inspection further down.
    // let actualPayload: unknown = null;

    receiveChannel.start();

    const payloads = ['bar', 'baz', 'fuzz', 'buzz'];

    const expectedResults = new Array<string>(listeners.length * payloads.length);
    payloads.forEach((payload, index) => {
      const from = index * listeners.length;
      const to = from + listeners.length + 1;
      expectedResults.fill(payload, from, to);
    });

    for (const payload of payloads) {
      genericPostMessage('foo', channel, payload);
    }

    await waitFor(
      () => {
        expect(results).toEqual(expectedResults);
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    receiveChannel.stop();
  });

  test('can receive multiple messages of various types', async () => {
    const channel = 'abc123';
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
    });
    const testData: Array<{
      messageName: string;
      payload: unknown;
      result: { payload: unknown };
    }> = [
      {
        messageName: 'foo',
        payload: 'bar',
        result: {
          payload: null,
        },
      },
      {
        messageName: 'ping',
        payload: 'pong',
        result: {
          payload: null,
        },
      },
    ];

    for (const { messageName, result } of testData) {
      receiveChannel.on(messageName, (payload: unknown) => {
        result.payload = payload;
      });
    }

    // We simply capture the payload for inspection further down.
    // let actualPayload: unknown = null;

    receiveChannel.start();

    for (const { messageName, payload } of testData) {
      genericPostMessage(messageName, channel, payload);
    }

    await waitFor(
      () => {
        for (const { payload, result } of testData) {
          expect(payload).toEqual(result.payload);
        }
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    receiveChannel.stop();
  });

  test('can spy on message receipt', async () => {
    const channel = 'abc123';
    const messageName = 'foo';
    const expectedPayload = 'baz';

    let spied: unknown = null;
    const spy = (message: ChannelMessage) => {
      spied = message.payload;
    };
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
      spy,
    });

    // We simply capture the payload for inspection further down.
    let actualPayload: unknown = null;
    receiveChannel.on(messageName, (payload: unknown) => {
      actualPayload = payload;
    });
    receiveChannel.start();

    genericPostMessage(messageName, channel, expectedPayload);

    await waitFor(
      () => {
        expect(actualPayload).toEqual(expectedPayload);
        expect(spied).toEqual(expectedPayload);
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    receiveChannel.stop();
  });

  test('a spy which throws will generate a console error and not interrupt message', async () => {
    const channel = 'abc123';
    const messageName = 'foo';
    const expectedPayload = 'baz';

    const spyError = new Error('To spy or not, that is the question');
    const spy = () => {
      throw spyError;
    };
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
      spy,
    });

    // We simply capture the payload for inspection further down.
    let actualPayload: unknown = null;
    receiveChannel.on(messageName, (payload: unknown) => {
      actualPayload = payload;
    });
    receiveChannel.start();

    genericPostMessage(messageName, channel, expectedPayload);

    await waitFor(
      () => {
        expect(actualPayload).toEqual(expectedPayload);
        expect(errorLogSpy).toHaveBeenCalledWith(
          'Error running spy',
          'To spy or not, that is the question',
          expect.any(Error),
        );
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    receiveChannel.stop();
  });

  test('a spy which throws a non-Error object will generate a console error and not interrupt message', async () => {
    const channel = 'abc123';
    const messageName = 'foo';
    const expectedPayload = 'baz';

    const spyError = 'To spy or not, that is the question';
    const spy = () => {
      throw spyError;
    };
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
      spy,
    });

    // We simply capture the payload for inspection further down.
    let actualPayload: unknown = null;
    receiveChannel.on(messageName, (payload: unknown) => {
      actualPayload = payload;
    });
    receiveChannel.start();

    genericPostMessage(messageName, channel, expectedPayload);

    await waitFor(
      () => {
        expect(actualPayload).toEqual(expectedPayload);
        expect(errorLogSpy).toHaveBeenCalledWith('Error running spy', 'Unknown error', expect.any(String));
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    receiveChannel.stop();
  });

  /**
   * Tests that if an event handler function throws an error, that the provided error
   * handler will be called.
   */
  test('should have the error handler called in case of an error', async () => {
    const channel = 'abc123';
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
    });
    const messageName = 'foo';
    const expectedError = new Error('baz');

    // We simply capture the payload for inspection further down.
    let errorValue: unknown = null;
    receiveChannel.on(
      messageName,
      // the receive listener throws an error intentionally.
      (_: unknown) => {
        throw expectedError;
      },
      // note the error listener below.
      (error: unknown) => {
        errorValue = error;
      },
    );
    receiveChannel.start();

    // Send a message, but the payload doesn't matter since we are just triggering an
    // error in the handler.
    genericPostMessage(messageName, channel, 'anything, does not matter');

    await waitFor(
      () => {
        expect(errorValue).toBeInstanceOf(Error);
        expect((errorValue as Error).message).toEqual('baz');
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    receiveChannel.stop();
  });

  test('should issue a console error if the listener callback throws and there is no error callback', async () => {
    const channel = 'abc123';
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
    });
    const messageName = 'foo';
    const expectedError = new Error('baz');

    // We simply capture the payload for inspection further down.
    receiveChannel.on(
      messageName,
      // the receive listener throws an error intentionally.
      (_: unknown) => {
        throw expectedError;
      },
    );
    receiveChannel.start();

    // Send a message, but the payload doesn't matter since we are just triggering an
    // error in the handler.
    genericPostMessage(messageName, channel, 'anything, does not matter');

    await waitFor(
      () => {
        expect(errorLogSpy).toHaveBeenCalledWith('Error in listener callback', expect.any(Error));
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    receiveChannel.stop();
  });

  test('should issue a console error if the once listener callback throws and there is no error callback', async () => {
    const channel = 'abc123';
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
    });
    const messageName = 'foo';
    const expectedError = new Error('baz');

    // We simply capture the payload for inspection further down.
    receiveChannel.once(
      messageName,
      // the receive listener throws an error intentionally.
      (_: unknown) => {
        throw expectedError;
      },
    );
    receiveChannel.start();

    // Send a message, but the payload doesn't matter since we are just triggering an
    // error in the handler.
    genericPostMessage(messageName, channel, 'anything, does not matter');

    await waitFor(
      () => {
        expect(errorLogSpy).toHaveBeenCalledWith('Error in listener callback', expect.any(Error));
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    receiveChannel.stop();
  });

  test('should have the error handler called in case of an error which is not Error', async () => {
    const channel = 'abc123';
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
    });
    const messageName = 'foo';

    // We simply capture the payload for inspection further down.
    let errorValue: unknown = null;
    receiveChannel.on(
      messageName,
      // the receive listener throws an error intentionally.
      (_: unknown) => {
        // eslint-disable-next-line no-throw-literal
        throw 'baz';
      },
      // note the error listener below.
      (error: unknown) => {
        errorValue = error;
      },
    );
    receiveChannel.start();

    // Send a message, but the payload doesn't matter since we are just triggering an
    // error in the handler.
    genericPostMessage(messageName, channel, 'anything, does not matter');

    await waitFor(
      () => {
        expect(errorValue).toBeInstanceOf(Error);
        expect((errorValue as Error).message).toEqual('Unknown error');
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    receiveChannel.stop();
  });

  test('should issue an error console message if an error handler throws an error!', async () => {
    const channel = 'abc123';
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
    });
    const messageName = 'foo';

    // We simply capture the payload for inspection further down.
    receiveChannel.on(
      messageName,
      // the receive listener throws an error intentionally.
      (_: unknown) => {
        throw new ErrorOne('Error 1');
      },
      // note the error listener below.
      () => {
        throw new ErrorTwo('Error 2');
      },
    );
    receiveChannel.start();

    // Send a message, but the payload doesn't matter since we are just triggering an
    // error in the handler.
    genericPostMessage(messageName, channel, 'anything, does not matter');

    await waitFor(
      () => {
        expect(errorLogSpy).toHaveBeenCalledWith('Error in error handler', expect.any(ErrorTwo));
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    receiveChannel.stop();
  });

  test('should issue an error console message if an error handler throws an error!', async () => {
    const channel = 'abc123';
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
    });
    const messageName = 'foo';

    // We simply capture the payload for inspection further down.
    receiveChannel.on(
      messageName,
      // the receive listener throws an error intentionally.
      (_: unknown) => {
        throw new ErrorOne('Error 1');
      },
      // note the error listener below.
      () => {
        throw new ErrorTwo('Error 2');
      },
    );
    receiveChannel.start();

    // Send a message, but the payload doesn't matter since we are just triggering an
    // error in the handler.
    genericPostMessage(messageName, channel, 'anything, does not matter');

    await waitFor(
      () => {
        expect(errorLogSpy).toHaveBeenCalledWith('Error in error handler', expect.any(ErrorTwo));
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    receiveChannel.stop();
  });

  test('should issue an error console message if an error handler throws an error which is not an Error!', async () => {
    const channel = 'abc123';
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
    });
    const messageName = 'foo';

    // We simply capture the payload for inspection further down.
    receiveChannel.on(
      messageName,
      // the receive listener throws an error intentionally.
      (_: unknown) => {
        throw new ErrorOne('Error 1');
      },
      // note the error listener below.
      // TODO: should use the error passed in.
      (_error: unknown) => {
        // eslint-disable-next-line no-throw-literal
        throw 'Error 3';
      },
    );
    receiveChannel.start();

    // Send a message, but the payload doesn't matter since we are just triggering an
    // error in the handler.
    genericPostMessage(messageName, channel, 'anything, does not matter');

    await waitFor(
      () => {
        expect(errorLogSpy).toHaveBeenCalledWith('Error in error handler', 'Error 3');
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    receiveChannel.stop();
  });

  test('can receive a variety of messages', async () => {
    const channel = 'abc123';
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
    });
    const testValues: Array<{
      name: string;
      expectedPayload: unknown;
      actualPayload?: unknown;
    }> = [
      { name: 'foo', expectedPayload: 'baz' },
      { name: 'bar', expectedPayload: 123 },
      { name: 'baz', expectedPayload: ['1', 2, null, { foo: 'bar' }] },
    ];

    // We simply capture the payload for inspection further down.
    // Note that we don't explicitly type the payload.
    // We _could_ have a generic version of ReceiveChannel, but it would cover over the
    // fact that we don't check the structure of incoming messages - we trust that they
    // are as expected.
    // To cover that, we would need per-message validation. Since, at least in this
    // codebase, the usage of these channels is limited to one use case, it doesn't seem
    // worthwhile.
    // And it is easy enough to test whether a message payload satisfies our type within
    // the message handler.
    for (const testValue of testValues) {
      receiveChannel.on(testValue.name, (payload: unknown) => {
        testValue.actualPayload = payload;
      });
    }

    receiveChannel.start();

    // Here we construct a message object in expected shape for a receive channel.
    for (const testValue of testValues) {
      genericPostMessage(testValue.name, channel, testValue.expectedPayload);
    }

    for await (const testValue of testValues) {
      await waitFor(
        () => {
          expect(testValue.actualPayload).toEqual(testValue.expectedPayload);
        },
        { timeout: WAIT_FOR_TIMEOUT },
      );
    }

    receiveChannel.stop();
  });

  test('can receive a one-time message with an error handler which behaves well', async () => {
    const channel = 'abc123';
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
    });
    const expectedError = new Error('baz');
    const messageName = 'foo';

    // We simply capture the payload for inspection further down.
    let actualError: unknown = null;
    receiveChannel.once(
      messageName,
      () => {
        throw expectedError;
      },
      (error: unknown) => {
        actualError = error;
      },
    );
    receiveChannel.start();

    // Send a message, but the payload doesn't matter since we are just triggering an
    // error in the handler.
    genericPostMessage(messageName, channel, 'anything, does not matter');

    await waitFor(
      () => {
        expect(actualError).toEqual(expectedError);
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    receiveChannel.stop();
  });

  test('can receive a one-time message with an error handler which throws an Error', async () => {
    const channel = 'abc123';
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
    });
    const expectedError = new Error('baz');
    const messageName = 'foo';

    // We simply capture the payload for inspection further down.
    receiveChannel.once(
      messageName,
      () => {
        throw expectedError;
      },
      () => {
        throw new ErrorTwo('Error 2');
      },
    );
    receiveChannel.start();

    // Here we construct a message object in expected shape for a receive channel.
    // Send a message, but the payload doesn't matter since we are just triggering an
    // error in the handler.
    genericPostMessage(messageName, channel, 'anything, does not matter');

    await waitFor(
      () => {
        expect(errorLogSpy).toHaveBeenCalledWith('Error in error handler', expect.any(ErrorTwo));
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    receiveChannel.stop();
  });

  test('can receive a one-time message with an error handler which throws an Error which is not an Error', async () => {
    const channel = 'abc123';
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
    });
    const messageName = 'foo';

    // We simply capture the payload for inspection further down.
    receiveChannel.once(
      messageName,
      () => {
        throw new ErrorOne('Error 1');
      },
      () => {
        // eslint-disable-next-line no-throw-literal
        throw 'Error 3';
      },
    );
    receiveChannel.start();

    // Send a message, but the payload doesn't matter since we are just triggering an
    // error in the handler.
    genericPostMessage(messageName, channel, 'anything, does not matter');

    await waitFor(
      () => {
        expect(errorLogSpy).toHaveBeenCalledWith('Error in error handler', 'Error 3');
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    receiveChannel.stop();
  });

  test('can receive a one-time message which is not available after the first message', async () => {
    const channel = 'abc123';
    const expectedOrigin = window.location.origin;
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin,
      channel,
    });
    const expectedValue = 'baz';
    const messageName = 'foo';

    // We simply capture the payload for inspection further down.
    let actualValue: unknown = null;
    receiveChannel.once(messageName, (payload: unknown) => {
      actualValue = payload;
    });
    receiveChannel.start();

    // Here we construct a message object in expected shape for a receive channel.
    genericPostMessage(messageName, channel, expectedValue);

    // And it should be received.
    await waitFor(
      () => {
        expect(actualValue).toEqual(expectedValue);
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    // If we send a second time, the message will never be received
    actualValue = null;
    genericPostMessage(messageName, channel, expectedValue);

    await expect(
      waitFor(
        () => {
          expect(actualValue).toEqual(expectedValue);
        },
        { timeout: WAIT_FOR_TIMEOUT },
      ),
    ).rejects.toThrow();

    receiveChannel.stop();
  });

  test('should only receive messages in which the message data complies with the expected structure', async () => {
    const channel = 'abc123';
    const targetOrigin = 'http://localhost';
    const receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin: targetOrigin,
      channel,
    });

    expect(receiveChannel).toBeTruthy();

    // These are provided directly to postMessage, so we don't need to worry about
    // compliance with MessageData.
    const testValues: Array<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name?: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      message: any;
      actualPayload?: unknown;
    }> = [
      { message: 'foo' }, // must be an object, and
      { message: null }, // not null, and
      { message: {} }, // name must be present and
      { message: { name: 123 } }, // name must be a string, and
      { message: { name: 'foo' } }, // envelope must be present, and
      { message: { name: 'foo', envelope: 123 } }, // it must be an object and
      { message: { name: 'foo', envelope: null } }, // not null, and
      { message: { name: 'foo', envelope: { foo: 'bar' } } }, // the channel property must be present, and
      { message: { name: 'foo', envelope: { channel: 123 } } }, // the channel must equal the ReceiveChannel's channel
    ];

    // We simply capture the payload for inspection further down.
    // Note that we don't explicitly type the payload.
    // We _could_ have a generic version of ReceiveChannel, but it would cover over the
    // fact that we don't check the structure of incoming messages - we trust that they
    // are as expected.
    // To cover that, we would need per-message validation. Since, at least in this
    // codebase, the usage of these channels is limited to one use case, it doesn't seem
    // worthwhile.
    // And it is easy enough to test whether a message payload satisfies our type within
    // the message handler.

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let testValue: any = null;
    receiveChannel.on('foo', (payload: unknown) => {
      testValue = payload;
    });

    receiveChannel.start();

    // Here we construct a message object in expected shape for a receive channel.
    for (const { message } of testValues) {
      // We are using whole messages here, so we use raw postMessage.
      // genericPostMessage(message.name, channel, message.payload, targetOrigin);
      genericRawPostMessage(message, targetOrigin);
      // window.postMessage(message, targetOrigin);
    }

    await expect(
      waitFor(
        () => {
          expect(testValue).not.toBeNull();
        },
        { timeout: WAIT_FOR_TIMEOUT },
      ),
    ).rejects.toThrow();

    // But finally, let us be assured that a properly formed message would work.
    const successMessage = {
      name: 'foo',
      envelope: { channel: 'abc123' },
      payload: 'bar',
    };

    genericPostMessage(successMessage.name, channel, successMessage.payload, targetOrigin);
    // window.postMessage(successMessage, targetOrigin);
    waitFor(
      () => {
        expect(testValue).toEqual(successMessage.payload);
      },
      { timeout: WAIT_FOR_TIMEOUT },
    );

    // With mismatching origin, should also not handle it
    testValue = null;
    genericPostMessage(successMessage.name, channel, successMessage.payload, 'http://example.com');

    await expect(
      waitFor(
        () => {
          expect(testValue).not.toBeNull();
        },
        { timeout: WAIT_FOR_TIMEOUT },
      ),
    ).rejects.toThrow();

    receiveChannel.stop();
  });
});
