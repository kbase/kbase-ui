import CountdownClock from "components/CountdownClock";
import { LinkChoice } from "lib/kb_lib/Auth2";
import { Component } from "react";
import { Alert } from "react-bootstrap";
import TextSpan from "../TextSpan";
import './ContinueHeader.css';

export interface ContinueHeaderProps {
    choice: LinkChoice;
    serverTimeOffset: number;
    name: string;
    cancelChoiceSession: () => void;
}

export default class ContinueHeader extends Component<ContinueHeaderProps> {
    render() {
        if (this.props.choice === null) {
            return;
        }
        // const render = (remainingTime: number) => {
        //     if (remainingTime > 0) {
        //         return <div style={{ textAlign: 'right' }}>
        //             <Alert variant="warning">
        //                 <div>
        //                     You have
        //                     <TextSpan>${niceDuration(remainingTime)}</TextSpan>
        //                     to complete ${this.props.name}.
        //                 </div>
        //             </Alert>
        //         </div>
        //     }
        // };

        // return <div className="ContinueHeader">
        //         <div className="-col1">
        //         </div>
        //         <div className="-col2">
        //             {/* <CountdownAlarmClock 
        //                 expiresAt=${this.props.choice.expires + this.props.serverTimeOffset}
        //                 render=${render} 
        //                 onExpired=${this.props.cancelChoiceSession}
        //             /> */}
        //             You have <b><CountdownClock 
        //                 endAt={this.props.choice.expires + this.props.serverTimeOffset} 
        //                 startAt={Date.now()}
        //                 onExpired={this.props.cancelChoiceSession}
        //             /></b>{' '}to complete sign-in.
        //         </div>
        //     </div>

        return <Alert variant="warning">
                You have <TextSpan bold><CountdownClock
                    endAt={this.props.choice.expires + this.props.serverTimeOffset}
                    startAt={Date.now()}
                    onExpired={this.props.cancelChoiceSession}
                /></TextSpan> to complete sign-in.
        </Alert>
    }
}