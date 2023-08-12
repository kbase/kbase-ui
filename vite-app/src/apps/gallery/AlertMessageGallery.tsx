import AlertMessage, { Variant } from "components/AlertMessage";
import Well from "components/Well";
import { Component } from "react";
import { Col, Form, Stack } from "react-bootstrap";
import Row from "react-bootstrap/esm/Row";
import { CollapsibleHelp } from "./CollapsibleHelp";

export interface AlertMessageGalleryProps {

}

type MessageVariant = 'prop' | 'render' | 'body';

interface AlertMessageGalleryState {
    showIcon: boolean;
    showTitle: boolean;
    title: string;
    message: string;
    messageVariant: MessageVariant;
}

export default class AlertMessageGallery extends Component<AlertMessageGalleryProps, AlertMessageGalleryState> {
    constructor(props: AlertMessageGalleryProps) {
        super(props);
        this.state = {
            showIcon: false,
            showTitle: false,
            title: 'title here',
            message: '',
            messageVariant: 'prop'
        }
    }

    renderUsage() {
        const showTitleProp = this.state.showTitle ? " showTitle" : "";
        const showIconProp = this.state.showIcon ? " showIcon" : "";
        const iconProp = this.state.title !== '' ? ` title="${this.state.title}"` : "";
        const messageProp = this.state.messageVariant === 'prop' && this.state.message !== '' ? ` message="${this.state.message}"` : ""
        const messageRender = this.state.messageVariant === 'render' && this.state.message !== '' ? ` render={renderMessage}` : '';
        const messageBody = this.state.messageVariant === 'body' && this.state.message !== '' ? this.state.message : ""

        const usage = `
            <AlertMessage variant="info"
                ${showTitleProp} ${showIconProp} ${iconProp} ${messageProp} ${messageRender}>${messageBody}</AlertMessage>
        `
        return usage;
    }

