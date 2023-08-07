import { SimpleError } from "components/MainWindow";
import { AsyncSearchProcess, AsyncSearchProcessStatus } from "lib/AsyncSearchProcess";
import { Component } from "react";
import { UserProfileUser, filteredUserAPI } from '../API';
import { MINIMUM_SEARCH_CHARS } from "../constants";
import { containsScriptTag } from "../utils";
import SearchUsersView from "./view";


// export type SearchUsersStatus = "none" | "searching" | "found" | "needmore" | "error";

export type SearchState = AsyncSearchProcess<{ foundUsers: Array<UserProfileUser> }, SimpleError>;


export interface SearchUsersControllerProps {
    // token: string;
    url: string;
}

interface SearchUsersControllerState {
    searchText: string;
    searchState: SearchState
    // message: string;
    // status: SearchUsersStatus;
    // foundUsers: Array<UserProfileUser>
}

export default class SearchUsersController extends Component<SearchUsersControllerProps, SearchUsersControllerState> {
    constructor(props: SearchUsersControllerProps) {
        super(props);
        this.state = {
            searchText: '',
            searchState: {
                status: AsyncSearchProcessStatus.NONE
            }
        }
    }

    /**
    * when search value is more than 2 charactors, 
    * make API call and returns filtered list of users 
    * 
    * @param value 
    */
    async search(value: string) {
        // should never get this.
        if (value.length === 0) {
            this.setState({
                searchState: {
                    status: AsyncSearchProcessStatus.NONE,
                },
                searchText: value,
            });
            return;
        }

        if (value.length < MINIMUM_SEARCH_CHARS) {
            this.setState({
                searchState: {
                    status: AsyncSearchProcessStatus.NONE,
                },
                searchText: value,
            });
            return;
        }

        if (containsScriptTag(value)) {
            this.setState({
                searchState: {
                    status: AsyncSearchProcessStatus.ERROR,
                    error: {
                        message: 'Search text may not contain the "script" tag'
                    }
                },
                searchText: value
            })
            return;
        }

        this.setState({
            searchState: {
                status: AsyncSearchProcessStatus.PENDING,
                value: (this.state.searchState.status === AsyncSearchProcessStatus.PENDING || this.state.searchState.status === AsyncSearchProcessStatus.SUCCESS ? this.state.searchState.value : { foundUsers: [] })
            }
        });

        // this.setState({ status: 'searching', searchText: value, foundUsers: this.state.foundUsers })
        try {
            const [status, result] = await filteredUserAPI(value, this.props.url);
            if (status === 200) {
                this.setState({
                    searchState: {
                        status: AsyncSearchProcessStatus.SUCCESS,
                        value: {
                            foundUsers: result
                        }
                    },
                    searchText: value
                })
            } else {
                // TODO: make a real error state in this control
                // this just hacks the error response into the user list!
                // this.setState({ status: 'error', searchText: value, message: result });
                this.setState({
                    searchState: {
                        status: AsyncSearchProcessStatus.ERROR,
                        error: {
                            message: result
                        }
                    }
                });
            }
        } catch (ex) {
            const message = (() => {
                if (ex instanceof Error) {
                    return ex.message;
                }
                return 'Unknown error';
            })();
            this.setState({
                searchState: {
                    status: AsyncSearchProcessStatus.ERROR,
                    error: {
                        message
                    }
                }
            });
        }


    }


    render() {
        // switch (this.state.searchState.status) {
        //     case AsyncSearchProcessStatus.NONE:
        //         case AsyncSearchProcessStatus.PENDING:

        //             case AsyncSearchProcessStatus.ERROR:
        //                 case AsyncSearchProcessStatus.SUCCESS:
        // }
        return <SearchUsersView searchUsersState={this.state.searchState} search={this.search.bind(this)} />
    }
}