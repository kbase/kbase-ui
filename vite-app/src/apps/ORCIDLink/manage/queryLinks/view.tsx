import { Modal, Tooltip } from "antd";
import { renderORCIDIcon } from "apps/ORCIDLink/common";

import DataBrowser, { ColumnDef } from "components/DataBrowser";
import Empty from "components/Empty";
import RelativeTimeClock from "components/RelativeTimeClock";
import { LinkRecordPublic } from "lib/kb_lib/comm/coreServices/orcidLinkCommon";
import { Component } from "react";
import { Button } from "react-bootstrap";

export interface ORCIDLinkManageProps {
    links: Array<LinkRecordPublic>
    orcidServiceURL: string;
    viewLink: (username: string) => void;
    deleteLink: (username: string) => void;
}

interface ORCIDLinkManageState {
}

export default class ORCIDLinkManageView extends Component<ORCIDLinkManageProps, ORCIDLinkManageState> {

    viewLink(username: string) {
        const url = `/#orcidlink/manage/link/${username}`;
        window.open(url, '_blank');
    }

    confirmDeleteLink(username: string) {
        Modal.confirm({
            title: `Delete link for ${username}?`,
            onOk: () => {
                this.props.deleteLink(username);
            }
        });
    }

    renderORCIDLink(orcidId: string) {
        return <a href={`${this.props.orcidServiceURL}/${orcidId}`} target="_blank">
            {renderORCIDIcon()}
            {this.props.orcidServiceURL}/{orcidId}
        </a>
    }

    renderEmpty() {
        return <Empty message="No links in the system!" />
    }

    renderLinks() {
        const columns: Array<ColumnDef<LinkRecordPublic>> = [
            {
                id: 'username',
                label: 'Username',
                flex: '1 0 0',
                render: (linkRecord: LinkRecordPublic) => {
                    return <a href={`/#people/${linkRecord.username}`} target="_blank">{linkRecord.username}</a>
                }
            },
            {
                id: 'orcid',
                label: 'ORCID® iD',
                flex: '2 0 0',
                render: (linkRecord: LinkRecordPublic) => {
                    return this.renderORCIDLink(linkRecord.orcid_auth.orcid);
                }
            },
            {
                id: 'created',
                label: 'Created',
                flex: '0 0 8rem',
                render: (linkRecord: LinkRecordPublic) => {
                    return <Tooltip title={Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'long' }).format(linkRecord.created_at)}>
                        {Intl.DateTimeFormat('en-US', {}).format(linkRecord.created_at)}
                    </Tooltip>
                }
            },

            {
                id: 'retires_at',
                label: 'Retires',
                flex: '0 0 8rem',
                render: (linkRecord: LinkRecordPublic) => {
                    return <Tooltip title={Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'long' }).format(linkRecord.retires_at)}>
                        <RelativeTimeClock
                            // now={this.props.orcidlinkStatus.current_time}
                            now={Date.now()}
                            at={linkRecord.retires_at}
                            size="compact" />
                    </Tooltip>
                }
            },
            {
                id: 'view',
                label: '',
                flex: '0 0 5rem',
                render: (linkRecord: LinkRecordPublic) => {
                    return <Button variant="outline-primary" onClick={() => { this.viewLink(linkRecord.username) }}>View</Button>;
                }
            },
            {
                id: 'delete',
                label: '',
                flex: '0 0 5rem',
                render: (linkRecord: LinkRecordPublic) => {
                    return <Button variant="outline-danger" onClick={() => { this.confirmDeleteLink(linkRecord.username) }}>
                        Delete
                    </Button>;
                }
            }
        ]
        const dataSource: Array<LinkRecordPublic> = this.props.links;
        return <DataBrowser heights={{ header: 40, row: 40 }} columns={columns} dataSource={dataSource} />
    }

    renderState() {
        if (this.props.links.length === 0) {
            return this.renderEmpty();
        }
        return this.renderLinks();

    }

    render() {
        return <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', marginTop: '1rem' }}>
            {this.renderState()}
        </div>
    }
}