    renderAlertMessage(variant: Variant) {
        const placeholderMessage = `This is an "${variant}" AlertMessage; enter text into the "Message" input above to replace it.`
        // const message = this.state.message === '' ? defaultMessage : this.state.message;
        const html = (content: string) => {
            return <div dangerouslySetInnerHTML={{ __html: content }} />
        }
        const propMessage = this.state.message !== '' && this.state.messageVariant === 'prop' ? this.state.message : '';
        const bodyMessage = this.state.message !== '' && this.state.messageVariant === 'body' ? html(this.state.message) : null;
        const renderMessage = this.state.message !== '' && this.state.messageVariant === 'render' ? () => html(this.state.message) : undefined;
        const bodyContent = bodyMessage || propMessage || renderMessage ? bodyMessage : placeholderMessage;

        return <AlertMessage
            variant={variant}
            showTitle={this.state.showTitle}
            showIcon={this.state.showIcon}
            title={this.state.title}
            message={propMessage}
            render={renderMessage}
        >
            {bodyContent}
        </AlertMessage>
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
                <Well.Header icon="arrow-right">
                    Props
                </Well.Header>
                <Well.Body>
                    <Stack gap={1}>
                        <Row className="align-items-center">
                            <Col style={{ flex: '0 0 10rem' }}>Show Title?</Col>
                            <Col style={{ flex: '1 1 0' }}>
                                <Form.Check type="checkbox" checked={this.state.showTitle} onChange={() => {
                                    this.setState({
                                        showTitle: !this.state.showTitle
                                    })
                                }} />
                            </Col>
                            <Col style={{ flex: '2 1 0' }}>
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
                            <Col style={{ flex: '0 0 10rem' }}>Show Icon?</Col>
                            <Col style={{ flex: '1 1 0' }}>
                                <Form.Check type="checkbox" checked={this.state.showIcon} onChange={() => {
                                    this.setState({
                                        showIcon: !this.state.showIcon
                                    })
                                }} />
                            </Col>
                            <Col style={{ flex: '2 1 0' }}>
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
                            <Col style={{ flex: '0 0 10rem' }}>Tilte</Col>
                            <Col style={{ flex: '1 1 0' }}>
                                <Form.Control type="text"
                                    value={this.state.title}
                                    onChange={(ev) => {
                                        this.setState({
                                            title: ev.currentTarget.value.length > 0 ? ev.currentTarget.value : ''
                                        })
                                    }}
                                />
                            </Col>
                            <Col style={{ flex: '2 1 0' }}>
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
                            <Col style={{ flex: '0 0 10rem' }}>Message</Col>
                            <Col style={{ flex: '1 1 0' }}>
                                <Form.Control type="text"
                                    value={this.state.message}
                                    onChange={(ev) => {
                                        this.setState({
                                            message: ev.currentTarget.value.length > 0 ? ev.currentTarget.value : ''
                                        })
                                    }}
                                />
                            </Col>
                            <Col style={{ flex: '2 1 0' }}>
                                <CollapsibleHelp title="Messages">
                                    <p>
                                        The alert message may be provided by a <code>message</code> property, by setting children of the
                                        component, or a <code>render: () =&gt; ReactNode</code> prop.
                                    </p>
                                    <p>You can which message content variant is used by selecting the appropriate radio button below.</p>
                                    <p>
                                        Note that each variant (message prop, render prop, body) takes <code>ReactNode</code>, which by definition
                                        supports strings, which are rendered safely as text,  <code>DOM.Element</code>, and other types. Consult
                                        the React documentation for full details; but generally anything you can supply in JSX you can supply to them.
                                    </p>
                                </CollapsibleHelp>
                            </Col>
                        </Row>
                        <Row className="align-items-center">
                            <Col style={{ flex: '0 0 10rem' }}>Message variants</Col>
                            <Col style={{ flex: '1 1 0' }}>
                                <Form.Check inline type="radio" label="message=" value="prop" checked={this.state.messageVariant === 'prop'} name="message-variant" onChange={(ev) => {
                                    const messageVariant: MessageVariant = ev.target.value as unknown as MessageVariant;
                                    this.setState({
                                        messageVariant
                                    })
                                }} />
                                <Form.Check inline type="radio" label="render=" value="render" checked={this.state.messageVariant === 'render'} name="message-variant" onChange={(ev) => {
                                    const messageVariant: MessageVariant = ev.target.value as unknown as MessageVariant;
                                    this.setState({
                                        messageVariant
                                    })
                                }} />
                                <Form.Check inline type="radio" label="body" value="body" checked={this.state.messageVariant === 'body'} name="message-variant" onChange={(ev) => {
                                    const messageVariant: MessageVariant = ev.target.value as unknown as MessageVariant;
                                    this.setState({
                                        messageVariant
                                    })
                                }} />
                            </Col>
                            <Col style={{ flex: '2 1 0' }}>
                                <CollapsibleHelp title="Set the message prop to control the alert message as text">
                                    <dl>
                                        <dt>message</dt>
                                        <dd>The message prop takes a ReactNode, and is appropriate for precomputed content.</dd>

                                        <dt>render</dt>
                                        <dd>The render prop takes a function producing a ReactNode, and is appropriate for dynamically rendered content or when you want
                                            a quick calculation without setting it up before hand (e.g. in a big clump of JSX).
                                        </dd>

                                        <dt>body</dt>
                                        <dd>Supplying a message as the body, or children, is suitable for times when you'd like to compose content in-situ.</dd>

                                    </dl>
                                </CollapsibleHelp>
                            </Col>
                        </Row>
                    </Stack>
                </Well.Body>
            </Well>

            <Well variant="secondary">
                <Well.Header icon="code">
                    Usage
                </Well.Header>
                <Well.Body>
                    <code>
                        {this.renderUsage()}
                    </code>
                </Well.Body>
            </Well>

            <Well variant="success">
                <Well.Header icon="arrow-left">
                    Renderings
                </Well.Header>
                <Well.Body>
                    <Row>
                        <Col>
                            <Stack gap={1}>
                                {this.renderAlertMessage("info")}
                                {this.renderAlertMessage("primary")}
                                {this.renderAlertMessage("secondary")}
                                {this.renderAlertMessage("success")}
                            </Stack>
                        </Col>
                        <Col>
                            <Stack gap={1}>
                                {this.renderAlertMessage("light")}
                                {this.renderAlertMessage("dark")}
                                {this.renderAlertMessage("warning")}
                                {this.renderAlertMessage("danger")}


                            </Stack>
                        </Col>
                    </Row>
                </Well.Body>
            </Well>

        </Stack>
    }
}
