import { RestClient } from "./RestClient";

/**
 * Groups API - some useful endpoints.
 */
export class GroupsAPI extends RestClient {
    constructor(endpoint: string, token: string) {
        super(endpoint, token);
    }

    /**
     * Returns the resource info from a groups request.
     * From the Groups docs:
     *
     * GET /request/id/<request id>/resource
     * RETURNS: a resource entry (but see below).
     *
     * Resource entries are described in Resources above. The resource entry returned here is
     * slightly different: a) there is no added field because presumably the resource has not
     * yet been added to the group, and b) there is an additional resourcetype field that
     * specifies the type of the resource.
     *
     * The request must be open and the type must be Request, the resource type cannot be
     * user, and the user must be a group administrator.
     * @param {string} requestId
     */
    getResourceInfo(requestId: string) {
        return this.makeCall('GET', `request/id/${requestId}/resource`);
    }
}


