import { Model } from 'apps/ORCIDLink/Model';
import { Component } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Col, Form, Row, Stack } from 'react-bootstrap';
import { FieldState, FieldStatus } from '../common';
import PrimaryAuthor from './AuthorORCIDController';

export interface AuthorsStepProps {
    model: Model
}

interface AuthorsStepState {
    fields: {
        title: FieldState<string>
        primaryAuthor: FieldState<string>;
    }
}

export default class AuthorsStep extends Component<AuthorsStepProps, AuthorsStepState> {
    constructor(props: AuthorsStepProps) {
        super(props);
        this.state = {
            fields: {
                title: {
                    status: FieldStatus.INITIAL,
                    value: ''
                },
                primaryAuthor: {
                    status: FieldStatus.INITIAL,
                    value: ''
                },
            }
        }
    }

    // Data 

    // TODO: move into a controller wrapper.

    async importFromORCID() {
        const profile = await this.props.model.getProfile();
        console.log('got profile...', profile);
        const { firstName, lastName, orcidId } = profile;
        this.setState({
            fields: {
                ...this.state.fields,

            }
        })
    }

    importFromNarrative() {

    }

    // Handlers

    onInputTitle(value: string) {
        // validate.
        this.setState({
            ...this.state,
            fields: {
                ...this.state.fields,
                title: {
                    status: FieldStatus.VALID,
                    value
                }
            }
        })
    }

    // Renderers

    render() {
        return <Stack gap={2}>
            <Row>
                <Col md={2}>
                    Title
                </Col>
                <Col md={10}>
                    <Form.Control
                        type="text"
                        name="title"
                        value={this.state.fields.title.value}
                        onInput={(e) => { this.onInputTitle(e.currentTarget.value); }}
                    />
                </Col>
            </Row>
            <Row>
                <Col md={2}>
                    Primary Author
                </Col>
                <Col md={10}>
                    <PrimaryAuthor model={this.props.model} />
                </Col>
            </Row>

        </Stack>
    }
}