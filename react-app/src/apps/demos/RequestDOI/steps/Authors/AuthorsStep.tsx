import { Model } from 'apps/ORCIDLink/Model';
import { Author } from 'apps/ORCIDLink/ORCIDLinkClient';
import Well from 'components/Well';
import { Component } from 'react';
import { Button, Col, Form, Row, Stack } from 'react-bootstrap';
import { FieldState, FieldStatus } from '../../common';
import PrimaryAuthor from './AuthorORCIDController';

export interface AuthorsStepProps {
    model: Model
    narrativeTitle: string;
    setTitle: (title: string) => void;
    onDone: (title: string, author: Author) => void;
}

interface AuthorsStepState {
    fields: {
        title: FieldState<string, string>
        primaryAuthor: FieldState<Author, Author>;
    }
}

export default class AuthorsStep extends Component<AuthorsStepProps, AuthorsStepState> {
    constructor(props: AuthorsStepProps) {
        super(props);
        this.state = {
            fields: {
                title: {
                    status: FieldStatus.INITIAL,
                    rawValue: this.props.narrativeTitle,
                    value: this.props.narrativeTitle
                },
                primaryAuthor: {
                    status: FieldStatus.NONE,
                },
            }
        }
    }

    componentDidMount() {
        this.props.setTitle('ORCID® Link  - Demos - DOI Form - Step 3: Primary and Other Authors');
    }

    // Data 

    // TODO: move into a controller wrapper.

    async importFromORCID() {
        // const profile = await this.props.model.getProfile();
        // const { firstName, lastName, orcidId } = profile;
        // this.setState({
        //     fields: {
        //         ...this.state.fields,

        //     }
        // })
    }

    importFromNarrative() {

    }

    // Handlers

    onInputTitle(value: string) {
        // validate.
        this.setState({
            fields: {
                ...this.state.fields,
                title: {
                    status: FieldStatus.VALID,
                    rawValue: value,
                    value
                }
            }
        })
    }

    onAuthorUpdate(author: Author) {
        this.setState({
            fields: {
                ...this.state.fields,
                primaryAuthor: {
                    status: FieldStatus.VALID,
                    rawValue: author,
                    value: author
                }
            }
        })
    }

    // Renderers

    renderTitleField() {
        switch (this.state.fields.title.status) {
            case FieldStatus.NONE:
                return;
            case FieldStatus.INVALID:
            case FieldStatus.INITIAL:
            case FieldStatus.VALID:
                return <Form.Control
                    type="text"
                    name="title"
                    value={this.state.fields.title.rawValue}
                    onInput={(e) => { this.onInputTitle(e.currentTarget.value); }}
                />
        }
    }

    renderAuthorField() {
        switch (this.state.fields.primaryAuthor.status) {
            case FieldStatus.NONE:
            case FieldStatus.INITIAL:
            case FieldStatus.INVALID:
            case FieldStatus.VALID:
                return <PrimaryAuthor model={this.props.model} onUpdate={this.onAuthorUpdate.bind(this)} />
        }
    }

    onDone() {
        if ((this.state.fields.title.status !== FieldStatus.VALID &&
            this.state.fields.title.status !== FieldStatus.INITIAL) ||
            this.state.fields.primaryAuthor.status !== FieldStatus.VALID) {
            return;
        }
        this.props.onDone(
            this.state.fields.title.value,
            this.state.fields.primaryAuthor.value
        )
    }

    render() {
        return <Stack gap={2} style={{ marginBottom: '1em' }}>
            <Row className="g-0">
                <Col md={2}>
                    Title
                </Col>
                <Col md={10}>
                    {this.renderTitleField()}
                </Col>
            </Row>
            <Row className="g-0">
                <Col md={2}>
                    Primary Author
                </Col>
                <Col md={10}>
                    <Well style={{ padding: '1em' }}>
                        {this.renderAuthorField()}
                    </Well>
                </Col>
            </Row>
            <Row className="g-0">
                <Col md={12}>
                    <Row style={{ justifyContent: 'center' }} className="g-0">
                        <Button variant="primary" className="w-auto" onClick={this.onDone.bind(this)}>Next <span className="fa fa-hand-o-down" /></Button>
                    </Row>
                </Col>
            </Row>
        </Stack>
    }
}