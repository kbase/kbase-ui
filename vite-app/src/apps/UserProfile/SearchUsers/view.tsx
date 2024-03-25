import { Alert, Empty, Select } from 'antd';

import { navigationPathToURL } from 'contexts/RouterContext';
import { AsyncSearchProcessStatus } from 'lib/AsyncSearchProcess';
import { Component } from 'react';
import { MINIMUM_SEARCH_CHARS } from '../constants';
import { SearchState } from './controller';

interface SearchUsersViewProps {
    // foundUsers: Array<UserProfileUser>;
    searchUsersState: SearchState
    search: (value: string) => void;
}

export interface OptionItem {
    value: string;
    label: string;
    disabled?: boolean
}

interface SearchUsersViewState {
    searchText: string;
    message?: string
    needsMore: boolean;
}

export interface OptionItem {
    value: string;
    label: string;
    disabled?: boolean
}


/**
 * View component with user search feature.
 * @param props
 */
export default class SearchUsersView extends Component<SearchUsersViewProps, SearchUsersViewState> {
    constructor(props: SearchUsersViewProps) {
        super(props);
        this.state = {
            searchText: '',
            needsMore: true
        };
    }


    onChangeHandler(value: string): void {
        if (value.length === 0) {
            return;
        }
        const url = navigationPathToURL({path: `user/${value}`, type: 'kbaseui'}, true);
        window.open(url, '_blank');
    }

    onSearch(value: string): void {
        if (value.length < MINIMUM_SEARCH_CHARS) {
            this.setState({
                needsMore: true
            });
            return;
        }
        this.setState({
            needsMore: false
        });
        this.props.search(value);
    }

    render() {

        const options: Array<OptionItem> = ((): Array<OptionItem> => {
            if (this.state.needsMore) {
                return [];
            }

            switch (this.props.searchUsersState.status) {
                case AsyncSearchProcessStatus.NONE:
                case AsyncSearchProcessStatus.ERROR:
                    return [];
                case AsyncSearchProcessStatus.PENDING:
                case AsyncSearchProcessStatus.SUCCESS:
                    return this.props.searchUsersState.value.foundUsers.map(({ username, realname }) => {
                        return {
                            value: username,
                            label: `${realname} (${username})`
                        };
                    });
            }
        })();

        const notFoundContent = (() => {
            if (this.state.needsMore) {
                return <Alert type="warning" message={`Enter ${MINIMUM_SEARCH_CHARS} or more characters`} />
            }
            switch (this.props.searchUsersState.status) {
                case AsyncSearchProcessStatus.NONE:
                    return;
                case AsyncSearchProcessStatus.ERROR:
                    return <Alert type="error" message={this.state.message} />
                case AsyncSearchProcessStatus.PENDING:
                case AsyncSearchProcessStatus.SUCCESS:
                    if (this.props.searchUsersState.value.foundUsers.length === 0) {
                        if (this.state.searchText.length === 0) {
                            return <Alert type="info" message={`Search for a user`} />
                        }
                        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`Nobody found for "${this.state.searchText}"`} />
                    }
            }
        })();

        return (
            <Select<string, OptionItem>
                style={{ width: 250 }}
                allowClear
                showSearch
                filterOption={false}
                placeholder={`Enter ${MINIMUM_SEARCH_CHARS} or more characters`}
                // showArrow={false}
                suffixIcon={null}
                onSearch={this.onSearch.bind(this)}
                onChange={this.onChangeHandler.bind(this)}
                notFoundContent={notFoundContent}
                options={options}
            />
        );
    }
}

