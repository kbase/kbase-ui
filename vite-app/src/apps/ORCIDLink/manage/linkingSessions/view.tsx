import { LinkRecord, ManageLinkingSessionsQueryResult, StatusResponse } from "apps/ORCIDLink/lib/ORCIDLinkClient";
import CountdownClock from "components/CountdownClock";
import DataBrowser, { ColumnDef } from "components/DataBrowser";
import Empty from "components/Empty";
import { niceElapsed } from "lib/time";
import { Component } from "react";
import { Accordion, Button, Table } from "react-bootstrap";
import { Gear } from "react-bootstrap-icons";

export interface QueryLinkingSessionsViewProps {
    linkingSessions: ManageLinkingSessionsQueryResult;
    orcidlinkStatus: StatusResponse;
    pruneExpiredSessions: () => void;
}

interface QueryLinkingSessionsViewState {

}

export default class QueryLinkingSessionsView extends Component<QueryLinkingSessionsViewProps, QueryLinkingSessionsViewState> {

    renderTable() {
        const columns: Array<ColumnDef<LinkRecord>> = [
            {
                id: 'username',
                label: 'Username',
                style: {},
                render: (linkRecord: LinkRecord) => {
                    return linkRecord.username;
                }
            },
            {
                id: 'orcid',
                label: 'ORCID Id',
                style: {},
                render: (linkRecord: LinkRecord) => {
                    return linkRecord.orcid_auth.orcid;
                }
            }
        ]
        const dataSource: Array<LinkRecord> = [];
        return <DataBrowser heights={{ header: 40, row: 40 }} columns={columns} dataSource={dataSource} />

    }
    renderInitial() {
        if (this.props.linkingSessions.initial_linking_sessions.length === 0) {
            return <Empty message="No initial linking sessions" size="compact" style={{ marginBottom: '1rem' }} />
        }
        const rows = this.props.linkingSessions.initial_linking_sessions.map(({ username, session_id, created_at, expires_at }) => {
            return <tr key={session_id}>
                <td>
                    <a href={`/#people/${username}`} target="_blank" >{username}</a>
                </td>
                <td>
                    {session_id}
                </td>
                <td>
                    {niceElapsed(this.props.orcidlinkStatus.current_time - created_at).label}
                </td>
                <td>
                    <CountdownClock startAt={this.props.orcidlinkStatus.current_time} endAt={expires_at} onExpired={() => { }} />
                </td>
            </tr>
        });
        return <Table striped>
            <thead>
                <tr>
                    <th style={{ width: '30%' }}>
                        Username
                    </th>
                    <th style={{ width: '30%' }}>
                        Session Id
                    </th>
                    <th style={{ width: '20%' }}>
                        Created
                    </th>
                    <th style={{ width: '20%' }}>
                        Expires
                    </th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </Table>
    }
    renderStarted() {
        if (this.props.linkingSessions.started_linking_sessions.length === 0) {
            return <Empty message="No started linking sessions" size="compact" style={{ marginBottom: '1rem' }} />
        }
        const rows = this.props.linkingSessions.started_linking_sessions.map(({ username, session_id, created_at, expires_at }) => {
            return <tr key={session_id}>
                <td>
                    <a href={`/#people/${username}`} target="_blank" >{username}</a>
                </td>
                <td>
                    {session_id}
                </td>
                <td>
                    {niceElapsed(this.props.orcidlinkStatus.current_time - created_at).label}
                </td>
                <td>
                    <CountdownClock startAt={this.props.orcidlinkStatus.current_time} endAt={expires_at} onExpired={() => { }} />
                    {/* {niceElapsed(this.props.orcidlinkStatus.current_time - expires_at).label} */}
                </td>
            </tr>
        });
        return <Table striped>
            <thead>
                <tr>
                    <th style={{ width: '30%' }}>
                        Username
                    </th>
                    <th style={{ width: '30%' }}>
                        Session Id
                    </th>
                    <th style={{ width: '20%' }}>
                        Created
                    </th>
                    <th style={{ width: '20%' }}>
                        Expires
                    </th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </Table>
    }
    renderCompleted() {
        if (this.props.linkingSessions.completed_linking_sessions.length === 0) {
            return <Empty message="No completed linking sessions" size="compact" style={{ marginBottom: '1rem' }} />
        }
        const rows = this.props.linkingSessions.completed_linking_sessions.map(({ username, session_id, created_at, expires_at }) => {
            return <tr key={session_id}>
                <td>
                    <a href={`/#people/${username}`} target="_blank">{username}</a>
                </td>
                <td>
                    {session_id}
                </td>
                <td>
                    {niceElapsed(this.props.orcidlinkStatus.current_time - created_at).label}
                </td>
                <td>
                    <CountdownClock startAt={this.props.orcidlinkStatus.current_time} endAt={expires_at} onExpired={() => { }} />
                </td>
            </tr>
        });
        return <Table striped>
            <thead>
                <tr>
                    <th style={{ width: '30%' }}>
                        Username
                    </th>
                    <th style={{ width: '30%' }}>
                        Session Id
                    </th>
                    <th style={{ width: '20%' }}>
                        Created
                    </th>
                    <th style={{ width: '20%' }}>
                        Expires
                    </th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </Table>
    }
    renderTools() {
        return <Accordion>
            <Accordion.Item eventKey="tools">
                <Accordion.Header><Gear size="1.5rem" style={{ marginRight: '0.5rem' }} /> Tools</Accordion.Header>
                <Accordion.Body>
                    <Button onClick={this.props.pruneExpiredSessions}>Delete Expired Sessions</Button>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    }
    render() {
        return <div style={{ marginTop: '1rem' }}>
            {this.renderTools()}
            <h2 style={{ marginTop: '1rem' }}>Initial</h2>
            {this.renderInitial()}
            <h2>Started</h2>
            {this.renderStarted()}
            <h2>Completed</h2>
            {this.renderCompleted()}
        </div>
    }
}