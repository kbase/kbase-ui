import { Modal } from "antd";
import DataBrowser, { ColumnDef } from "components/DataBrowser";
import Empty from "components/Empty";
import RelativeTimeClock from "components/RelativeTimeClock";
import { StatusResult } from "lib/kb_lib/comm/coreServices/ORCIDLInk";
import { GetLinkingSessionsResult } from "lib/kb_lib/comm/coreServices/ORCIDLInkManage";
import { LinkRecordPublic } from "lib/kb_lib/comm/coreServices/orcidLinkCommon";
import { Component } from "react";
import { Accordion, Button, Table } from "react-bootstrap";
import { Gear } from "react-bootstrap-icons";
import styles from './index.module.css';

export interface QueryLinkingSessionsViewProps {
    linkingSessions: GetLinkingSessionsResult;
    orcidlinkStatus: StatusResult;
    pruneExpiredSessions: () => void;
    deleteStartedSession: (sessionId: string) => void;
    deleteCompletedSession: (sessionId: string) => void;
}

interface QueryLinkingSessionsViewState {

}

export default class QueryLinkingSessionsView extends Component<QueryLinkingSessionsViewProps, QueryLinkingSessionsViewState> {

    renderTable() {
        const columns: Array<ColumnDef<LinkRecordPublic>> = [
            {
                id: 'username',
                label: 'Username',
                style: {},
                render: (linkRecord: LinkRecordPublic) => {
                    return linkRecord.username;
                }
            },
            {
                id: 'orcid',
                label: 'ORCID® iD',
                style: {},
                render: (linkRecord: LinkRecordPublic) => {
                    return linkRecord.orcid_auth.orcid;
                }
            }
        ]
        const dataSource: Array<LinkRecordPublic> = [];
        return <DataBrowser heights={{ header: 40, row: 40 }} columns={columns} dataSource={dataSource} />
    }

    confirmDeleteStartedSession(sessionId: string): void {
        const onConfirm = () => {
            this.props.deleteStartedSession(sessionId)
        }

        Modal.confirm({
            title: `Delete session with id ${sessionId}?`,
            onOk: onConfirm
        })
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
                    <RelativeTimeClock
                        now={this.props.orcidlinkStatus.current_time}
                        at={created_at}
                        size="compact" />
                </td>
                <td>
                    <RelativeTimeClock
                        now={this.props.orcidlinkStatus.current_time}
                        at={expires_at}
                        size="compact" />
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
                    {/* {niceElapsed(this.props.orcidlinkStatus.current_time - created_at).label} */}
                    <RelativeTimeClock
                        now={this.props.orcidlinkStatus.current_time}
                        at={created_at}
                        size="compact" />
                </td>
                <td>
                    <RelativeTimeClock
                        now={this.props.orcidlinkStatus.current_time}
                        at={expires_at}
                        size="compact" />
                    {/* <CountdownClock startAt={this.props.orcidlinkStatus.current_time} endAt={expires_at} onExpired={() => { }} /> */}
                    {/* {niceElapsed(this.props.orcidlinkStatus.current_time - expires_at).label} */}
                </td>
                <td>
                    <Button variant="outline-danger" onClick={() => { this.confirmDeleteStartedSession(session_id) }}>Delete</Button>
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
                    <th style={{ width: '4rem' }}>

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
                    <RelativeTimeClock
                        now={this.props.orcidlinkStatus.current_time}
                        at={created_at}
                        size="compact" />
                </td>
                <td>
                    <RelativeTimeClock
                        now={this.props.orcidlinkStatus.current_time}
                        at={expires_at}
                        size="compact" />
                </td>
                <td>
                    <Button variant="danger" onClick={() => { this.props.deleteCompletedSession(session_id) }}>Delete</Button>
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
                    <th style={{ width: '4rem' }}>
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
        return <div style={{ marginTop: '1rem' }} className={styles.main}>
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