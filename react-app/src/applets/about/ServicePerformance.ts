import { isJSONObject, traverse } from '@kbase/ui-lib/lib/json';
import GenericClient11 from '../../lib/kb_lib/comm/JSONRPC11/GenericClient';
import GenericClient20 from '../../lib/kb_lib/comm/JSONRPC20/GenericClient';
import { Config } from '../../types/config';
import {
    ServiceDescription,
    ServiceDescriptionJSONRPC11,
    ServiceDescriptionJSONRPC20,
    ServiceDescriptionRest,
} from './ServiceDescription';

export interface ServicePerformanceParams {
    config: Config;
    service: ServiceDescription;
    iterations: number;
}

export interface VersionInfo {
    version: string;
    average: number;
    measures: Array<number>;
}

export interface PerformanceMetrics {
    measures: Array<number>;
    total: number;
    average: number;
}

export default class ServicePerformance {
    params: ServicePerformanceParams
    constructor(params: ServicePerformanceParams) {
        this.params = params;
    }

    sum(measures: Array<number>, fun?: (item: number) => number) {
        let total = 0;
        measures.forEach((measure) => {
            if (fun) {
                total += fun(measure);
            } else {
                total += measure;
            }
        });
        return total;
    }

    async measurePerformance(call: () => Promise<string>): Promise<PerformanceMetrics> {
        const measures: Array<number> = [];
        const next = async (itersLeft: number): Promise<PerformanceMetrics> => {
            if (itersLeft === 0) {
                return {
                    measures,
                    total: this.sum(measures),
                    average: this.sum(measures) / measures.length,
                };
            } 
            const start = new Date().getTime();
            try {
                await call();
                const elapsed = new Date().getTime() - start;
                measures.push(elapsed);
                return await next(itersLeft - 1);
                // return null;
            } catch (ex) {
                console.error('ERROR', expect);
                return await next(itersLeft - 1);
            }
        };
        return next(this.params.iterations);
    }

    jsonrpc11Client(service: ServiceDescriptionJSONRPC11) {
        const serviceModule = this.params.service.module;
        // how silly.
        const serviceConfigs = this.params.config.services as {
            [k: string]: {
                url: string;
            };
        };
        const client = new GenericClient11({
            module: serviceModule,
            url: serviceConfigs[serviceModule].url,
            timeout: this.params.config.ui.constants.clientTimeout,
        });
        return async () => {
            const [result] = await client.callFunc(service.method, []);

            if (service.versionKey) {
                if (isJSONObject(result)) {
                    const result2 = traverse(result, service.versionKey);

                    if (typeof result2 !== 'string') {
                        throw new Error('Expected string');
                    }
                    return result2;
                } else {
                    throw new Error('Expected JSON Object');
                }
            }
            if (typeof result !== 'string') {
                throw new Error('Expected string');
            }
            return result;
        };
    }

    jsonrpc20Client(service: ServiceDescriptionJSONRPC20) {
        const serviceModule = this.params.service.module;
        // how silly.
        const serviceConfigs = this.params.config.services as {
            [k: string]: {
                url: string;
            };
        };
        const serviceConfig = serviceConfigs[serviceModule];
        const client = new GenericClient20({
            module: serviceModule,
            url: serviceConfig.url,
            timeout: this.params.config.ui.constants.clientTimeout,
            prefix: false,
        });
        return async () => {
            const result = await client.callFunc(service.method);
            if (service.versionKey) {
                if (isJSONObject(result)) {
                    const result2 = traverse(result, service.versionKey);
                    if (typeof result2 !== 'string') {
                        throw new Error('Expected string');
                    }
                    return result2;
                } else {
                    throw new Error('Expected JSON Object');
                }
            }
            if (typeof result !== 'string') {
                throw new Error('Expected string');
            }
            return result;
        };
    }

    restClient(service: ServiceDescriptionRest): () => Promise<string> {
        const serviceModule = this.params.service.module;
        const serviceConfigs = this.params.config.services as {
            [k: string]: {
                url: string;
            };
        };
        return async (): Promise<string> => {
            const baseUrl = serviceConfigs[serviceModule].url;
            const url = baseUrl + service.path;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                },
            });
            if (response.status >= 300) {
                throw new Error(`Error in response: ${response.status}`);
            }
            const result = JSON.parse(await response.text());
            if (service.versionKey) {
                const possibleKey = traverse(result, service.versionKey);
                if (typeof possibleKey !== 'string') {
                    throw new Error('Expected string');
                }
                return possibleKey;
            } else {
                return result;
            }
        };
    }

    getAPICall(): () => Promise<string> {
        switch (this.params.service.type) {
            case 'jsonrpc11':
                return this.jsonrpc11Client(this.params.service);
            case 'jsonrpc20':
                return this.jsonrpc20Client(this.params.service);

            case 'rest':
                return this.restClient(this.params.service);
        }
    }

    async measure () {
        const ver = this.getAPICall();
        return await Promise.all([ver(), this.measurePerformance(ver)]);
    }
}
