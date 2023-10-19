import PropTable, { PropTableRow } from "components/PropTable";
import Well from "components/Well";
import { GetStatsResult } from "lib/kb_lib/comm/coreServices/ORCIDLInkManage";
import { Component } from "react";
import { Col, Container, Row, Table } from "react-bootstrap";

export type ORCIDLinkManageProps = GetStatsResult


interface ORCIDLinkManageState {

}

export default class ORCIDLinkManageView extends Component<ORCIDLinkManageProps, ORCIDLinkManageState> {

    renderLinkStats() {
        const { links: { last_24_hours, last_7_days, last_30_days, all_time } } = this.props.stats
        const rows: Array<PropTableRow> = [
            [
                'Last 24 hour', Intl.NumberFormat('en-US', { useGrouping: true }).format(last_24_hours)
            ],
            [
                'Last 7 days', Intl.NumberFormat('en-US', { useGrouping: true }).format(last_7_days)

            ],
            [
                'Last 30 days', Intl.NumberFormat('en-US', { useGrouping: true }).format(last_30_days)

            ],
            [
                'All Time', Intl.NumberFormat('en-US', { useGrouping: true }).format(all_time)

            ]
        ];
        return <PropTable rows={rows} styles={{ body: { flex: '0 0 auto' }, col1: { flex: '1 0 0' }, col2: { flex: '0 0 2rem' } }} />
    }

    renderLinkingSessionStats() {
        return <Table>
            <thead>
                <tr>
                    <th>
                        Type
                    </th>
                    <th>
                        Active
                    </th>
                    <th>
                        Expired
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        Initial
                    </td>
                    <td>
                        {this.props.stats.linking_sessions_initial.active}
                    </td>
                    <td>
                        {this.props.stats.linking_sessions_initial.expired}
                    </td>
                </tr>
                <tr>
                    <td>
                        Started
                    </td>
                    <td>
                        {this.props.stats.linking_sessions_started.active}
                    </td>
                    <td>
                        {this.props.stats.linking_sessions_started.expired}
                    </td>
                </tr>
                <tr>
                    <td>
                        Completed
                    </td>
                    <td>
                        {this.props.stats.linking_sessions_completed.active}
                    </td>
                    <td>
                        {this.props.stats.linking_sessions_completed.expired}
                    </td>
                </tr>
            </tbody>
        </Table>
    }

    render() {
        return <Container fluid style={{ marginTop: '1rem' }}>
            <Row>
                <Col md={3}>
                    <Well variant="primary">
                        <Well.Header>
                            Links
                        </Well.Header>
                        <Well.Body>
                            {this.renderLinkStats()}
                        </Well.Body>
                    </Well>
                </Col>
                <Col md={9}>
                    <Well variant="primary">
                        <Well.Header>
                            Linking Sessions
                        </Well.Header>
                        <Well.Body>
                            {this.renderLinkingSessionStats()}
                        </Well.Body>
                    </Well>
                </Col>
            </Row>
        </Container>

    }
}