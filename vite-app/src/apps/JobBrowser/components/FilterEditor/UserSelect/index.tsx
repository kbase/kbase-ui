import { Component } from 'react';
// import { UserProfileClient } from '../../../lib/comm/coreServices/UserProfile';
import UserProfileClient from 'lib/kb_lib/comm/coreServices/UserProfile';
import { OptionValue } from '../../../lib/types';
import View, { UserSelectProps } from './view';

/* For Component */
export interface DataProps {
    token: string;
    username: string;
    userProfileServiceURL: string;
    timeout: number;
}

// type TheProps = Omit<DataProps & FilterEditorProps, "narratives">;
type TheProps = Omit<DataProps & UserSelectProps, "options" | "search">;

interface DataState {
    options: Array<OptionValue<string>> | null;
}

export default class UserSelectController extends Component<TheProps, DataState> {
    stopped: boolean;
    constructor(props: TheProps) {
        super(props);
        this.state = {
            options: null
        };
        this.stopped = false;
    }

    componentWillUnmount() {
        this.stopped = true;
    }

    async componentDidMount() {
        // const options = await this.fetchOptions();
        if (!this.stopped) {
            this.setState({
                options: []
            });
        }
    }

    async search(term: string) {
        const { token, userProfileServiceURL } = this.props;
        const client = new UserProfileClient({
            url: userProfileServiceURL,
            token,
            timeout:  10000
        });
        const users = await client.filter_users({filter_users: term});
        const options = users
            .map(({username, realname}) => {
                return {
                    value: username,
                    label: `${realname} (${username})`
                };
            })
            .sort((a, b) => {
                return a.label.localeCompare(b.label);
            });
        this.setState({
            options
        });
    }

    render() {
        if (this.state.options) {
            return <View
                changed={this.props.changed}
                search={this.search.bind(this)}
                options={this.state.options}
                defaultValue={this.props.defaultValue}
            />;
        } else {
            return "loading...";
        }
    }
}