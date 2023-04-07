import Empty from "components/Empty";
import Well from "components/Well";
import { Component } from "react";
import { Col, Form, Stack } from "react-bootstrap";
import Row from "react-bootstrap/esm/Row";
import { CollapsibleHelp } from "./CollapsibleHelp";

export interface EmptyGalleryProps {

}

interface EmptyGalleryState {
    message?: string;
    childrenText?: string;
}



const defaultChildrenString = 'This is a <b>child</b> of the <code>Empty</code> <i>component</i>';


export default class EmptyGallery extends Component<EmptyGalleryProps, EmptyGalleryState> {
    constructor(props: EmptyGalleryProps) {
        super(props);
        this.state = {
            message: undefined,
            childrenText: defaultChildrenString
        }
    }

    render() {
        return <Stack gap={2}>
            <h2>Empty</h2>

            <CollapsibleHelp title="about...">
                <p>
                    The <code>Empty</code> component can be used to indicate that no data is present.
                </p>
            </CollapsibleHelp>

            <Well variant="primary">
                <Well.Header>
                    <span className="fa fa-arrow-right" /> Props
                </Well.Header>
                <Well.Body>
                    <Stack gap={1}>
                        <Row className="align-items-center">
                            <Col md={2}>Message</Col>
                            <Col md={3}>
                                <Form.Control type="text"
                                    value={this.state.message}
                                    onChange={(ev) => {
                                        this.setState({
                                            message: ev.currentTarget.value
                                        })
                                    }}
                                />
                            </Col>
                            <Col>
                                <CollapsibleHelp title="Set the message prop to control the empty message as text">
                                    <p>
                                        The Empty message is provided by a <code>message</code> property
                                    </p>
                                    <p>
                                        Note that the <code>message</code> prop sets the alert message as "text" only.
                                        If you need to set styled text (html), set the message as <i>children</i> or use
                                        the <code>render</code> prop.
                                    </p>
                                </CollapsibleHelp>

                            </Col>
                        </Row><Row className="align-items-center">
                            <Col md={2}>Children</Col>
                            <Col md={3}>
                                <Form.Control type="text" as="textarea"
                                    rows={5}
                                    value={this.state.childrenText}
                                    onChange={(ev) => {
                                        this.setState({
                                            childrenText: ev.currentTarget.value
                                        })
                                    }}
                                />
                            </Col>
                            <Col>
                                <CollapsibleHelp title="Set the children to control the empty message as html">
                                    <p>

                                    </p>
                                    <p>

                                    </p>
                                </CollapsibleHelp>

                            </Col>
                        </Row>
                    </Stack>
                </Well.Body>
            </Well>

            <Well variant="secondary" >
                <Well.Header>
                    <span className="fa fa-code" /> Usage
                </Well.Header>
                <Well.Body>
                    <code>
                        &lt;Empty
                        {this.state.message ? ` message=\"${this.state.message}\"` : ""}
                        &gt;
                        {this.state.childrenText}
                        &lt;/Empty&gt;
                    </code>
                </Well.Body>
            </Well>

            <Well variant="success">
                <Well.Header>
                    <span className="fa fa-arrow-left" /> Renderings
                </Well.Header>
                <Well.Body>
                    <Empty message={this.state.message}>
                        <div dangerouslySetInnerHTML={{ __html: this.state.childrenText || '' }} />
                    </Empty>
                </Well.Body>
            </Well>


        </Stack>
    }
}
