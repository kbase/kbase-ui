import {AuthenticationStatus} from '@kbase/ui-lib';
import {UserProfile} from '@kbase/ui-lib/lib/comm/coreServices/UserProfile';
import {Component} from 'react';
import {Dropdown} from 'react-bootstrap';
import {AuthenticationState, AuthenticationStateAuthenticated,} from '../../contexts/Auth';
import SigninButton from './SigninButton';

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
                    return `${process.env.PUBLIC_URL}/images/nouserpic.png`;
                }
            } else {
                return `${process.env.PUBLIC_URL}/images/nouserpic.png`;
            }
        } else {
            return `${process.env.PUBLIC_URL}/images/nouserpic.png`;
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
                    return `${process.env.PUBLIC_URL}/images/nouserpic.png`;
            }
        } else {
            return `${process.env.PUBLIC_URL}/images/nouserpic.png`;
        }
    }

    renderAvatar(userProfile: UserProfile) {
        const avatarURL = this.renderAvatarUrl(userProfile);

        return (
            <img
                src={avatarURL}
                style={{width: '40px'}}
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

    // renderMenu(userProfile: UserProfile) {
    //     return (
    //         <Dropdown>
    //             <Dropdown.Toggle>
    //                 {this.renderAvatar(authState.userProfile)}
    //                 <div
    //                     style={{ textAlign: 'center' }}
    //                     data-element="user-label"
    //                 >
    //                     <div data-k-b-testhook-label="realname">
    //                         {userProfile.user.realname}
    //                     </div>
    //                     <div
    //                         data-k-b-testhook-label="username"
    //                         style={{ fontStyle: 'italic' }}
    //                     >
    //                         {userProfile.user.username}
    //                     </div>
    //                 </div>
    //             </Dropdown.Toggle>
    //             <Dropdown.Menu>
    //                 <Dropdown.Item href="/#people">
    //                     <div style={{ flex: '0 0 34px' }}>
    //                         <span
    //                             className="fa fa-user"
    //                             style={{ fontSize: '150%' }}
    //                         ></span>
    //                     </div>
    //                     <div style={{ flex: '1 1 0px' }}>Your Profile</div>
    //                 </Dropdown.Item>
    //                 <Dropdown.Divider />
    //                 <Dropdown.Item href="/#people">
    //                     <div style={{ flex: '0 0 34px' }}>
    //                         <span
    //                             className="fa fa-user"
    //                             style={{ fontSize: '150%' }}
    //                         ></span>
    //                     </div>
    //                     <div style={{ flex: '1 1 0px' }}>Your Profile</div>
    //                 </Dropdown.Item>
    //                 <Dropdown.Item href="/#account">
    //                     <div style={{ flex: '0 0 34px' }}>
    //                         <span
    //                             className="fa fa-drivers-license"
    //                             style={{ fontSize: '150%' }}
    //                         ></span>
    //                     </div>
    //                     <div style={{ flex: '1 1 0px' }}>Your Account</div>
    //                 </Dropdown.Item>
    //                 <Dropdown.Divider />
    //                 <Dropdown.Item onClick={this.handleSignout.bind(this)}>
    //                     <div style={{ flex: '0 0 34px' }}>
    //                         <span
    //                             className="fa fa-sign-out"
    //                             style={{ fontSize: '150%' }}
    //                         ></span>
    //                     </div>
    //                     <div style={{ flex: '1 1 0px' }}>Sign Out</div>
    //                 </Dropdown.Item>
    //             </Dropdown.Menu>
    //         </Dropdown>
    //     );
    // }

    // renderMenux(userProfile: UserProfile) {
    //     return (
    //         <ul className="dropdown-menu dropdown-menu-right" role="menu">
    //             <li>
    //                 <div
    //                     style={{ textAlign: 'center' }}
    //                     data-element="user-label"
    //                 >
    //                     <div data-k-b-testhook-label="realname">
    //                         {userProfile.user.realname}
    //                     </div>
    //                     <div
    //                         data-k-b-testhook-label="username"
    //                         style={{ fontStyle: 'italic' }}
    //                     >
    //                         {userProfile.user.username}
    //                     </div>
    //                 </div>
    //             </li>
    //             <li className="divider"></li>
    //             <li>
    //                 <a
    //                     href="/#people"
    //                     data-menu-item="user-profile"
    //                     data-k-b-testhook-button="user-profile"
    //                     style={{
    //                         display: 'flex',
    //                         flexDirection: 'row',
    //                         alignItems: 'center',
    //                     }}
    //                 >
    //                     <div style={{ flex: '0 0 34px' }}>
    //                         <span
    //                             className="fa fa-user"
    //                             style={{ fontSize: '150%' }}
    //                         ></span>
    //                     </div>
    //                     <div style={{ flex: '1 1 0px' }}>Your Profile</div>
    //                 </a>
    //             </li>
    //             <li>
    //                 <a
    //                     href="/#account"
    //                     data-menu-item="user-account"
    //                     data-k-b-testhook-button="user-account"
    //                     style={{
    //                         display: 'flex',
    //                         flexDirection: 'row',
    //                         alignItems: 'center',
    //                     }}
    //                 >
    //                     <div style={{ flex: '0 0 34px' }}>
    //                         <span
    //                             className="fa fa-drivers-license"
    //                             style={{ fontSize: '150%' }}
    //                         ></span>
    //                     </div>
    //                     <div style={{ flex: '1 1 0px' }}>Your Account</div>
    //                 </a>
    //             </li>
    //             <li className="divider"></li>
    //             <li>
    //                 <button
    //                     data-menu-item="logout"
    //                     data-k-b-testhook-button="logout"
    //                     onClick={this.handleSignout.bind(this)}
    //                     style={{
    //                         display: 'flex',
    //                         flexDirection: 'row',
    //                         alignItems: 'center',
    //                     }}
    //                 >
    //                     <div style={{ flex: '0 0 34px' }}>
    //                         <span
    //                             className="fa fa-sign-out"
    //                             style={{ fontSize: '150%' }}
    //                         ></span>
    //                     </div>
    //                     <div style={{ flex: '1 1 0px' }}>Sign Out</div>
    //                 </button>
    //             </li>
    //         </ul>
    //     );
    // }

    renderLoggedIn(authState: AuthenticationStateAuthenticated) {
        return (
            <Dropdown>
                <Dropdown.Toggle variant="default">
                    {this.renderAvatar(authState.userProfile)}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.ItemText>
                        <div
                            style={{textAlign: 'center'}}
                            data-element="user-label"
                        >
                            <div data-k-b-testhook-label="realname">
                                {authState.userProfile.user.realname}
                            </div>
                            <div
                                data-k-b-testhook-label="username"
                                style={{fontStyle: 'italic'}}
                            >
                                {authState.userProfile.user.username}
                            </div>
                        </div>
                    </Dropdown.ItemText>
                    <Dropdown.Divider/>
                    <Dropdown.Item href="/#people">
                        <div className="navbar-icon">
                            <span className="fa fa-user"/>
                        </div>
                        <span>Your Profile</span>
                    </Dropdown.Item>
                    <Dropdown.Item href="/#account">
                        <div className="navbar-icon">
                            <span className="fa fa-drivers-license"/>
                        </div>
                        <span>Your Account</span>
                    </Dropdown.Item>
                    <Dropdown.Divider/>
                    <Dropdown.Item onClick={this.handleSignout.bind(this)}>
                        <div className="navbar-icon">
                            <span className="fa fa-sign-out"/>
                        </div>
                        <span>Sign Out</span>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        );
        // return (
        //     <div
        //         className="dropdown"
        //         style={{ display: 'inline-block' }}
        //         data-k-b-testhook-menu="signed-in"
        //     >
        //         <button
        //             type="button"
        //             className="btn btn-default dropdown-toggle"
        //             data-toggle="dropdown"
        //             aria-expanded="false"
        //             data-k-b-testhook-button="avatar"
        //         >
        //             {this.renderAvatar(authState.userProfile)}
        //             <span
        //                 className="caret"
        //                 style={{ marginLeft: '5px' }}
        //             ></span>
        //         </button>
        //         {this.renderMenu(authState.userProfile)}
        //     </div>
        // );
    }

    renderNotLoggedIn() {
        return <SigninButton isLoginView={true}/>;
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
