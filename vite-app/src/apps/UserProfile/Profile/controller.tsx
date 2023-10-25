import { ErrorCode } from "apps/ORCIDLink/lib/ORCIDLinkClient";
import ErrorMessage from "components/ErrorMessage";
import Loading from "components/Loading";
import { AuthenticationStateAuthenticated } from "contexts/Auth";
import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { JSONRPC20Exception } from "lib/kb_lib/comm/JSONRPC20/JSONRPC20";
import ORCIDLinkAPI, { InfoResult } from "lib/kb_lib/comm/coreServices/ORCIDLInk";
import { Component } from "react";
import { Config } from "types/config";
import {
    ProfileWarnings, UserProfileBFFService, UserProfileSubset, UserProfileUpdate,
    UserProfileUser, fetchProfileAPI2, updateProfileAPI
} from "../API";
import { AsyncFetchState, AsyncFetchStatus } from "../asyncFetchState";
import { SERVICE_CALL_TIMEOUT } from "../constants";
import ProfileEditor from "./ProfileEditor";
import ProfileViewer from "./ProfileViewer";

// ORCiD

export type ORCIDView = {
    orcidId: string | null;
    serviceInfo: InfoResult;
}

export interface SimpleError {
    message: string;
}

export type ORCIDState = AsyncProcess<ORCIDView, SimpleError>;

// Orgs

export interface Org {
    name: string;
    url: string;
    logoURL?: string;
}

export type OrgsState = AsyncProcess<{ orgs: Array<Org> }, SimpleError>;


// PROFILE


export interface ProfileView {
    user: UserProfileUser
    profile: UserProfileSubset
    editEnable: boolean,
    warnings: ProfileWarnings
}

export type ProfileState = AsyncFetchState<{ profileView: ProfileView }, SimpleError>

export interface ProfileControllerProps {
    authState: AuthenticationStateAuthenticated;
    config: Config;
    username: string;
    setTitle: (title: string) => void;
}

interface ProfileControllerState {
    orgsState: OrgsState,
    orcidState: ORCIDState,
    profileState: ProfileState;
    isEditing: boolean;
}

export default class ProfileController extends Component<ProfileControllerProps, ProfileControllerState> {
    constructor(props: ProfileControllerProps) {
        super(props);
        this.state = {
            orgsState: {
                status: AsyncProcessStatus.NONE
            },
            profileState: {
                status: AsyncFetchStatus.NONE
            },
            orcidState: {
                status: AsyncProcessStatus.NONE
            },
            isEditing: false
        }
    }

    componentDidMount() {
        this.loadOrgs();
        this.fetchProfile(this.props.username);
        this.checkORCID(this.props.username);
    }

