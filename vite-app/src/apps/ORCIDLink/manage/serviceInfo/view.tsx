import PropTable, { PropTableRow } from "components/PropTable";
import { InfoResult } from "lib/kb_lib/comm/coreServices/ORCIDLInk";
import { Component } from "react";

export interface ServiceInfoViewProps {
    serviceInfo: InfoResult;
}

export default class ServiceInfoView extends Component<ServiceInfoViewProps> {
    renderServiceTable() {
        const rows: Array<PropTableRow> = [
            [
                'Service Version', this.props.serviceInfo["service-description"].version
            ],
            [
                'Repo', <a href={this.props.serviceInfo['service-description'].repoURL} target="_blank">{this.props.serviceInfo["service-description"].repoURL}</a>
            ],
        ];
        return <PropTable rows={rows} styles={{ body: { flex: '0 0 auto' }, col1: { flex: '0 0 20rem' }, col2: { flex: '1 0 0', justifyContent: 'flex-start' } }} />
    }

    renderGitInfoTable() {
        const rows: Array<PropTableRow> = [
            [
                'Committer date', Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'long' }).format(this.props.serviceInfo["git-info"].committer_date)
            ],
            [
                'Hash', this.props.serviceInfo["git-info"].commit_hash
            ],
            [
                'Branch', this.props.serviceInfo["git-info"].branch
            ],
            [
                'URL', <a href={this.props.serviceInfo['git-info'].url} target="_blank">{this.props.serviceInfo["git-info"].url}</a>
            ],
        ];
        return <PropTable rows={rows} styles={{ body: { flex: '0 0 auto' }, col1: { flex: '0 0 20rem' }, col2: { flex: '1 0 0', justifyContent: 'flex-start' } }} />
    }

    renderORCIDTable() {
        const rows: Array<PropTableRow> = [

            [
                'ORCID API URL', this.props.serviceInfo.runtime_info.orcid_api_url
            ],
            [
                'ORCID OAuth URL', this.props.serviceInfo.runtime_info.orcid_oauth_url
            ],
            [
                'ORCID Site URL', this.props.serviceInfo.runtime_info.orcid_site_url

            ]
        ];
        return <PropTable rows={rows} styles={{ body: { flex: '0 0 auto' }, col1: { flex: '0 0 20rem' }, col2: { flex: '1 0 0', justifyContent: 'flex-start' } }} />
    }

    render() {
        return <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', marginTop: '1rem' }}>
            <h4>Service</h4>
            {this.renderServiceTable()}
            <h4 style={{ marginTop: '1rem' }}>Git</h4>
            {this.renderGitInfoTable()}
            <h4 style={{ marginTop: '1rem' }}>ORCID</h4>
            {this.renderORCIDTable()}
        </div>
    }
}