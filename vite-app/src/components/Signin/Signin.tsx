import { AuthenticationStatus } from '@kbase/ui-lib';
import { UserProfile } from '@kbase/ui-lib/lib/comm/coreServices/UserProfile';
import { Component } from 'react';
import { Dropdown } from 'react-bootstrap';
import { AuthenticationState, AuthenticationStateAuthenticated, } from '../../contexts/Auth';
import SigninButton from './SigninButton';
import styles from './Signin.module.css';

export interface SigninProps {
    authState: AuthenticationState;
    isLoginView: boolean;
    nextRequest?: string;
    signout: () => void;
}

interface SigninState {
}

export default class Signin extends Component<SigninProps, SigninState> {
    renderGravatarUrl(profile: UserProfile) {
        if ('userdata' in profile.profile) {
            const gravatarDefault =
                profile.profile.userdata.gravatarDefault || 'identicon';
            if ('synced' in profile.profile) {
                const gravatarHash = profile.profile.synced.gravatarHash;
                if (gravatarHash) {
                    return `https://www.gravatar.com/avatar/${gravatarHash}?s=300&r=pg&d=${gravatarDefault}`;
                } else {
                    return `images/nouserpic.png`;
                }
            } else {
                return `images/nouserpic.png`;
            }
        } else {
            return `images/nouserpic.png`;
        }
    }

    renderAvatarUrl(profile: UserProfile) {
        if (
            'userdata' in profile.profile &&
            profile.profile.userdata !== null
        ) {
            switch (profile.profile.userdata.avatarOption || 'gravatar') {
                case 'gravatar':
                    return this.renderGravatarUrl(profile);
                case 'silhouette':
                case 'mysteryman':
                default:
                    return `images/nouserpic.png`;
            }
        } else {
            return `images/nouserpic.png`;
        }
    }

    renderAvatar(userProfile: UserProfile) {
        const avatarURL = this.renderAvatarUrl(userProfile);

        return (
            <img
                src={avatarURL}
                style={{ width: '40px' }}
                className="login-button-avatar"
                alt={`Avatar for user ${userProfile.user.username}`}
                data-element="avatar"
            />
        );
    }

    handleSignout(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        this.props.signout();
    }

    iconClass(iconClassFragment: string) {
        return `fa fa-${iconClassFragment} ${styles.iconFont}`;
    }

    renderLoggedIn(authState: AuthenticationStateAuthenticated) {
        return (
            <Dropdown>
                <Dropdown.Toggle variant="default">
                    {this.renderAvatar(authState.userProfile)}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.ItemText>
                        <div
                            style={{ textAlign: 'center' }}
                            data-element="user-label"
                        >
                            <div data-k-b-testhook-label="realname">
                                {authState.userProfile.user.realname}
                            </div>
                            <div
                                data-k-b-testhook-label="username"
                                style={{ fontStyle: 'italic' }}
                            >
                                {authState.userProfile.user.username}
                            </div>
                        </div>
                    </Dropdown.ItemText>
                    <Dropdown.Divider />
                    <Dropdown.Item href="#people">
                        <div className={styles.icon}>
                            <span className={this.iconClass('user')} />
                        </div>
                        <span>Your Profile</span>
                    </Dropdown.Item>
                    <Dropdown.Item href="#account">
                        <div className={styles.icon}>
                            <span className={this.iconClass('drivers-license')} />
                        </div>
                        <span>Your Account</span>
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={this.handleSignout.bind(this)}>
                        <div className={styles.icon}>
                            <span className={this.iconClass('sign-out')} />
                        </div>
                        <span>Sign Out</span>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        );
    }

    renderNotLoggedIn() {
        const isLoginView = /login/.test(window.location.hash);
        return <SigninButton isLoginView={isLoginView} />;
    }

    render() {
        if (
            this.props.authState.status === AuthenticationStatus.AUTHENTICATED
        ) {
            return this.renderLoggedIn(this.props.authState);
        } else {
            return this.renderNotLoggedIn();
        }
    }
}
