import { Props } from '../lib/kb_lib/props';
import { ReactiveDB } from '../lib/kb_lib/ReactiveDB';
import { Messenger, SubscriptionRef } from '../lib/messenger';
import { AppServiceManager } from '../lib/appServiceManager';

interface RuntimeParams {
    config: Props;
    messenger: Messenger;
    serviceManager: AppServiceManager;
}

interface FeatureSwitchDefinition {
    id: string;
    title: string;
    description: string;
    disabled?: boolean;
}

export class Runtime {
    configProps: Props;
    messenger: Messenger;
    serviceManager: AppServiceManager;
    globalDB: ReactiveDB;
    featureSwitches: Map<string, any>;
    constructor({ config, messenger, serviceManager }: RuntimeParams) {
        this.configProps = new Props({ data: config });
        this.messenger = messenger;
        this.serviceManager = serviceManager;
        this.globalDB = new ReactiveDB();
        this.featureSwitches = this.configProps.getItemWithDefault<Array<FeatureSwitchDefinition>>('ui.featureSwitches.available', [])
            .reduce((features, featureSwitch) => {
                features.set(featureSwitch.id, featureSwitch);
                return features;
            }, new Map<string, FeatureSwitchDefinition>());
    }

    getConfig(prop: string, defaultValue: any) {
        return this.configProps.getItemWithDefault(prop, defaultValue);
    }

    config(prop: string, defaultValue: any) {
        return this.configProps.getItemWithDefault(prop, defaultValue);
    }

    hasConfig(prop: string) {
        return this.configProps.hasItem(prop);
    }

    setConfig(prop: string, value: any) {
        this.configProps.setItem(prop, value);
    }

    rawConfig() {
        return this.configProps.getRaw();
    }

    allow(tag: string) {
        let allowed = this.configProps.getItemWithDefault<Array<string>>('ui.allow', []);
        if (!(allowed instanceof Array)) {
            allowed = [allowed];
        }
        return (allowed.indexOf(tag) >= 0);
    }

    featureEnabled(id: string) {
        const featureSwitch = this.featureSwitches.get(id);
        if (!featureSwitch) {
            throw new Error('Feature switch "' + id + '" not defined');
        }
        if (featureSwitch.disabled) {
            return false;
        }

        const enabledFeatureSwitches = this.configProps.getItemWithDefault<Array<string>>('ui.featureSwitches.enabled', []);
        return enabledFeatureSwitches.includes(id);
    }

    featureDisabled(id: string) {
        const featureSwitch = this.featureSwitches.get(id);
        if (!featureSwitch) {
            throw new Error('Feature switch "' + id + '" not defined');
        }
        if (featureSwitch.disabled) {
            return true;
        }

        const disabledFeatureSwitches = this.configProps.getItemWithDefault<Array<string>>('ui.featureSwitches.disabled', []);
        return disabledFeatureSwitches.includes(id);
    }

    // The receive and send functions are the primary message methods

    // Receive a message on a channel, and have function fun handle
    // the message.
    receive(channel: string, message: string, handler: (payload: any) => void) {
        return this.messenger.receive({
            channel,
            message,
            handler
        });
    }

    // The friendlier more verbose functions take explicit arguments and
    // package them up into the messenger api format.
    send(channel: string, message: string, payload: any) {
        return this.messenger.send({
            channel,
            message,
            payload
        });
    }

    drop(spec: SubscriptionRef) {
        return this.messenger.drop(spec);
    }

    sendp(channel: string, message: string, payload: any) {
        return this.messenger.sendPromise({
            channel,
            message,
            payload
        });
    }

    // navigate paths
    // A simple wrapper around the navigate event.
    navigate(path: Array<string>) {
        this.send('app', 'navigate', path);
    }

    db() {
        return this.globalDB;
    }

    service(name: string) {
        return this.serviceManager.getService(name);
    }

    hasService(name: string) {
        return this.serviceManager.hasService(name);
    }
}
