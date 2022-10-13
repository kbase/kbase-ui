import { NextRequest } from 'lib/NextRequest';
import { HashPath } from 'contexts/RouterContext';
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
}

export default class NotFound extends Component<AuthProblemProps, AuthProblemState> {
    componentDidMount() {
        // this.props.setTitle(`Auth Problem - ${this.props.hashPath}`);
    }

    redirectToLogin() {
        const nextRequest: NextRequest = new NextRequest('authorization', this.props.hashPath);

        const url = new URL(window.location.href);
        url.pathname = '';
        url.hash = '#login';

        for (const [key, value] of nextRequest.toSearchParams()) {
            url.searchParams.set(key, value);
        }
        window.location.href = url.toString();
    }

    renderAuthProblem() {
        const nextRequest: NextRequest = new NextRequest('authorization', this.props.hashPath);

        const url = new URL(window.location.href);
        url.pathname = '';
        url.hash = '#login';

        for (const [key, value] of nextRequest.toSearchParams()) {
            url.searchParams.set(key, value);
        }

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