    async loadOrgs() {
        this.setState({
            orgsState: {
                status: AsyncProcessStatus.PENDING
            }
        });

        try {
            const orgs = await this.fetchOrgs(this.props.username)
            this.setState({
                orgsState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        orgs
                    }
                }
            });
        } catch (ex) {
            const message = (() => {
                if (ex instanceof Error) {
                    return ex.message;
                }
                return 'Unknown error';
            })();
            this.setState({
                orgsState: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message
                    }
                }
            });
        }
    }

    async fetchOrgs(username: string) {
        const {
            authInfo: {
                token
            }
        } = this.props.authState

        const {
            services: {
                ServiceWizard: {
                    url
                }
            }
        } = this.props.config;

        const client = new UserProfileBFFService({
            url, token, timeout: SERVICE_CALL_TIMEOUT
        })

        const orgs = await client.orgsList(username);
        return orgs
            .map(({ name, id, custom }) => {
                return {
                    name,
                    url: "#orgs/" + id,
                    logoURL: custom.logourl,
                };
            });
    }

    async updateProfile(updatedProfile: UserProfileUpdate) {
        if (this.state.profileState.status === AsyncFetchStatus.SUCCESS) {
            this.setState({
                profileState: {
                    ...this.state.profileState,
                    status: AsyncFetchStatus.REFETCHING
                }
            })
        } else {
            this.setState({
                profileState: {
                    status: AsyncFetchStatus.FETCHING
                }
            })
        }

        const {
            services: {
                UserProfile: {
                    url: userProfileServiceURL,
                }
            }
        } = this.props.config;

        const {
            authInfo: {
                token,
                account: {
                    user: authUsername
                }
            }
        } = this.props.authState

        try {
            const [status, message] = await updateProfileAPI(
                token,
                userProfileServiceURL,
                updatedProfile
            );
            if (status !== 200) {
                this.setState({
                    profileState: {
                        status: AsyncFetchStatus.ERROR,
                        error: {
                            message
                        }
                    }
                });
                return;
            }

            const [profile, warnings] = await fetchProfileAPI2(this.props.username, token, userProfileServiceURL);
            const { user, profile: { userdata, preferences, synced: { gravatarHash } } } = profile;

            const isOwner = profile.user.username === authUsername;

            const profileView: ProfileView = {
                user,
                profile: { userdata, preferences, gravatarHash },
                editEnable: isOwner,
                warnings
            };

            this.setState({
                profileState: {
                    status: AsyncFetchStatus.SUCCESS,
                    value: {
                        profileView
                    }
                },
                isEditing: false
            })
        } catch (ex) {
            const message = (() => {
                if (ex instanceof Error) {
                    return ex.message;
                }
                return 'Unknown error';
            })();
            this.setState({
                profileState: {
                    status: AsyncFetchStatus.ERROR,
                    error: {
                        message
                    }
                }
            });
        }
    }

    async checkORCID(username: string) {
        this.setState({
            orcidState: {
                status: AsyncProcessStatus.PENDING
            }
        });

        const {
            authInfo: {
                token
            }
        } = this.props.authState

        const {
            services: {
                UserProfile: {
                    url
                }
            }
        } = this.props.config;

        try {
            const match = /^(.*\/\/[^/]+)\/services/.exec(url);
            if (match === null) {
                this.setState({
                    orcidState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: 'Cannot get baseURL'
                        }
                    }
                });
                return;
            }
            const [, baseURL] = match;
            const orcidLinkURL = new URL(baseURL);
            orcidLinkURL.pathname = '/services/orcidlink';

            const orcidLinkAPI = new ORCIDLinkAPI({
                url: `${orcidLinkURL.toString()}/api/v1`,
                timeout: SERVICE_CALL_TIMEOUT,
                token
            });

            const serviceInfo = await orcidLinkAPI.info();

            try {
                const { orcid_auth: { orcid: orcidId } } = await orcidLinkAPI.getOtherLink({ username });
                this.setState({
                    orcidState: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: {
                            orcidId, serviceInfo
                        }
                    }
                })
            } catch (ex) {
                if (ex instanceof JSONRPC20Exception) {
                    if (ex.error.code === ErrorCode.not_found) {
                        this.setState({
                            orcidState: {
                                status: AsyncProcessStatus.SUCCESS,
                                value: {
                                    orcidId: null, serviceInfo
                                }
                            }
                        })
                        return;
                    }
                }
                throw ex;
            }
        } catch (ex) {
            if (ex instanceof JSONRPC20Exception) {
                this.setState({
                    orcidState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message
                        }
                    }
                });
            } else if (ex instanceof Error) {
                this.setState({
                    orcidState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message
                        }
                    }
                });
            } else {
                this.setState({
                    orcidState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: 'Unknown error'
                        }
                    }
                });
            }
        }
    }

    async fetchProfile(username: string) {
        this.setState({
            profileState: {
                status: AsyncFetchStatus.FETCHING
            }
        });

        const {
            authInfo: {
                token,
                account: {
                    user: authUsername
                }
            },

        } = this.props.authState

        const {
            services: {
                UserProfile: {
                    url
                }
            }
        } = this.props.config;

        try {
            const [profile, warnings] = await fetchProfileAPI2(username, token, url);
            const { user, profile: { userdata, preferences, synced: { gravatarHash } } } = profile;

            const isOwner = profile.user.username === authUsername;

            const profileView: ProfileView = {
                user,
                profile: { userdata, preferences, gravatarHash },
                editEnable: isOwner,
                warnings
            };

            if (isOwner) {
                this.props.setTitle('Your User Profile');
            } else {
                this.props.setTitle(`User Profile for ${profileView.user.realname}`);
            }

            this.setState({
                profileState: {
                    status: AsyncFetchStatus.SUCCESS,
                    value: {
                        profileView
                    }
                }
            })
        } catch (ex) {
            const message = (() => {
                if (ex instanceof Error) {
                    return ex.message;
                }
                return 'Unknown error';
            })();
            this.setState({
                profileState: {
                    status: AsyncFetchStatus.ERROR,
                    error: {
                        message
                    }
                }
            });
        }
    }

    toggleEditing() {
        this.setState({
            isEditing: !this.state.isEditing
        })
    }

    render() {
        switch (this.state.profileState.status) {
            case AsyncFetchStatus.NONE:
                return <Loading message="Initializing..." />
            case AsyncFetchStatus.FETCHING:
                return <Loading message="Loading User Profile..." />
            case AsyncFetchStatus.ERROR:
                return <ErrorMessage message={this.state.profileState.error.message} />
            case AsyncFetchStatus.REFETCHING:
            case AsyncFetchStatus.SUCCESS:
                if (this.state.isEditing) {
                    return <ProfileEditor
                        orgsState={this.state.orgsState}
                        profileView={this.state.profileState.value.profileView}
                        orcidState={this.state.orcidState}
                        uiOrigin={this.props.config.deploy.ui.origin}
                        updateProfile={this.updateProfile.bind(this)}
                        checkORCID={this.checkORCID.bind(this)}
                        fetchProfile={this.fetchProfile.bind(this)}
                        toggleEditing={this.toggleEditing.bind(this)}
                    />
                } else {
                    return <ProfileViewer
                        orgsState={this.state.orgsState}
                        profileView={this.state.profileState.value.profileView}
                        orcidState={this.state.orcidState}
                        uiOrigin={this.props.config.deploy.ui.origin}
                        checkORCID={this.checkORCID.bind(this)}
                        fetchProfile={this.fetchProfile.bind(this)}
                        toggleEditing={this.toggleEditing.bind(this)}
                    />
                }
        }
    }
}
