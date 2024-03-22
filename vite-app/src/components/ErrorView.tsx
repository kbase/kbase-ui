import { JSONValue } from '@kbase/ui-lib/lib/json';
import { Component, PropsWithChildren } from 'react';
import { Card } from 'react-bootstrap';
import styles from './ErrorView.module.css';
import PresentableJSON from './PresentableJSON';

export interface ErrorInfo {
    code?: string;
    message: string;
    description: Array<string>;
    info?: JSONValue;
    remedies?: Array<Remedy>;
}

export interface Remedy {
    title: string;
    tooltip?: string;
    description?: Array<string>;
    url?: string;
}

export type ErrorViewProps = PropsWithChildren<{
    title: string;
    errorInfo?: ErrorInfo;
    render?: () => JSX.Element;
}>;

export default class ErrorView extends Component<ErrorViewProps> {
    renderInfo() {
        if (typeof this.props.errorInfo === 'undefined' || !this.props.errorInfo.info) {
            return;
        }
        return (
            <>
                <div className={styles.title}>Additional Info</div>
                <PresentableJSON
                    data={this.props.errorInfo.info}
                    tableStyle=""
                />
            </>
        );
    }
    
    renderRemedies() {
        if (typeof this.props.errorInfo === 'undefined' || !this.props.errorInfo.remedies) {
            return;
        }
        const remedies = this.props.errorInfo.remedies.map((remedy) => {
            if ('url' in remedy) {
                return (
                    <li>
                        <a
                            href={remedy.url}
                            target="_blank"
                            title={remedy.tooltip}
                            rel="noreferrer"
                        >
                            {remedy.title}
                        </a>
                    </li>
                );
            } else {
                return (
                    <li>
                        <span title={remedy.tooltip}>{remedy.title}</span>
                    </li>
                );
            }
        });
        return (
            <>
                <div className={styles.title}>Remedies</div>
                <ul>{remedies}</ul>
            </>
        );
    }

    renderDescription(description: Array<string>) {
        return description.map((paragraph, index) => {
            return <div key={index}>{paragraph}</div>;
        });
    }

    renderCode() {
        if (this.props.errorInfo && this.props.errorInfo.code) {
            return <div className={styles.code}>{this.props.errorInfo.code}</div>
        }
    }

    renderBody() {
        if (this.props.render) {
            return this.props.render();
        }
        if (typeof this.props.errorInfo === 'undefined' || !this.props.errorInfo.message) {
            return this.props.children;
        }
        return (
            <div>
                {this.renderCode()}
                <div className={styles.description}>
                    {this.renderDescription(this.props.errorInfo.description)}
                </div>
                <div className={styles.message}>{this.props.errorInfo.message}</div>
                {this.renderRemedies()}
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
