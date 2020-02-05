define([
    'preact',
    'htm',

    // for effect
    'bootstrap'
], (
    preact,
    htm
) => {
    'use strict';

    const { h, Component } = preact;
    const html = htm.bind(h);

    class Signin extends Component {
        constructor(props) {
            super(props);
        }

        buildAvatarUrl(profile) {
            switch (profile.profile.userdata.avatarOption || 'gravatar') {
            case 'gravatar':
                var gravatarDefault = profile.profile.userdata.gravatarDefault || 'identicon';
                var gravatarHash = profile.profile.synced.gravatarHash;
                if (gravatarHash) {
                    return (
                        'https://www.gravatar.com/avatar/' + gravatarHash + '?s=32&amp;r=pg&d=' + gravatarDefault
                    );
                } else {
                    return this.props.imagePath + '/nouserpic.png';
                }
            case 'silhouette':
            case 'mysteryman':
            default:
                return this.props.imagePath + '/nouserpic.png';
            }
        }

        renderAvatar() {
            if (!this.props.profile) {
                console.warn('no profile?');
                return '';
            }
            const avatarURL = this.buildAvatarUrl(this.props.profile);

            return html`
                <img
                    src="${avatarURL}"
                    style="width: 40px;"
                    class="login-button-avatar"
                    data-element= "avatar" />
            `;
        }

        handleSignout(e) {
            e.preventDefault();
            this.props.signout();
        }

        renderMenu() {
            return html`
                <ul class="dropdown-menu"
                    role="menu">
                    <li>
                        <div style="text-align: center;"
                                data-element="user-label"> 
                            <div data-k-b-testhook-label="realname">
                                ${this.props.profile.user.realname}
                            </div>
                            <div data-k-b-testhook-label="username"
                                 style="font-style: italic;">
                                ${this.props.profile.user.username}
                            </div>
                        </div>
                    </li>
                    <li class="divider"></li>
                    <li>
                        <a href="/#people"
                           data-menu-item="user-profile"
                           data-k-b-testhook-button="user-profile"
                           style="display: flex; flex-direction: row; align-items: center;">
                            <div style="flex: 0 0 34px;">
                                <span class="fa fa-user"
                                      style="font-size: 150%;"></span>
                            </div>
                            <div style="flex: 1 1 0px;">
                                Your Profile
                            </div>
                        </a>
                    </li>
                    <li>
                        <a href="#"
                           data-menu-item="logout"
                           data-k-b-testhook-button="logout"
                           onClick=${this.handleSignout.bind(this)}
                           style="display: flex; flex-direction: row; align-items: center;">
                            <div style="flex: 0 0 34px;">
                                <span class="fa fa-sign-out"
                                      style="font-size: 150%;"></span>
                            </div>
                            <div style="flex: 1 1 0px;">
                                Sign Out
                            </div>
                        </a>
                    </li>
                </ul>
            `;
        }

        renderLoggedIn() {
            return html`
                <div class="navbar container-fluid">
                    <div class="navbar-right">
                        <div class="dropdown"
                            style="display: inline-block" 
                            data-k-b-testhook-menu="signed-in">
                            <button
                                type="button"
                                class="btn btn-default dropdown-toggle"
                                data-toggle="dropdown"
                                aria-expanded="false"
                                data-k-b-testhook-button="avatar">
                                ${this.renderAvatar()}
                                <span
                                    class="caret"
                                    style="margin-left: 5px;"></span>
                            </button>
                            ${this.renderMenu()}
                        </div>
                    </div>
                </div>
            `;
        }

        renderNotLoggedIn() {
            return html`
                <span data-k-b-testhook-widget="signin">
                    <a class="btn btn-primary navbar-btn kb-nav-btn"
                       disabled=${this.props.isLoginView}
                       dataButton="signin"
                       data-k-b-testhook-button="signin"
                       href="/#login">
                       <div class="fa fa-sign-in fa-inverse"
                            style="margin-right: 5px;">
                       </div>
                       <div class="kb-nav-btn-txt">
                           Sign In
                       </div>
                    </a>
                </span>
            `;
        }

        render() {
            if (this.props.profile) {
                return this.renderLoggedIn();
            } else {
                return this.renderNotLoggedIn();
            }
        }

    }

    return Signin;
});
