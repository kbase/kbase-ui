import UILink from 'components/UILink2';
import Well from 'components/Well';
import { Component } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { ORCIDLinkPreferences } from '.';

export interface PermissionsViewProps {
  preferences: ORCIDLinkPreferences;
  setPreferences: (value: ORCIDLinkPreferences) => void;
}

export default class PermissionsView extends Component<PermissionsViewProps> {
  onChangeShowInProfile(value: boolean) {
    const newPreferences: ORCIDLinkPreferences = {
      ...this.props.preferences,
      showInProfile: value,
    };
    this.props.setPreferences(newPreferences);
  }

  render() {
    return (
      <Form>
        <Well variant="primary">
          <Well.Header icon="cog">Settings</Well.Header>
          <Well.Body>
            <Container fluid>
              <Row>
                <Col xs={4}>Show in User Profile?</Col>
                <Col xs={2}>
                  <Form.Switch
                    id="show-in-profile"
                    checked={this.props.preferences.showInProfile}
                    onChange={(ev) => {
                      this.onChangeShowInProfile(ev.target.checked);
                    }}
                    label={this.props.preferences.showInProfile ? 'Yes' : 'No'}
                  />
                </Col>
                <Col xs={6}>
                  When enabled your ORCID® iD will be displayed in{' '}
                  <UILink path="people" type="kbaseui" newWindow={true}>
                    your User Profile
                  </UILink>
                  .
                </Col>
              </Row>
            </Container>
          </Well.Body>
        </Well>
      </Form>
    );
  }
}
