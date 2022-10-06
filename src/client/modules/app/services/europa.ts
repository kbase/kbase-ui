import { Runtime } from '../../lib/types';

// TODO: DO NOT MERGE WITHOUT SAFER TARGET ORIGIN
const europaTargetOrigin = '*'; // 'https://ci-europa.kbase.us'

export const initEuropa = (runtime: Runtime) => {
    runtime.receive('app', 'route-component', (payload) => {
        if (window.parent) {
            window.parent.postMessage(
                { source: 'kbase-ui.app.route-component', payload },
                europaTargetOrigin
            );
        }
    });
    runtime.receive('ui', 'setTitle', (payload) => {
        if (window.parent) {
            window.parent.postMessage(
                { source: 'kbase-ui.ui.setTitle', payload },
                europaTargetOrigin
            );
        }
    });
    runtime.receive('session', 'loggedin', () => {
        if (window.parent) {
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
    window.addEventListener('message', (message) => {
        if (message.source !== window.parent) return;
        if (
            message?.data?.source &&
            message?.data?.source == 'europa.navigate'
        ) {
            runtime.send('app', 'navigate', message.data.payload);
        }
    });
};
