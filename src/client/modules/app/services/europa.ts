import { Runtime } from '../../lib/types';

// This line assumes kbase-ui is running on a direct subdomain on the Europa instance
// this subdomain relationship is _required_ for CORS security policy reasons
// i.e. legacy.ci-europa.kbase.us --> ci-europa.kbase.us
const europaTargetOrigin = window.location.hostname
    .split('.')
    .slice(1)
    .join('.');

// This variable is undefined by default but will be set if
// the iframe receives a 'europa.identify' message from a parent
// which specifies a parent domain which is not the one above.
// WHEN TRUTHY, token events will not propagate to the parent
// This enables development in localhost.
let insecureParent: string | undefined = undefined;

const getMessageDomain = () =>
    insecureParent ? insecureParent : europaTargetOrigin;

export const initEuropa = (runtime: Runtime) => {
    runtime.receive('app', 'route-component', (payload) => {
        if (window.parent) {
            window.parent.postMessage(
                { source: 'kbase-ui.app.route-component', payload },
                getMessageDomain()
            );
        }
    });
    runtime.receive('ui', 'setTitle', (payload) => {
        if (window.parent) {
            window.parent.postMessage(
                { source: 'kbase-ui.ui.setTitle', payload },
                getMessageDomain()
            );
        }
    });
    runtime.receive('session', 'loggedin', () => {
        if (window.parent && !insecureParent) {
            window.parent.postMessage(
                {
                    source: 'kbase-ui.session.loggedin',
                    payload: {
                        token: runtime.service('session').getAuthToken(),
                    },
                },
                europaTargetOrigin
            );
        }
    });
    runtime.receive('session', 'loggedout', () => {
        if (window.parent && !insecureParent) {
            window.parent.postMessage(
                {
                    source: 'kbase-ui.session.loggedout',
                    payload: undefined,
                },
                europaTargetOrigin
            );
        }
    });
    window.addEventListener('message', (message) => {
        // only look at messages which come from the iframe parent
        if (message.source !== window.parent || !message?.data?.source) return;
        // Navigate events
        if (message?.data?.source == 'europa.navigate') {
            runtime.send('app', 'navigate', message.data.payload);
        }
        // Domain identify events
        else if (message?.data?.source == 'europa.identify') {
            if (message.data.payload !== europaTargetOrigin) {
                // we could allow only specific domains here
                // (i.e. localhost:3000) in the future
                insecureParent = message.data.payload;
            }
        }
    });
};
