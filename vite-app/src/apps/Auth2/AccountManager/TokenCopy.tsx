import Well from "components/Well";
import { TokenInfoFull } from "lib/kb_lib/Auth2";
import { niceDuration } from "lib/time";
import { Component } from "react";
import { Button, ButtonToolbar } from "react-bootstrap";
import CountdownAlarmClock from "../CountdownAlarmClock";

const DEFAULT_EXPIRES_IN = 300000;

export interface TokenCopyProps {
    newToken: TokenInfoFull;
    expiresIn: number;
    onCopied: () => void;
    onDone: () => void;
    onCopyError: (message: string) => void;
}

export default class TokenCopy extends Component<TokenCopyProps> {
    render() {
        let clipboardButton = null;
        if (navigator && navigator.clipboard) {
            const copyNewToken = async () => {
                try {
                    await navigator.clipboard.writeText(this.props.newToken.token);
                    this.props.onCopied();
                } catch (ex) {
                    console.error(ex);
                    this.props.onCopyError(ex instanceof Error ? ex.message : 'Unknown Error');
                }
            };
            clipboardButton = <Button
                variant="primary"
                onClick={copyNewToken}
            >
                Copy to Clipboard
            </Button>
        }
        return <Well variant="light" className="mt-2">
            <Well.Body>
                <p>
                    New <b>{this.props.newToken.type}</b> token named <b>{this.props.newToken.name}</b> successfully created
                </p>
                <p>
                    Please copy it to a secure location and remove this message.
                </p>
                <p>
                    This message will self-destruct in {' '}
                    <b><CountdownAlarmClock
                        expiresIn={this.props.expiresIn || DEFAULT_EXPIRES_IN}
                        onExpired={this.props.onDone}
                        render={(timeLeft: number) => { return <span>{niceDuration(timeLeft)}</span>; }} /></b>.
                </p>
                <p>
                    New Token <span style={{
                        fontWeight: 'bold',
                        fontSize: '120%',
                        fontFamily: 'monospace'
                    }}>{this.props.newToken.token}</span>
                </p>
                <ButtonToolbar >
                    {clipboardButton}
                    <Button variant="danger"
                        className="ms-2"
                        onClick={this.props.onDone}>
                        Done
                    </Button>
                </ButtonToolbar>
            </Well.Body>
        </Well>
    }
}
