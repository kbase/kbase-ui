define([], () => {
    // interface AuthErrorInfo {
    //     code: string,
    //     status?: number,
    //     message: string,
    //     detail?: string
    //     data?: any
    // }

    class AuthError extends Error {
    // code: string;
    // message: string;
    // detail?: string;
    // data?: any;
        constructor(errorInfo) {
            super(errorInfo.message);
            Object.setPrototypeOf(this, AuthError.prototype);
            this.name = 'AuthError';

            this.code = errorInfo.code;
            this.detail = errorInfo.detail;
            this.data = errorInfo.data;
            this.stack = (new Error()).stack;
        }
    }

    return { AuthError };
});
