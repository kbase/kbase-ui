import {UserProfile} from '@kbase/ui-lib/lib/comm/coreServices/UserProfile';
import {Component} from 'react';
import { NextRequest } from '../AuthProblem';
import './SigninButton.css';

export interface SigninProps {
    isLoginView: boolean;
    nextRequest?: NextRequest;
    bordered?: boolean;
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


    render() {
        const url = new URL(window.location.href);
        url.pathname = '';
        url.hash = '#login';

        if (this.props.nextRequest) {
            for (const [key, value] of this.props.nextRequest.toSearchParams()) {
                url.searchParams.set(key, value);
            }
            // params.set('nextrequest', this.props.nextRequest);
        }

        // url.hash = (() => {
        //     if (this.props.nextRequest) {
        //         const queryString = this.props.nextRequest.toSearchParams().toString();
        //         // for (const [key, value] of this.props.nextRequest.toSearchParams()) {
        //         //     url.searchParams.set(key, value);
        //         // }
        //         // params.set('nextrequest', this.props.nextRequest);
        //         return `#login?${queryString}`
        //     }
        //     return '#login'
        // })();

        const classList = ['SigninButton'];
        if (this.props.bordered) {
            classList.push('-bordered');
        }
        return (
            <a
                className={classList.join(' ')}
                data-k-b-testhook-widget="signin"
                // disable={this.props.isLoginView}
                data-button="signin"
                data-k-b-testhook-button="signin"
                href={url.toString()}
            >
                <span
                    className="fa fa-sign-in fa-inverse -icon"
                    style={{marginRight: '5px'}}
                />
                <span className="-label">Sign In</span>
            </a>
        );
    }
}
