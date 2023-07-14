import { JSONValue } from '@kbase/ui-lib/lib/json';
import PresentableJSON from 'components/PresentableJSON';
import { Component, PropsWithChildren } from 'react';
import { Card } from 'react-bootstrap';
import styles from './Error.styles';


export type ErrorViewProps = PropsWithChildren<{
    code: string;
    title: string;
    message: string;
    info?: JSONValue
}>;

export default class ErrorView extends Component<ErrorViewProps> {
    renderInfo() {
        if (typeof this.props.info === 'undefined') {
            return;
        }
        return (
            <>
                <div style={styles.Title}>Additional Info</div>
                <PresentableJSON
                    data={this.props.info}
                    tableStyle=""
                />
            </>
        );
    }
    
    renderDescription(description: Array<string>) {
        return description.map((paragraph, index) => {
            return <div key={index}>{paragraph}</div>;
        });
    }
    renderCode() {
            return <div style={styles.Code}>{this.props.code}</div>
    }
    renderBody() {
      
        return (
            <div>
                {this.renderCode()}
                {/* <div style={styles.Description}>
                    {this.renderDescription(this.props.description)}
                </div> */}
                <div style={styles.Message}>{this.props.message}</div>
                {this.renderInfo()}
            </div>
        );
    }
    render() {
        return (
            <Card title={this.props.title} bg="danger" text="white">
                <Card.Body>
                    <Card.Title>{this.props.title}</Card.Title>
                    {this.renderBody()}
                </Card.Body>
            </Card>
        );
    }
}
