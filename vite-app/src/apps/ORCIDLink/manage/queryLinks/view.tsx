import { Tooltip } from "antd";
import { renderORCIDIcon } from "apps/ORCIDLink/common";
import { LinkRecord } from "apps/ORCIDLink/lib/ORCIDLinkClient";
import { ORCID_URL } from "apps/ORCIDLink/lib/constants";
import DataBrowser, { ColumnDef } from "components/DataBrowser";
import RelativeTimeClock from "components/RelativeTimeClock";
import { Component } from "react";
import { Button } from "react-bootstrap";


export interface ORCIDLinkManageProps {
    links: Array<LinkRecord>
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
        const columns: Array<ColumnDef<LinkRecord>> = [
            {
                id: 'username',
                label: 'Username',
                style: {},
                render: (linkRecord: LinkRecord) => {
                    return <a href={`/#people/${linkRecord.username}`} target="_blank">{linkRecord.username}</a>
                }
            },
            {
                id: 'orcid',
                label: 'ORCID® iD',
                style: {},
                render: (linkRecord: LinkRecord) => {
                    return renderORCIDLink(linkRecord.orcid_auth.orcid);
                    // return <a href={`ORCID_URL/${linkRecord.orcid_auth.orcid}`} target="_blank">{linkRecord.orcid_auth.orcid}</a>
                    // linkRecord.orcid_auth.orcid;
                }
            },
            {
                id: 'created',
                label: 'Created',
                flex: '0 0 8rem',
                render: (linkRecord: LinkRecord) => {
                    return <Tooltip title={Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'long' }).format(linkRecord.created_at)}>
                        {Intl.DateTimeFormat('en-US', {}).format(linkRecord.created_at)}
                    </Tooltip>
                }
            },

            {
                id: 'retires_at',
                label: 'Retires',
                flex: '0 0 8rem',
                render: (linkRecord: LinkRecord) => {
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
                render: (linkRecord: LinkRecord) => {
                    return <Button onClick={() => { this.viewLink(linkRecord.username) }}>View</Button>;
                }
            }
        ]
        const dataSource: Array<LinkRecord> = this.props.links;
        return <DataBrowser heights={{ header: 40, row: 40 }} columns={columns} dataSource={dataSource} />
    }
}