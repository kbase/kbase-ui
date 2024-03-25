import { AuthenticationStateAuthenticated } from "contexts/EuropaContext";
import { Component } from "react";
import { Config } from "types/config";
import AccountEditorView from "./view";

export interface AccountEditorControllerProps {
    authState: AuthenticationStateAuthenticated,
    config: Config,
    setTitle: (title: string) => void;
}

import ErrorAlert from "components/ErrorAlert";
import Loading from "components/Loading";
// import { AsyncProcess, AsyncProcessStatus } from "lib/AsyncProcess";
import { SimpleError } from 'lib/SimpleError';
import { Account, Auth2 } from "lib/kb_lib/Auth2";
import UserProfile from "lib/kb_lib/comm/coreServices/UserProfile";


import { RepeatAsyncProcess, RepeatAsyncProcessStatus } from "lib/RepeatableAsyncProcess";
import { Md5 } from 'ts-md5';

export interface AccountEditorFields {
    realname: string;
    email: string;
}

export interface AccountEditor {
    fields: AccountEditorFields;
    account: Account
}

type AccountEditorControllerState = RepeatAsyncProcess<AccountEditor, SimpleError>;

export default class AccountEditorController extends Component<AccountEditorControllerProps, AccountEditorControllerState> {
    constructor(props: AccountEditorControllerProps) {
        super(props);
        this.state = {
            status: RepeatAsyncProcessStatus.NONE
        };
    }

    componentDidMount() {
        this.props.setTitle('Account Manager - Update Your Account');
        this.loadData();
    }

    async save({email, realname}: AccountEditorFields) {
        const {authInfo: {token, account: {user: username}}} = this.props.authState;
        const {services: {Auth2: {url: authURL}, UserProfile: {url: userProfileURL}}} = this.props.config;
        const userProfileClient = new UserProfile({
            url: userProfileURL, 
            token,
            timeout: 1000 // TODO: get from config
        });
        const authClient = new Auth2({
            baseUrl: authURL
        });

        const profile = (await userProfileClient.get_user_profile([username]))[0];

        // Extract field values from form

        const hashedEmail = Md5.hashStr(email.trim().toLowerCase());
        profile.profile.synced.gravatarHash = hashedEmail;
        profile.user.realname = realname;

        // Auth2 params
        const meData = {
            email, display: realname
        };

        await Promise.all([
            authClient.putMe(token, meData),
            userProfileClient.set_user_profile({
                profile
            })
        ]);

        await this.reloadData();

        // return {email: account?.email, realname: account?.display};

        // TODO: is this still implemented?
        // this.props.runtime.send('profile', 'reload');

        // this.props.runtime.notifySuccess(
        //     'Successfully updated your account and user profile',
        //     3000
        // );
    }

    async fetchData() {
        const {authInfo: {token}} = this.props.authState;
        const {services: {Auth2: {url: authURL}}} = this.props.config;
        const auth2 = new Auth2({
            baseUrl: authURL
        });
        const account = await auth2.getMe(token);
        return account;
    }

    async loadData() {
        this.setState({
            status: RepeatAsyncProcessStatus.PENDING
        });
      

        try {
            const account = await this.fetchData();
            const {display, email} = await this.fetchData();
            this.setState({
                status: RepeatAsyncProcessStatus.SUCCESS,
                value: {
                    fields: {
                        realname: display,
                        email
                    },
                    account
                }
            });

        } catch (ex) {
            this.setState({
                status: RepeatAsyncProcessStatus.ERROR,
                error: {
                    message: ex instanceof Error ? ex.message : 'Unknown Error'
                }
            });
        }
    }



    async reloadData() {
        this.setState({
            status: RepeatAsyncProcessStatus.SUCCESS_PENDING
        });
      

        try {
            const account = await this.fetchData();
            const {display, email} = await this.fetchData();
            this.setState({
                status: RepeatAsyncProcessStatus.SUCCESS,
                value: {
                    fields: {
                        realname: display,
                        email
                    },
                    account
                }
            });
            // return account;
        } catch (ex) {
            this.setState({
                status: RepeatAsyncProcessStatus.ERROR,
                error: {
                    message: ex instanceof Error ? ex.message : 'Unknown Error'
                }
            });
        }
    }

    renderSuccess(value: AccountEditor) {
        return <AccountEditorView 
            account={value.account}
            fields={value.fields}
            save={this.save.bind(this)} 
        />;
    }

    render() {
        switch (this.state.status) {
        case RepeatAsyncProcessStatus.NONE:
        case RepeatAsyncProcessStatus.PENDING:
            return <Loading message="Loading Account Editor..." />
        case RepeatAsyncProcessStatus.SUCCESS:
            case RepeatAsyncProcessStatus.SUCCESS_PENDING:
            return this.renderSuccess(this.state.value);
        case RepeatAsyncProcessStatus.ERROR:
            return <ErrorAlert message={this.state.error.message} />
        }
    }
}
