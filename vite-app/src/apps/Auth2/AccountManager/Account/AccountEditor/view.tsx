import { notifySuccess } from 'contexts/EuropaContext';
import * as formik from 'formik';
import { FormikHelpers } from 'formik';
import { Component } from "react";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import * as yup from 'yup';
import { AccountEditorFields } from '../controller';

export interface AccountEditorViewProps {
    fields: AccountEditorFields
    save: (fields: AccountEditorFields) => Promise<void>;
}

interface AccountEditorViewState {
}

export default class AccountEditorView extends Component<AccountEditorViewProps, AccountEditorViewState> {
    async onSubmit(fields: AccountEditorFields, {resetForm}: FormikHelpers<AccountEditorFields>) {
        await this.props.save(fields);

        // Okay, this "resets" the form, but keeping the data changed and saved above,
        // thus it doesn't "reset" to the previous state, it just effectively clears the
        // dirty and possibly other flags.
        resetForm({values: fields});

        notifySuccess('Successfully saved changes to your account and profile');
    }

    render() {
        const { Formik } = formik;

        const schema = yup.object().shape({
            realname: yup.string().required().min(2).max(100),
            email: yup.string().required().email()
        })

        return <Formik
            initialValues={{
                realname: this.props.fields.realname,
                email: this.props.fields.email
            }}
            validationSchema={schema}
            onSubmit={this.onSubmit.bind(this)}
        >
            {({ handleSubmit, handleChange, values, errors, dirty, isValid }) => {
                return <Form noValidate onSubmit={(e) => { handleSubmit(e); }} >
                    <Container fluid>
                        <Row className="mb-2">
                            <Form.Group as={Col} md={4} controlId="realname" >
                                <Form.Label role="label">Your Name</Form.Label>
                                <InputGroup hasValidation>
                                    <Form.Control
                                        required
                                        type="text"
                                        onChange={handleChange}
                                        value={values.realname}
                                        isInvalid={!!errors.realname}
                                        placeholder="Your Name"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.realname}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                            <Col>
                                Your real name, displayed to other KBase users
                            </Col>
                        </Row>
                        <Row className="mb-2">
                            <Form.Group as={Col} md={4} controlId="email">
                                <Form.Label role="label">E-Mail Address</Form.Label>
                                <InputGroup hasValidation>
                                    <Form.Control
                                        required
                                        type="text"
                                        onChange={handleChange}
                                        value={values.email}
                                        isInvalid={!!errors.email}
                                        placeholder="Your email address"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                            <Col>
                                Your email address; may be used by KBase staff to contact you.
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Button variant="primary" type="submit" disabled={!(dirty && isValid)}>Save</Button>
                            </Col>
                        </Row>
                    </Container>
                </Form>
            }}
        </Formik>
    }
}