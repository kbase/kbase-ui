import { Tooltip } from "antd";
import { renderORCIDIcon } from "apps/ORCIDLink/common";

import { ORCID_URL } from "apps/ORCIDLink/lib/constants";
import DataBrowser, { ColumnDef } from "components/DataBrowser";
import RelativeTimeClock from "components/RelativeTimeClock";
import { LinkRecordPublic } from "lib/kb_lib/comm/coreServices/orcidLinkCommon";
import { Component } from "react";
import { Button } from "react-bootstrap";


export interface ORCIDLinkManageProps {
    links: Array<LinkRecordPublic>
    viewLink: (linkId: string) => void;
}

interface ORCIDLinkManageState {

}

function renderORCIDLink(orcidId: string) {
    return <a href={`${ORCID_URL}/${orcidId}`} target="_blank">
        {renderORCIDIcon()}
        {ORCID_URL}/{orcidId}
    </a>
}

export default class ORCIDLinkManageView extends Component<ORCIDLinkManageProps, ORCIDLinkManageState> {

    viewLink(username: string) {
        const url = `/#orcidlink/manage/link/${username}`;
        window.open(url, '_blank');
    }

    render() {
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
                    return renderORCIDLink(linkRecord.orcid_auth.orcid);
                    // return <a href={`ORCID_URL/${linkRecord.orcid_auth.orcid}`} target="_blank">{linkRecord.orcid_auth.orcid}</a>
                    // linkRecord.orcid_auth.orcid;
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
                label: 'View',
                flex: '0 0 5rem',
                render: (linkRecord: LinkRecordPublic) => {
                    return <Button onClick={() => { this.viewLink(linkRecord.username) }}>View</Button>;
                }
            }
        ]
        const dataSource: Array<LinkRecordPublic> = this.props.links;
        return <DataBrowser heights={{ header: 40, row: 40 }} columns={columns} dataSource={dataSource} />
    }
}