import { IDProvider } from "types/config";

import globusButtonLogo from './resources/providers/globus/logo.png';
import googleButtonLogo from './resources/providers/google/logo.png';
import orcidButtonLogo from './resources/providers/orcid/logo.png';


// Unfortunately the auth service does not have a concept of the
// "official label" for an id provider.
export function renderProviderLabel(providerId: string) {
    return {
        OrcID: 'ORCID',
        Google: 'Google',
        Globus: 'Globus'
    }[providerId] || 'Unknown';
}

export function providerLogoSrc(providerId: string) {
    switch (providerId) {
        case 'Google':
            return googleButtonLogo;
        case 'Globus':
            return globusButtonLogo;
        case 'OrcID': 
            return orcidButtonLogo;
        default:
            return null;
    }
}

export function providerLabel(providerId: string) {
    switch (providerId) {
        case 'Google':
            return 'Google';
        case 'Globus':
            return 'Globus';
        case 'OrcID': 
            return 'ORCiD';
        default:
            return null;
    }
}


export interface ProvidersParams {
    supportedProviders: Array<IDProvider>;
    providers?: Array<string>;
}

export class Providers {
    providers: Array<IDProvider>
    constructor({supportedProviders, providers}: ProvidersParams) {
        this.providers = supportedProviders
            .filter((provider) => {
                if (providers) {
                    return providers.includes(provider.id);
                }
                return true;

            });
        this.sortByPriority();
    }

    sortByPriority() {
        this.providers.sort((a, b) => {
            const priorityOrder = a.priority - b.priority;
            if (priorityOrder !== 0) {
                return priorityOrder;
            }

            const labelOrder = a.label < b.label ? -1 : (a.label > b.label ? 0 : 1);
            return labelOrder;
        });
    }

    get() {
        return this.providers;
    }
}