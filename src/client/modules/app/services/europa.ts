import { Runtime } from '../../lib/types';

export const initEuropaRoutes = (runtime: Runtime) => {
    runtime.receive('app', 'route-component', (payload) => {
        if (window.parent) {
            window.parent.postMessage(
                { source: 'kbase-ui.app.route-component', payload },
                'https://ci-europa.kbase.us'
            );
        }
    });
    runtime.receive('ui', 'setTitle', (payload) => {
        if (window.parent) {
            window.parent.postMessage(
                { source: 'kbase-ui.ui.setTitle', payload },
                'https://ci-europa.kbase.us'
            );
        }
    });
};
