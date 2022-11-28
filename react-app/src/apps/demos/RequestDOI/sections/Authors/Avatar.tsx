import { UserProfile } from '@kbase/ui-lib/lib/comm/coreServices/UserProfile';
import { Component } from 'react';

export interface AvatarProps {
    userProfile: UserProfile;
    style?: React.CSSProperties;
}


export default class Avatar extends Component<AvatarProps> {
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

    render() {
        const avatarURL = this.renderAvatarUrl(this.props.userProfile);
        const style: React.CSSProperties = Object.assign({
            width: '40px'
        }, this.props.style || {});
        return (
            <img
                src={avatarURL}
                style={style}
                className="login-button-avatar"
                alt={`Avatar for user ${this.props.userProfile.user.username}`}
                data-element="avatar"
            />
        );
    }
}
