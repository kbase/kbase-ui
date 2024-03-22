import { Account } from "lib/kb_lib/Auth2";
import { niceRelativeTime, niceTime } from "lib/time";
import { Component } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";

export interface AccountInfoViewProps {
    account: Account
}

export default class AccountInfoView extends Component<AccountInfoViewProps> {
    render() {
        const {user,  created, lastlogin} = this.props.account;
        return <Container fluid>
            <Row className="mb-2">
                <Col md={4}>
                    <Form.Label htmlFor="username" role="label" style={{marginBottom: '0'}}>Username</Form.Label>
                    <div id="username">{user}</div>
                </Col>
                <Col md={8}>
                    <Row>
                        Your permanent identifier within KBase
                    </Row>
                </Col>
            </Row>
            {/* <Row className="mb-2">
                <Col md={4}>
                    <Form.Label htmlFor="email" role="label" style={{marginBottom: '0'}}>Name</Form.Label>
                    <div id="realname">{display}</div>
                </Col>
                <Col md={8}>k
                    <Row>
                        The name you provided at signup to show to other users.
                    </Row>
                </Col>
            </Row> */}
            {/* <Row className="mb-2">
                <Col md={4}>
                    <Form.Label htmlFor="email" role="label" style={{marginBottom: '0'}}>E-Mail</Form.Label>
                    <div id="email">{email}</div>
                </Col>
                <Col md={8}>
                    <Row >
                        The email address you provided at signup.
                    </Row>
                </Col>
            </Row> */}
            <Row className="mb-2">
                <Col md={4}>
                    <Form.Label htmlFor="created" role="label" style={{marginBottom: '0'}}>Account Created</Form.Label>
                    <div id="created">{niceTime(new Date(created))}</div>
                </Col>
                <Col md={8}>
                    <Row>
                        When you signed up for KBase
                    </Row>
                </Col>
            </Row>
            <Row className="mb-2">
                <Col md={4}>
                    <Form.Label htmlFor="lastSignedIn" role="label" style={{marginBottom: '0'}}>Last Sign In</Form.Label>
                    <div id="lastSignedIn">{niceRelativeTime(new Date(lastlogin))} ({niceTime(new Date(lastlogin))})</div>
                </Col>
                <Col md={8}>
                    <Row>
                        When you last signed in to KBase
                    </Row>
                </Col>
            </Row>
        </Container>
    }
}
