import AlertMessage from 'components/AlertMessage';
import UILink from 'components/UILink2';
import Well from 'components/Well';
import { UserProfile } from 'lib/kb_lib/comm/coreServices/UserProfile';
import { Component } from 'react';
import { Button, Col, Container, Row, Stack } from 'react-bootstrap';
import { renderORCIDIcon } from '../common';
import { ReturnInstruction } from '../lib/ORCIDLinkClient';
import { ContinueLinkingError, ErrorType } from './ContinueController';

export interface ErrorViewProps {
  error: ContinueLinkingError;
  returnInstruction?: ReturnInstruction;
  cancelLink: () => Promise<void>;
}

export default class ErrorView extends Component<ErrorViewProps> {
  renderORCIDUserRecord({ orcid, name }: { orcid: string; name: string }, orcidSiteURL: string) {
    return (
      <Well variant="light">
        <Well.Body>
          <Container fluid>
            <Row>
              <Col style={{ flex: '0 0 11rem' }} className="fw-bold text-secondary">
                ORCID® iD
              </Col>
              <Col md="auto">
                <div className="flex-row" style={{ alignItems: 'center' }}>
                  <a href={`${orcidSiteURL}/${orcid}`} target="_blank">
                    {renderORCIDIcon()}
                    {orcid}
                  </a>
                </div>
              </Col>
            </Row>
            <Row>
              <Col style={{ flex: '0 0 11rem' }} className="fw-bold text-secondary">
                Name on Account
              </Col>
              <Col md="auto">{name ? name : '<not public>'}</Col>
            </Row>
          </Container>
        </Well.Body>
      </Well>
    );
  }

  renderReturnInstruction() {
    const returnInstruction = this.props.returnInstruction;
    if (typeof returnInstruction === 'undefined') {
      return;
    }
    return (
      <AlertMessage variant="info" style={{ marginTop: '1em' }}>
        After closing this error message, your browser will be returned to <b>{returnInstruction.label}</b>.
      </AlertMessage>
    );
    // switch (returnInstruction.type) {
    //     case 'link':
    //         return (
    //             <AlertMessage variant="info" style={{ marginTop: '1em' }}>
    //                 After closing this error message, your browser will be returned to{' '}
    //                 <b>{returnInstruction.label}</b>.
    //             </AlertMessage>
    //         );
    //     case 'window':
    //         return (
    //             <AlertMessage variant="info" style={{ marginTop: '1em' }}>
    //                 After closing this error message, this window will be closed, and you should be returned to{' '}
    //                 <b>{returnInstruction.label}</b>.
    //             </AlertMessage>
    //         );
    // }
  }

  renderMiniUserProfile(userProfile: UserProfile) {
    return (
      <Well variant="light">
        <Well.Body>
          <Container fluid>
            <Row>
              <Col style={{ flex: '0 0 11rem' }} className="fw-bold text-secondary">
                Username
              </Col>
              <Col md="auto">
                <div className="flex-row" style={{ alignItems: 'center' }}>
                  <UILink path={`people/${userProfile.user.username}`} type="kbaseui" newWindow={true}>
                    {userProfile.user.username}
                  </UILink>
                </div>
              </Col>
            </Row>
            <Row>
              <Col style={{ flex: '0 0 11rem' }} className="fw-bold text-secondary">
                Display Name
              </Col>
              <Col md="auto">{userProfile.user.realname}</Col>
            </Row>
          </Container>
        </Well.Body>
      </Well>
    );
  }

  renderError() {
    switch (this.props.error.type) {
      case ErrorType.ALREADY_LINKED:
        return (
          <div>
            <p>Your KBase account is already linked to the following ORCID® account:</p>
            {this.renderORCIDUserRecord(
              this.props.error.link.orcid_auth,
              this.props.error.serviceInfo.runtime_info.orcid_site_url,
            )}
            <p style={{ marginTop: '1em' }}>Each KBase account may only be linked to a single ORCID® account.</p>
            <p>Conversely, an ORCID® account may be linked to only one KBase account.</p>
          </div>
        );
      // case ErrorType.ORCID_ALREADY_LINKED:
      //     return <div>
      //         <p>A KBase account is already linked to the KBase ORCID® Link you have selected.</p>

      //         <p>The ORCID® Account is:</p>
      //         {this.renderORCIDUserRecord(this.props.error.info.orcid)}

      //         <p className="mt-3">The KBase account is:</p>
      //         {this.renderMiniUserProfile(this.props.error.info.kbase.userProfile)}
      //         <p style={{ marginTop: '1em' }}>An ORCID® account may be linked to only a single KBase account.</p>
      //         <p>Conversely, a KBase account may only be linked to a single ORCID® Account.</p>
      //     </div>
      case ErrorType.FETCH_LINK_SESSION_ERROR:
        return (
          <div>
            {this.props.error.message}
            {this.renderReturnInstruction()}
          </div>
        );
      case ErrorType.SESSION_EXPIRED:
        return (
          <div>
            {this.props.error.message}
            {this.renderReturnInstruction()}
          </div>
        );
    }
  }

  render() {
    return (
      <Well variant="danger">
        <Well.Header>Link Confirmation Error</Well.Header>
        <Well.Body>{this.renderError()}</Well.Body>
        <Well.Footer>
          <Stack direction="horizontal" gap={3} className="justify-content-center" style={{ flex: '1 1 0' }}>
            <Button variant="danger" onClick={this.props.cancelLink}>
              <span className="fa fa-lg fa-mail-reply" /> Done
            </Button>
          </Stack>
        </Well.Footer>
      </Well>
    );
  }
}
