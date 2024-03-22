import { NextRequestObject } from "lib/NextRequest";
import { urlToKBaseUI } from "lib/navigation";
import { Component, Fragment } from "react";
import { Button } from "react-bootstrap";
import { IDProvider } from "types/config";
import Collapsible from "../Collapsible";
import TextSpan from "../TextSpan";

export interface SignInOopsProps {
    provider: IDProvider
    source: string;
    nextRequest?: NextRequestObject    
}

export default class SignInOops extends Component<SignInOopsProps> {
        renderOopsExplanation() {
            const provider = this.props.provider;
            if (this.props.source === 'signin') {
                return <Fragment>
                    <p>
                        If this browser is already signed in to <b>{provider.label}</b >, a sign-in attempt 
                        from KBase will route you to <b>{provider.label}</b> and back again without any warning.
                    </p>
                    <p>
                        If this just happened to you, and the account you see above is not 
                        the one you want, you should use the logout link below to log out  
                        of <b>{provider.label}</b>, and then try again.
                    </p>
                </Fragment>
            }
            return <Fragment>
                <p>
                    If this browser is already signed in to <b>{provider.label}</b>, a sign-in attempt 
                    from KBase will route you to <b>{provider.label}</b> and back again without any warning.
                </p>
                <p>
                    If this just happened to you, and the account you see above is not 
                    the one you want, you should use the link below to log out 
                    of <b>{provider.label}</b>, and then try again.
                </p>
                {/* <p>
                If you have signed in with a <b>{provider.label}</b> account already linked to a KBase account, 
                you will be unable to create a new KBase account using that <b>{provider.label}</b> account.
                </p> */}
            </Fragment>
        }

        render() {
            const explanation = this.renderOopsExplanation();

            const params: Record<string, string> = {};
            if (this.props.nextRequest) {
                params['nextrequest'] = JSON.stringify(this.props.nextRequest);
            }

            const signInURL = urlToKBaseUI({path: 'login', params})

            const provider = this.props.provider;

            // return <Accordion>
            //         <Accordion.Item eventKey="0">
            //          <Accordion.Header>
            //          Not the account you were expecting?
            //          </Accordion.Header>
            //          <Accordion.Body>

            //             {explanation}
            //             <div style={{marginBottom: '5px'}}>
            //                 <Button variant="outline-info" href={provider.logoutUrl} target="_blank">
            //                     <span className="fa fa-external-link"
            //                     style={{
            //                         marginLeft: '10px',
            //                         marginRight: '5px'
            //                     }} />
            //                     Logout from <span className="-textSpan">
            //                         {provider.label}
            //                     </span>
            //                 </Button>
            //             </div>
            //             <p>
            //                 After signing out from  <TextSpan>
            //                     {provider.label}
            //                 </TextSpan> you will need to  
            //                 <Button variant="outline-info" style={{margin: '0 0.3rem'}} href={signInURL.toString()} target="_parent">
            //                         <span className="fa fa-sign-in -textSpan" /> Sign in to KBase
            //                 </Button>
            //                 again.
            //             </p>
            //         </Accordion.Body>
            //         </Accordion.Item>
            //     </Accordion>

            // TODO: improve source with a enum
            const label = (() => {
                switch (this.props.source) {
                    case 'signin': return 'Sign In';
                    case 'signup': return 'Sign Up';
                    default: return 'Sign In';
                }
            })();

            return <Collapsible 
                        variant="warning" 
                        title={<div>Didn't mean to {label} with this <b>{provider.label}</b> account?</div>}
                        render={() => {
                return <>
                {explanation}
                <div style={{marginBottom: '5px'}}>
                    <Button variant="outline-primary" href={provider.logoutUrl} target="_blank">
                        <span className="fa fa-external-link"
                        style={{
                            marginLeft: '10px',
                            marginRight: '5px'
                        }} />
                        Logout from <span className="-textSpan">
                            {provider.label}
                        </span>
                    </Button>
                </div>
                <p>
                    After signing out from 
                    <TextSpan>{provider.label}</TextSpan>
                    you will need to  
                    <Button variant="outline-primary" 
                            style={{margin: '0 0.3rem'}} 
                            href={signInURL.toString()} 
                    >
                            <span className="fa fa-sign-in -textSpan" /> Sign in to KBase
                    </Button>
                    again.
                </p>
                </>
            }} />
        }
    }
