import { Component } from 'react';
import OrganizationsClient, {
    GroupInfo,
    GroupIdentity,
} from '../../../utils/OrganizationsClient';
import NarrativeModel from '../../../utils/NarrativeModel';
import OrgSelect from './OrgSelect';
import Model, { LinkOrgResult } from './Model';
import {
    AsyncProcess,
    AsyncProcessError,
    AsyncProcessStatus,
    AsyncProcessSuccess,
} from '../../../../../lib/AsyncProcess';
import { ControlMenuItemProps } from './ToolMenu';
import Loading from '../../../../../components/Loading';
import MessageAlert from '../../../../../components/AlertMessage';
import ErrorMessage from '../../../../../components/ErrorMessage';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import React from 'react';

interface LinkOrgState {
    perm: string;
    linkedOrgs: Array<GroupInfo>;
    userOrgs: Array<GroupIdentity>;
}

interface LinkOrgItemState {
    loadProcess: AsyncProcess<LinkOrgState, string>;
    linkProcess: AsyncProcess<LinkOrgResult, string>;
}

export default class LinkOrgItem extends Component<
    ControlMenuItemProps,
    LinkOrgItemState
> {
    constructor(props: ControlMenuItemProps) {
        super(props);
        this.state = {
            loadProcess: { status: AsyncProcessStatus.NONE },
            linkProcess: { status: AsyncProcessStatus.NONE },
        };
    }

    /**
     * Once the component mounts, it should look up the user's permissions
     * on the Narrative, the list of orgs that the user belongs to, and any orgs
     * that the Narrative is already linked to.
     *
     * Next, it filters the user's orgs to remove those that overlap with the orgs
     * that this Narrative is linked to - so they don't show up in the dropdown
     * selector.
     */
    async componentDidMount() {
        this.updateState();
    }

    async updateState() {
        this.setState({
            loadProcess: {
                status: AsyncProcessStatus.PENDING,
            },
        });
        try {
            const narrativeModel = new NarrativeModel({
                workspaceURL: this.props.config.services.Workspace.url,
                token: this.props.authInfo.token,
            });
            const perm = await narrativeModel.getUserPermission(
                this.props.narrative.access_group,
                this.props.authInfo.account.user
            );

            const organizationsClient = new OrganizationsClient({
                groupsURL: this.props.config.services.Groups.url,
                token: this.props.authInfo.token,
            });

            const linkedOrgs = await organizationsClient.getLinkedOrgs(
                this.props.narrative.access_group
            );

            const linkedOrgIds: Set<string> = new Set();
            for (const org of linkedOrgs) {
                linkedOrgIds.add(org.id);
            }

            // reduce the set of userOrgs down to those that are not already linked.
            // Don't want to give the illusion of being able to link again.
            const userOrgs = (
                await organizationsClient.lookupUserOrgs()
            ).filter((org) => {
                return !linkedOrgIds.has(org.id);
            });

            this.setState({
                loadProcess: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        perm,
                        linkedOrgs,
                        userOrgs,
                    },
                },
            });
        } catch (ex) {
            const message = (() => {
                if (ex instanceof Error) {
                    return ex.message;
                }
                return 'Unknown error';
            })();
            this.setState({
                loadProcess: {
                    status: AsyncProcessStatus.ERROR,
                    error: message,
                },
            });
        }
    }

    async doLinkOrg(orgId: string): Promise<void> {
        this.setState({
            linkProcess: {
                status: AsyncProcessStatus.PENDING,
            },
        });
        try {
            const result = await new Model({
                authInfo: this.props.authInfo,
                narrativeId: this.props.narrative.access_group,
                config: this.props.config,
            }).linkOrg(orgId);
            this.setState(
                {
                    linkProcess: {
                        status: AsyncProcessStatus.SUCCESS,
                        value: result,
                    },
                },
                () => {
                    this.updateState();
                }
            );
        } catch (ex) {
            const message = (() => {
                if (ex instanceof Error) {
                    return ex.message;
                }
                return 'Unknown error';
            })();
            this.setState({
                linkProcess: {
                    status: AsyncProcessStatus.ERROR,
                    error: message,
                },
            });
        }
    }

    makeLinkedOrgsList(state: LinkOrgState) {
        const renderLinkedOrgs = () => {
            if (state.linkedOrgs.length === 0) {
                return (
                    <p style={{ fontStyle: 'italic', textAlign: 'center' }}>
                        This Narrative is not linked to any organizations.
                    </p>
                );
            }
            return state.linkedOrgs.map((org: GroupInfo) => (
                <LinkedOrg {...org} key={org.id} />
            ));
        };

        return (
            <div className="well mt-3">
                <div className="well-header">
                    Organizations this Narrative is Linked to
                </div>
                <div className="well-body">{renderLinkedOrgs()}</div>
            </div>
        );
    }

    renderPending() {
        return this.renderModal(
            <p>
                <Loading message="Loading..." size="small" type="inline" />
            </p>
        );
    }

    renderLinkPending() {
        return this.renderModal(
            <p>
                <Loading message="Linking..." size="small" type="inline" />
            </p>
        );
    }

    renderLoadError(loadProcess: AsyncProcessError<string>) {
        return this.renderModal(<ErrorMessage message={loadProcess.error} />);
    }

    renderErrorMessage(message: string) {
        return <ErrorMessage message={message} />;
    }

    renderWarningMessage(message: string) {
        return <MessageAlert type="warning" message={message} />;
    }

    renderLinkError(linkProcess: AsyncProcessError<string>) {
        return this.renderErrorMessage(linkProcess.error);
    }

    renderLinked(linkProcess: AsyncProcessSuccess<LinkOrgResult>) {
        switch (linkProcess.value) {
            case 'completed':
                return <p>The Narrative has been successfully linked.</p>;
            case 'requested':
                return (
                    <p>
                        A request to link this Narrative has been sent to the
                        Organization admins.
                    </p>
                );
        }
    }

    renderLinkProcess() {
        switch (this.state.linkProcess.status) {
            case AsyncProcessStatus.NONE:
                return (
                    <p>
                        Use this tool to link an organization to this Narrative.
                    </p>
                );
            case AsyncProcessStatus.PENDING:
                return this.renderLinkPending();
            case AsyncProcessStatus.ERROR:
                return this.renderLinkError(this.state.linkProcess);
            case AsyncProcessStatus.SUCCESS:
                return this.renderLinked(this.state.linkProcess);
        }
    }

    renderLoaded(loadProcess: AsyncProcessSuccess<LinkOrgState>) {
        if (loadProcess.value.perm !== 'a') {
            return this.renderModal(
                <div style={{ textAlign: 'center' }}>
                    You don't have permission to request to add this Narrative
                    to an Organization.
                </div>
            );
        }
        return this.renderModal(
            <div style={{ minHeight: '10rem' }}>
                {this.renderLinkProcess()}
                <OrgSelect
                    linkOrg={this.doLinkOrg.bind(this)}
                    orgs={loadProcess.value.userOrgs}
                />
                <div>{this.makeLinkedOrgsList(loadProcess.value)}</div>
            </div>
        );
    }

    renderCloseButton() {
        return (
            <Button onClick={this.props.cancelFn} variant="secondary">
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    <span
                        className="fa fa-times fa-2x"
                        style={{ marginRight: '0.25em' }}
                    />{' '}
                    Close
                </div>
            </Button>
        );
    }

    renderModal(body: JSX.Element, footer?: JSX.Element) {
        if (!footer) {
            footer = this.renderCloseButton();
        }
        return (
            <React.Fragment>
                <Modal.Body>
                    <Container fluid>
                        <Row>
                            <Col>{body}</Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Container fluid>
                        <Row className="justify-content-center">
                            <Col md="auto">{footer}</Col>
                        </Row>
                    </Container>
                </Modal.Footer>
            </React.Fragment>
        );
    }

    render() {
        switch (this.state.loadProcess.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderPending();
            case AsyncProcessStatus.ERROR:
                return this.renderLoadError(this.state.loadProcess);
            case AsyncProcessStatus.SUCCESS:
                return this.renderLoaded(this.state.loadProcess);
        }
    }
}

interface LinkedOrgProps extends GroupInfo {
    key: string;
}

const LinkedOrg = (props: LinkedOrgProps) => {
    return (
        <div className="">
            <a
                className=""
                href={`/#orgs/${props.id}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                {props.name}
            </a>
        </div>
    );
};
