import CountdownClock from 'components/CountdownClock';
import { LinkChoice } from 'lib/kb_lib/Auth2';
import { Component } from 'react';
import { Alert } from 'react-bootstrap';
import TextSpan from '../TextSpan';
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

        return (
            <Alert variant="warning">
                You have{' '}
                <TextSpan bold>
                    <CountdownClock
                        endAt={
                            this.props.choice.expires +
                            this.props.serverTimeOffset
                        }
                        startAt={Date.now()}
                        onExpired={this.props.cancelChoiceSession}
                    />
                </TextSpan>{' '}
                to complete linking.
            </Alert>
        );
    }
}
