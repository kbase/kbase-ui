import { AsyncProcess } from "@kbase/ui-lib";
import ErrorMessage from "components/ErrorMessage";
import Loading from "components/Loading";
import { AuthenticationStateAuthenticated } from "contexts/EuropaContext";
import { AsyncProcessStatus } from "lib/AsyncProcess";
import { SimpleError } from 'lib/SimpleError';
import UserProfileClient from "lib/kb_lib/comm/coreServices/UserProfile2";
import { hasOwnProperty } from "lib/utils";
import { Component } from "react";
import { Config } from "types/config";
import View from "./View";

export interface ORCIDLinkPreferences {
    showInProfile: boolean
}


export interface PermissionsControllerProps {
    config: Config;
    auth: AuthenticationStateAuthenticated;
}

interface PermissionsControllerState {
    preferencesState: AsyncProcess<ORCIDLinkPreferences, SimpleError>
    updatePreferencesState: AsyncProcess<true, SimpleError>
}

export default class PermissionsController extends Component<PermissionsControllerProps, PermissionsControllerState> {
    constructor(props: PermissionsControllerProps) {
        super(props);
        this.state = {
            preferencesState: {
                status: AsyncProcessStatus.NONE
            },
            updatePreferencesState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }
    componentDidMount() {
        this.fetchPreferences();
    }

    async fetchPreferences() {
        const {
            config: {
                services: {
                    UserProfile: {
                        url
                    }
                },
                ui: {
                    constants: {
                        clientTimeout: timeout
                    }
                }
            },
            auth: {
                authInfo: {
                    token,
                    tokenInfo: {
                        user: username
                    }
                },

            }
        } = this.props;

        this.setState({
            preferencesState: {
                status: AsyncProcessStatus.NONE
            }
        })

        const client = new UserProfileClient({
            url, token, timeout
        });
        try {
            this.setState({
                preferencesState: {
                    status: AsyncProcessStatus.PENDING
                }
            })
            const [profile] = await client.get_user_profile([username]);
            const { profile: { preferences } } = profile;
            if (!preferences) {
                // TODO: what to do? probably return default preferences, or create prefs on the fl
                this.setState({
                    preferencesState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: 'No preferences in user profile'
                        }
                    }
                })
                return;
            }

            const showORCIDId = (preferences.showORCIDId?.value || false) as unknown as boolean;

            // if (hasOwnProperty(preferences, 'showORCIDId')) {

            // }

            // const orcidLinkPreferences = 
            const preferencesx: ORCIDLinkPreferences = {
                showInProfile: showORCIDId
            }

            this.setState({
                preferencesState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: preferencesx
                }
            })
        } catch (ex) {
            const message = ex instanceof Error ? ex.message : 'Unknown Error';
            this.setState({
                preferencesState: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message
                    }
                }
            })
        }
    }

    async setPreferences(value: ORCIDLinkPreferences) {
        const {
            config: {
                services: {
                    UserProfile: {
                        url
                    }
                },
                ui: {
                    constants: {
                        clientTimeout: timeout
                    }
                }
            },
            auth: {
                authInfo: {
                    token,
                    tokenInfo: {
                        user: username
                    }
                },

            }
        } = this.props;

        this.setState({
            updatePreferencesState: {
                status: AsyncProcessStatus.NONE
            }
        })

        const client = new UserProfileClient({
            url, token, timeout
        });
        try {
            this.setState({
                updatePreferencesState: {
                    status: AsyncProcessStatus.PENDING
                }
            })

            const [{ user, profile: { preferences: rawPreferences } }] = await client.get_user_profile([username]);

            const preferences = rawPreferences || {};

            if (hasOwnProperty(preferences, 'showORCIDId')) {
                preferences.showORCIDId = {
                    ...preferences.showORCIDId,
                    value: value.showInProfile,
                    updatedAt: Date.now()
                }
            } else {
                preferences.showORCIDId = {
                    value: value.showInProfile,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                }
            }

            const profileUpdate = {
                user,
                profile: {
                    preferences
                }
            }

            await client.update_user_profile({ profile: profileUpdate });

            this.fetchPreferences();

            this.setState({
                updatePreferencesState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: true
                }
            })
        } catch (ex) {
            const message = ex instanceof Error ? ex.message : 'Unknown Error';
            this.setState({
                updatePreferencesState: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message
                    }
                }
            })
        }
    }

    render() {
        switch (this.state.preferencesState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <Loading message="Loading permissions..." />
            case AsyncProcessStatus.SUCCESS:
                return <View preferences={this.state.preferencesState.value} setPreferences={this.setPreferences.bind(this)} />
            case AsyncProcessStatus.ERROR:
                return <ErrorMessage message={this.state.preferencesState.error.message} />
        }
    }
}
