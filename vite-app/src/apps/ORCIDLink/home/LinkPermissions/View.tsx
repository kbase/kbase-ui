import Well from "components/Well";
import { Component } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { ORCIDLinkPreferences } from ".";

export interface PermissionsViewProps {
    preferences: ORCIDLinkPreferences
    setPreferences: (value: ORCIDLinkPreferences) => void;
}

export default class PermissionsView extends Component<PermissionsViewProps> {

    onChangeShowInProfile(value: boolean) {
        const newPreferences: ORCIDLinkPreferences = {
            ...this.props.preferences,
            showInProfile: value
        }
        this.props.setPreferences(newPreferences);
    }

    render() {
        return <Form>
            <Well variant="primary">
                <Well.Header>
                    <span className="fa fa-cog" /> Permissions
                </Well.Header>
                <Well.Body>
                    <Container fluid>
                        <Row>
                            <Col xs={4}>
                                Show in User Profile?
                            </Col>
                            <Col xs={2}>
                                <Form.Switch id="show-in-profile"
                                    checked={this.props.preferences.showInProfile}
                                    onChange={(ev) => { this.onChangeShowInProfile(ev.target.checked) }}
                                    label={this.props.preferences.showInProfile ? "Yes" : "No"}
                                />
                            </Col>
                            <Col xs={6}>
                                When enabled your ORCID Id will be displayed in <a href="/#people" target="_blank">your User Profile</a>.
                            </Col>
                        </Row>
                    </Container>
                </Well.Body>
                {/* <Well.Footer style={{ justifyContent: 'center' }}>
                    <Stack direction="horizontal" gap={3}>
                        <Button variant="outline-primary" onClick={() => { alert('will save') }}>
                            <span className="fa fa-lg fa-save" /> Save
                        </Button>
                        <Button variant="outline-danger" onClick={() => { alert('will reset') }}>
                            <span className="fa fa-lg fa-undo" /> Reset
                        </Button>
                    </Stack>
                </Well.Footer> */}
            </Well>
        </Form>
    }
}