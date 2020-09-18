define([
    'kb_lib/reactiveDb'
], (
    reactiveDb
) => {

    return class Runtime {
        constructor({config, messenger, serviceManager}) {
            this.configProps = config;
            this.messenger = messenger;
            this.serviceManager = serviceManager;
            this.globalDB = new reactiveDb.DB();
            this.featureSwitches = {};
            this.configProps.getItem('ui.featureSwitches.available', []).reduce((features, featureSwitch) => {
                this.featureSwitches[featureSwitch.id] = featureSwitch;
            }, {});
        }

        getConfig(prop, defaultValue) {
            return this.configProps.getItem(prop, defaultValue);
        }

        config(prop, defaultValue) {
            return this.configProps.getItem(prop, defaultValue);
        }

        hasConfig(prop) {
            return this.configProps.hasItem(prop);
        }

        setConfig(prop, value) {
            this.configProps.setItem(prop, value);
        }

        rawConfig() {
            return this.configProps.getRaw();
        }

        allow(tag) {
            var allowed = this.configProps.getItem('ui.allow', []);
            if (!(allowed instanceof Array)) {
                allowed = [allowed];
            }
            return (allowed.indexOf(tag) >= 0);
        }

        featureEnabled(id) {
            const featureSwitch = this.featureSwitches[id];
            if (!featureSwitch) {
                throw new Error('Feature switch "' + id + '" not defined');
            }
            if (featureSwitch.disabled) {
                return false;
            }

            const enabledFeatureSwitches = this.configProps.getItem('ui.featureSwitches.enabled');
            const enabled = enabledFeatureSwitches.includes(id);
            return enabled;
        }

        featureDisabled(id) {
            const featureSwitch = this.featureSwitches[id];
            if (!featureSwitch) {
                throw new Error('Feature switch "' + id + '" not defined');
            }
            if (featureSwitch.disabled) {
                return true;
            }

            const disabledFeatureSwitches = this.configProps.getItem('ui.featureSwitches.disabled');
            const disabled = disabledFeatureSwitches.includes(id);
            return disabled;
        }

        // The receive and send functions are the primary message methods

        // Receive a message on a channel, and have function fun handle
        // the message.
        receive(channel, message, fun) {
            return this.rcv({
                channel: channel,
                message: message,
                handler: fun
            });
        }

        // The friendlier more verbose functions take explicit arguments and
        // packge them up into the messenger api format.
        send(channel, message, data) {
            return this.messenger.send({
                channel: channel,
                message: message,
                data: data
            });
        }

        // The "short" versions of the message functions just use the raw
        // messenger api, which expects an object argument.
        rcv(spec) {
            return this.messenger.receive(spec);
        }

        urcv(spec) {
            return this.messenger.unreceive(spec);
        }

        snd(spec) {
            return this.messenger.send(spec);
        }

        drop(spec) {
            this.urcv(spec);
        }

        sendp(channel, message, data) {
            return this.messenger.sendPromise({
                channel: channel,
                message: message,
                data: data
            });
        }

        // navigate path
        // A simple wrapper around the navigate event.
        navigate(path) {
            this.send('app', 'navigate', path);
        }

        db() {
            return this.globalDB;
        }

        service() {
            return this.serviceManager.getService.apply(this.serviceManager, arguments);
        }

        hasService() {
            return this.serviceManager.hasService.apply(this.serviceManager, arguments);
        }

        getService() {
            return this.serviceManager.getService.apply(this.serviceManager, arguments);
        }
    };
});
