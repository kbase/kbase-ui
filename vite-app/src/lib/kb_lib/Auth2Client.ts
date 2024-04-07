import { AuthError } from './Auth2Error';
import {
    AbortError,
    GeneralError,
    HttpClient,
    RequestOptions,
    Response,
    TimeoutError,
} from './HttpClient';

export class AuthClient extends HttpClient {
    isGeneralError(error: GeneralError): boolean {
        return error instanceof GeneralError;
    }

    request(options: RequestOptions): Promise<Response> {
        return super.request(options).catch((err) => {
            if (err instanceof GeneralError) {
                throw new AuthError({
                    code: 'connection-error',
                    message: err.message,
                    detail: 'An error was encountered communicating with the Auth Service',
                    data: {},
                });
            } else if (err instanceof TimeoutError) {
                throw new AuthError({
                    code: 'timeout-error',
                    message: err.message,
                    detail: 'There was a timeout communicating with the Auth Service',
                    data: {},
                });
            } else if (err instanceof AbortError) {
                throw new AuthError({
                    code: 'timeout-error',
                    message: err.message,
                    detail: 'There was a timeout communicating with the Auth Service',
                    data: {},
                });
            } else if (err instanceof AuthError) {
                throw new AuthError({
                    code: 'abort-error',
                    message: err.message,
                    detail: 'The connection was aborted while communicating with the Auth Service',
                    data: {},
                });
            } else {
                throw new Error('Unknown Error');
            }
        });
    }
}
