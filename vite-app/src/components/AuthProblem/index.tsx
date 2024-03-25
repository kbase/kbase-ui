import { HashPath } from 'contexts/RouterContext';
import { nextRequestFromCurrentURL } from 'lib/NextRequest';
import { navigate } from 'lib/navigation';
import { Component } from 'react';
import HelpLinks from '../HelpLinks';
import './AuthProblem.css';


export interface AuthProblemProps {
    // config: Config;
    // realPath: string;
    hashPath: HashPath;
    // params: URLSearchParams;
    message: string;
    // setTitle: (title: string) => void;
}

interface AuthProblemState {
    redirecting: boolean;
}

export default class AuthProblem extends Component<AuthProblemProps, AuthProblemState> {
    constructor(props: AuthProblemProps) {
        super(props);
        this.state = {
            redirecting: false
        }
    }
    componentDidMount() {
        // this.props.setTitle(`Auth Problem - ${this.props.hashPath}`);
    }

    /**
     * Given that the browser is sitting on an "auth problem" - which boils down to
     * simply there is no authorization but the route requires it - we capture the
     * currently resolved route (as a "hash path" object), convert it to a "nextrequest"
     * object to be routed in the authorization flow within the state parameter.
     */
    redirectToLogin() {

        // const {hash, params} = urlToHashPath(new URL(window.location.href));

        // const nextRequest: NextRequestObject = {
        //     hash, params
        // }

        // OR

        const nextRequest = nextRequestFromCurrentURL();

        // const nextRequest: NextRequest = new NextRequest('authorization', this.props.hashPath);

        // const url = new URL(window.location.href);
        // url.pathname = '';
        // url.hash = '#login';

        // for (const [key, value] of nextRequest.toSearchParams()) {
        //     url.searchParams.set(key, value);
        // }

        navigate('login', {params: {nextrequest: JSON.stringify(nextRequest)}});
    }

    renderAuthProblem() {
        // const nextRequest = new NextRequest('authorization', this.props.hashPath);

        // const url = new URL(window.location.href);
        // url.pathname = '';
        // url.hash = '#login';

        // for (const [key, value] of nextRequest.toSearchParams()) {
        //     url.searchParams.set(key, value);
        // }
        // const nextRequest = nextRequestFromURL(new URL(window.location.href));

        return (
            <div className="AuthProblem" >
                <div className="AuthProblem-graphic">
                    {/* <img src={flapjack} alt="The Flapjack"/> */}
                    <span className="fa fa-lock" style={{ fontSize: '600%' }} />
                </div>
                <div className="AuthProblem-content">
                    <div className="AuthProblem-header" style={{ flex: '1 1 0px' }}>
                        <p>
                            Authentication Required
                        </p>

                    </div>
                    <div className="AuthProblem-message" style={{ flex: '1 1 0px' }}>
                        <p>
                            Sorry, the resource <em>"{this.props.hashPath.hash}"</em> requires that you be logged into KBase.
                        </p>

                        <p>You may use the <b>Sign In</b> button on the upper right of this page. After logging in you will be returned to this page.</p>
                    </div>
                    <div className="AuthProblem-body">
                        <hr></hr>
                        <HelpLinks />
                    </div>
                </div>
            </div>
        );
    }

    render() {
        // return <div style={{margin: '0 10px'}}>{this.renderAuthProblem()}</div>;
        this.redirectToLogin();
        return null;
    }
}
