/**
 * RESTish exceptions
 */

export class RESTHTTPError extends Error {
    statusCode: number;
    constructor({ message, statusCode }: { message: string, statusCode: number }) {
        super(message);
        this.statusCode = statusCode;
    }

    toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message
        }
    }
}

export default class DOIOrgClient {
    async getCitation(doi: string): Promise<string> {
        const response = await (async () => {
            try {
                return fetch(`https://doi.org/${doi}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/x-bibliography',
                    },
                    redirect: 'follow'
                });

            } catch (ex) {
                console.error('ERROR fetching doi', ex);
                throw new Error('Error fetching citation');
            }
        })();


        const responseText = await response.text();
        if (response.status !== 200) {
            throw new RESTHTTPError({
                statusCode: response.status,
                message: responseText
            });
        }

        return responseText;
    }
    // async getMetadata(doi: string): Promise<CSLMetadata> {
    //     const response = await (async () => {
    //         try {
    //             return fetch(`https://doi.org/${doi}`, {
    //                 method: 'GET',
    //                 headers: {
    //                     'Accept': 'application/vnd.citationstyles.csl+json'
    //                 },
    //                 redirect: 'follow'
    //             });
    //         } catch (ex) {
    //             console.error('Error fetching doi', ex);
    //             throw new Error('Error fetching citation');
    //         }
    //     })();


    //     const responseText = await response.text();
    //     if (response.status !== 200) {
    //         throw new RESTHTTPError({
    //             statusCode: response.status,
    //             message: responseText
    //         });
    //     }

    //     try {
    //         return JSON.parse(responseText) as unknown as CSLMetadata;ir
    //     } catch (ex) {
    //         console.error('Error parsing JSON response', ex);
    //         if (ex instanceof Error) {
    //             throw new Error(`Error parsing JSON response: ${ex.message}`);
    //         } else {
    //             throw new Error(`Error parsing JSON response: Unknown Error`);
    //         }
    //     }
    // }
}
