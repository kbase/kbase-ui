import {UserProfile} from '@kbase/ui-lib/lib/comm/coreServices/UserProfile';
import {Component} from 'react';
import { NextRequest } from '../AuthProblem';
import styles from './SigninButton.module.css';

export interface SigninProps {
    isLoginView: boolean;
    nextRequest?: NextRequest;
    bordered?: boolean;
}

interface SigninState {
}

export default class Signin extends Component<SigninProps, SigninState> {

    makeNextRequstFromHere(): NextRequest | null {
        const rawHash = window.location.hash.substring(1);
        if (/auth2/.test(rawHash)) {
            // skip next request...
            return null;
        }
        const currentURL = new URL(window.location.href);
        const path = rawHash.split('/').filter((pathElement) => {
            return pathElement.length > 0;
        })
        const hash = `#${path.join('/')}`;
        return new NextRequest('login', {
            hash,
            path,
            query: currentURL.searchParams,
            realPath: currentURL.pathname
        })
    }


    render() {
        const url = new URL(window.location.href);
        url.pathname = '';
        url.hash = '#login';

        const nextRequest = this.props.nextRequest || this.makeNextRequstFromHere();
        if (nextRequest) {
            for (const [key, value] of nextRequest.toSearchParams()) {
                url.searchParams.set(key, value);
            }
        }

        const classList = [styles.main];
        if (this.props.bordered) {
            classList.push(styles.bordered);
        }
        if (this.props.isLoginView) {
            classList.push(styles.disabled);
            return (
                <span
                    className={classList.join(' ')}
                    data-k-b-testhook-widget="signin"
                    data-button="signin"
                    data-k-b-testhook-button="signin"
                >
                    <span className={`fa fa-sign-in fa-inverse ${styles.iconDisabled}`} />
                    <span>Sign In</span>
                </span>
            );

        } 
        return (
            <a
                className={classList.join(' ')}
                data-k-b-testhook-widget="signin"
                data-button="signin"
                data-k-b-testhook-button="signin"
                href={url.toString()}
            >
                <span className={`fa fa-sign-in fa-inverse ${styles.iconNormal}`} />
                <span>Sign In</span>
            </a>
        );
    }
}
