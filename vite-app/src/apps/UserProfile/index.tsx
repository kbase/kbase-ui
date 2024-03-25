import { Tabs, TabsProps } from 'antd';
import { RouteProps } from 'components/Router2';
import { AuthenticationStateAuthenticated } from "contexts/EuropaContext";
import { Component } from "react";
import { Config } from "types/config";
import NarrativesController from './Narratives/controller';
import ProfileController from './Profile/controller';
import SearchUsersController from './SearchUsers/controller';
import styles from './index.module.css';

export interface UserProfileProps extends RouteProps {
    authState: AuthenticationStateAuthenticated;
    config: Config;
    username: string,
    setTitle: (title: string) => void;
}

interface UserProfileState {
}

export default class UserProfile extends Component<UserProfileProps, UserProfileState> {
    componentDidMount(): void {
        this.props.setTitle('User Profile');
    }

    renderUserSearch() {
        const {
            services: {
                UserProfile: {
                    url
                }
            }
        } = this.props.config;
        return <div className="search-on-a-tab">Search for users <SearchUsersController url={url} /></div>;
    }

    render() {
        const username = this.props.username || this.props.authState.authInfo.account.user;

        const items: TabsProps['items'] = [{
            key: 'profile',
            label: 'Profile',
            children: <ProfileController
                key={username}
                authState={this.props.authState}
                config={this.props.config}
                username={username}
                setTitle={this.props.setTitle}
            />
        }, {
            key: 'narratives',
            label: 'Narratives',
            children: <NarrativesController 
                key={username}
                authState={this.props.authState} 
                config={this.props.config} 
                username={this.props.username} 
            />
        }]

        return (
            <div className={`${styles.UserProfile} Profile`}>
                <Tabs type="card"
                    animated={false}
                    className="FullHeight-tabs"
                    defaultActiveKey="profile"
                    tabBarExtraContent={this.renderUserSearch()}
                    items={items}
                />
            </div>
        );
    }
}
