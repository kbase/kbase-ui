import AlertMessage from "components/AlertMessage";
import Well from "components/Well";
import { Component } from "react";
import { Col, Form, Stack } from "react-bootstrap";
import Row from "react-bootstrap/esm/Row";
import { CollapsibleHelp } from "./CollapsibleHelp";

export interface AlertMessageGalleryProps {

}

interface AlertMessageGalleryState {
    showIcon?: boolean;
    showTitle?: boolean;
    title?: string;
    message?: string;
}

export default class AlertMessageGallery extends Component<AlertMessageGalleryProps, AlertMessageGalleryState> {
    constructor(props: AlertMessageGalleryProps) {
        super(props);
        this.state = {
            showIcon: undefined,
            showTitle: undefined,
            title: undefined,
            message: undefined
        }
    }

    render() {
        return <Stack gap={2}>
            <h2>AlertMessage</h2>

            <CollapsibleHelp title="about...">
                <p>
                    The <code>AlertMessage</code> component is a wrapper around the Bootstrap <code>Alert</code> component,
                    adding support for title, icon, and multiple methods of rendering the message.
                </p>
            </CollapsibleHelp>

            <Well variant="primary">
                <Well.Header>
                    <span className="fa fa-arrow-right" /> Props
                </Well.Header>
                <Well.Body>
                    <Stack gap={1}>
                        <Row className="align-items-center">
                            <Col md={2}>Show Title?</Col>
                            <Col md={3}>
                                <Form.Select
                                    value={typeof this.state.showTitle === 'undefined' ? '' : (this.state.showTitle === true ? 't' : 'f')}
                                    onChange={(ev) => {
                                        const showTitle = (() => {
                                            switch (ev.currentTarget.value) {
                                                case "": return undefined;
                                                case "t": return true;
                                                case "f": return false;
                                            }
                                        })();
                                        this.setState({
                                            showTitle
                                        })
                                    }}
                                >
                                    <option value="">undefined</option>
                                    <option value="t">true</option>
                                    <option value="f">false</option>
                                </Form.Select>
                            </Col>
                            <Col>
                                <CollapsibleHelp title="Titles are not show by default">
                                    <p>
                                        A default title will be displayed if the <code>showTitle</code>
                                        prop is set to <code>true</code>. If not set, or set to <code>false</code>,
                                        the default title will not be rendered.
                                    </p>
                                    <p>
                                        Note that setting the title explicitly with the <code>title</code> prop
                                        will disable consideration of the default title.
                                    </p>
                                </CollapsibleHelp>
                            </Col>
                        </Row>
                        <Row className="align-items-center">
                            <Col md={2}>Show Icon?</Col>
                            <Col md={3}>
                                <Form.Select
                                    value={typeof this.state.showIcon === 'undefined' ? '' : (this.state.showIcon === true ? 't' : 'f')}
                                    onChange={(ev) => {
                                        const showIcon = (() => {
                                            switch (ev.currentTarget.value) {
                                                case "": return undefined;
                                                case "t": return true;
                                                case "f": return false;
                                            }
                                        })();
                                        this.setState({
                                            showIcon
                                        })
                                    }}
                                >
                                    <option value="" >undefined</option>
                                    <option value="t">true</option>
                                    <option value="f">false</option>
                                </Form.Select>
                            </Col>
                            <Col>
                                <CollapsibleHelp title="Icons are not shown by default">
                                    <p>
                                        Setting the <code>showIcon</code> prop to true will cause a default
                                        icon to be displayed to the left of the title. This icon will only be
                                        displayed if a title is also being displayed, either with <code>showTitle</code>
                                        or by setting a title with <code>title</code>.
                                    </p>
                                </CollapsibleHelp>
                            </Col>
                        </Row>
                        <Row className="align-items-center">
                            <Col md={2}>Title</Col>
                            <Col md={3}>
                                <Form.Control type="text"
                                    value={this.state.title}
                                    onChange={(ev) => {
                                        this.setState({
                                            title: ev.currentTarget.value.length > 0 ? ev.currentTarget.value : undefined
                                        })
                                    }}
                                />
                            </Col>
                            <Col>
                                <CollapsibleHelp title="Providing a title overrides showTitle prop">
                                    <p>
                                        Setting the <code>title</code> prop will show a title, in bold font,
                                        in the first line of the alert. This overrides the <code>showTitle</code>
                                        prop (see above.)
                                    </p>
                                </CollapsibleHelp>
                            </Col>
                        </Row>
                        <Row className="align-items-center">
                            <Col md={2}>Message</Col>
                            <Col md={3}>
                                <Form.Control type="text"
                                    value={this.state.message}
                                    onChange={(ev) => {
                                        this.setState({
                                            message: ev.currentTarget.value.length > 0 ? ev.currentTarget.value : undefined
                                        })
                                    }}
                                />
                            </Col>
                            <Col>
                                <CollapsibleHelp title="Set the message prop to control the alert message as text">
                                    <p>
                                        The alert message may be provided by a <code>message</code> property, by setting children of the
                                        component, or a <code>render: () =&gt; JSX.Element</code> prop.
                                    </p>
                                    <p>
                                        Note that the <code>message</code> prop sets the alert message as "text" only.
                                        If you need to set styled text (html), set the message as <i>children</i> or use
                                        the <code>render</code> prop.
                                    </p>
                                </CollapsibleHelp>

                            </Col>
                        </Row>
                    </Stack>
                </Well.Body>
            </Well>

            <Well variant="secondary">
                <Well.Header>
                    <span className="fa fa-code" /> Usage
                </Well.Header>
                <Well.Body>
                    <code>
                        &lt;AlertMessage variant="info"
                        {this.state.showTitle ? " showTitle" : ""}
                        {this.state.showIcon ? " showIcon" : ""}
                        {this.state.title ? ` title=\"${this.state.title}\"` : ""}
                        {this.state.message ? ` title=\"${this.state.message}\"` : ""}
                        &gt;
                        {this.state.message ? "" : "Whatever you set as children"}
                        &lt;/AlertMessage&gt;
                    </code>
                </Well.Body>
            </Well>

            <Well variant="success">
                <Well.Header>
                    <span className="fa fa-arrow-left" /> Renderings
                </Well.Header>
                <Well.Body>
                    <Row>
                        <Col>
                            <Stack gap={1}>
                                <AlertMessage variant="info"
                                    showTitle={this.state.showTitle}
                                    showIcon={this.state.showIcon}
                                    title={this.state.title}
                                    message={this.state.message}
                                >
                                    This is an "info" AlertMessage
                                </AlertMessage>

                                <AlertMessage variant="primary"
                                    showTitle={this.state.showTitle}
                                    showIcon={this.state.showIcon}
                                    title={this.state.title}
                                    message={this.state.message}
                                >
                                    This is a "primary" AlertMessage
                                </AlertMessage>

                                <AlertMessage variant="secondary"
                                    showTitle={this.state.showTitle}
                                    showIcon={this.state.showIcon}
                                    title={this.state.title}
                                    message={this.state.message}
                                >
                                    This is a "secondary" AlertMessage
                                </AlertMessage>

                                <AlertMessage variant="success"
                                    showTitle={this.state.showTitle}
                                    showIcon={this.state.showIcon}
                                    title={this.state.title}
                                    message={this.state.message}
                                >
                                    This is a "success" AlertMessage
                                </AlertMessage>
                            </Stack>
                        </Col>
                        <Col>
                            <Stack gap={1}>
                                <AlertMessage variant="light"
                                    showTitle={this.state.showTitle}
                                    showIcon={this.state.showIcon}
                                    title={this.state.title}
                                    message={this.state.message}
                                >
                                    This is a "light" AlertMessage
                                </AlertMessage>

                                <AlertMessage variant="dark"
                                    showTitle={this.state.showTitle}
                                    showIcon={this.state.showIcon}
                                    title={this.state.title}
                                    message={this.state.message}
                                >
                                    This is a "dark" AlertMessage
                                </AlertMessage>

                                <AlertMessage variant="warning"
                                    showTitle={this.state.showTitle}
                                    showIcon={this.state.showIcon}
                                    title={this.state.title}
                                    message={this.state.message}
                                >
                                    This is a "warning" AlertMessage
                                </AlertMessage>

                                <AlertMessage variant="danger"
                                    showTitle={this.state.showTitle}
                                    showIcon={this.state.showIcon}
                                    title={this.state.title}
                                    message={this.state.message}
                                >
                                    This is a "danger" AlertMessage
                                </AlertMessage>
                            </Stack>
                        </Col>
                    </Row>
                </Well.Body>
            </Well>

        </Stack>
    }
}
