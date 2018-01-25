define([], function () {

    function factory() {
        var queue = [];
        var runInterval = 0;
        var messageReceivers = {};

        function processQueue() {
            var processing = queue;
            queue = [];
            processing.forEach(function (message, index) {
                var receivers = messageReceivers[message.id];
                if (!receivers) {
                    return;
                }
                receivers.forEach(function (receiver) {
                    try {
                        receiver(message.payload);
                    } catch (ex) {
                        console.error('Error processing message: ' + ex.message, ex);
                    }
                });
            });
        }

        function run() {
            if (queue.length === 0) {
                return;
            }
            window.setTimeout(function () {
                processQueue();
                // just in case any new messages crept in.
                if (queue.length > 0) {
                    run();
                }
            }, runInterval);
        }

        function send(id, payload) {
            queue.push({
                id: id,
                payload: payload
            });
            run();
        }

        function on(id, handler) {
            if (!messageReceivers[id]) {
                messageReceivers[id] = [];
            }
            messageReceivers[id].push(handler);
        }

        return {
            send: send,
            on: on
        };
    }

    return {
        make: factory
    };
});
