import { JSONValue } from '@kbase/ui-lib/lib/json';
import PresentableJSON from 'components/PresentableJSON';
import Well from 'components/Well';
import { changeHash2 } from 'lib/navigation';
import { Component, PropsWithChildren } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import styles from '../Error.styles';
import { ErrorInfo } from '../lib/ORCIDLinkClient';


export type ErrorViewProps = PropsWithChildren<{
    errorCode: number;
    errorInfo: ErrorInfo;
    title: string;
    message: string;
    setTitle: (title: string) => void;
    info?: JSONValue
}>;

export default class ErrorView extends Component<ErrorViewProps> {
    componentDidMount() {
        this.props.setTitle('ORCID Link - Error');

        // TODO: need a controller!

    }

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

    renderErrorInfo() {
        const { code, title, description } = this.props.errorInfo;
        return <Container fluid>
            <Row>
                <Col className="fw-bold text-secondary" style={{ flex: '0 0 7rem' }}>
                    Error Code
                </Col>
                <Col md="auto">
                    {code}
                </Col>
            </Row>
            <Row>
                <Col className="fw-bold text-secondary" style={{ flex: '0 0 7rem' }}>
                    Title
                </Col>
                <Col md="auto">
                    {title}
                </Col>
            </Row>
            <Row>
                <Col className="fw-bold text-secondary" style={{ flex: '0 0 7rem' }}>
                    Description
                </Col>
                <Col md="auto">
                    {description}
                </Col>
            </Row>
        </Container>
    }

    onClose() {
        changeHash2("orcidlink");
    }

    renderDescription(description: Array<string>) {
        return description.map((paragraph, index) => {
            return <div key={index}>{paragraph}</div>;
        });
    }
    renderCode() {
        return <div style={styles.Code}>Error Code: {this.props.errorCode}</div>
    }
    renderBody() {
        return (
            <div>
                {/* <div style={styles.Description}>
                    {this.renderDescription(this.props.description)}
                </div> */}
                <div style={styles.Message}>
                    {this.props.message}
                </div>
                <hr />
                {this.renderErrorInfo()}
            </div>
        );
    }
    render() {
        return (
            <Well variant="danger">
                <Well.Header>
                    {this.props.title}
                </Well.Header>
                <Well.Body>
                    {this.renderBody()}
                </Well.Body>
                <Well.Footer>
                    <Button variant="primary" onClick={this.onClose.bind(this)}>
                        <span className="fa fa-mail-reply" /> Done
                    </Button>
                </Well.Footer>
            </Well>
        );
    }
}
