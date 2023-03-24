import { Contributor, Work } from 'apps/ORCIDLink/lib/ORCIDLinkClient';
import Empty from 'components/Empty';
import { Component } from 'react';
import { Table } from 'react-bootstrap';
import styles from './WorkView.module.css';

export interface WorkViewProps {
    work: Work;
}

interface WorkViewState {}

const HEADER_STYLE: React.CSSProperties = {
    fontWeight: 'bold',
    color: 'rgba(250,250,250, 1)',
    backgroundColor: 'rgba(125, 125, 125, 1)',
    borderRadius: '0.25em',
    marginBottom: '1em',
    padding: '0.25em',
    justifyContent: 'center',
    textTransform: 'uppercase',
};

const SECTION_HEADER_STYLE: React.CSSProperties = {
    fontWeight: 'bold',
    color: 'rgba(250,250,250, 1)',
    backgroundColor: 'rgba(125, 125, 125, 1)',
    borderRadius: '0.25em',
    marginTop: '1em',
    padding: '0.25em',
    paddingLeft: '0.5em',
};

const SECTION_BODY_STYLE: React.CSSProperties = {
    justifyContent: 'center',
    marginTop: '1em',
    padding: '0.25em',
    paddingLeft: '0.5em',
};

export default class WorkView extends Component<WorkViewProps, WorkViewState> {
    renderExternalIds() {
        const rows = this.props.work.externalIds.map(({ type, url, value }, index) => {
            return (
                <div className="flex-row " key={index}>
                    <div className="flex-col">{type}</div>
                    <div className="flex-col">{value}</div>
                    <div className="flex-col">
                        <a href={url} target="_blank" rel="noreferrer">
                            {url}
                        </a>
                    </div>
                </div>
            );
        });
        return (
            <div className="flex-table">
                <div className="flex-row -header">
                    <div className="flex-col">Type</div>
                    <div className="flex-col">Value</div>
                    <div className="flex-col">URL</div>
                </div>
                {rows}
            </div>
        );
    }

    renderInfo() {
        return (
            <div className="flex-table">
                <div className="flex-row">
                    <div
                        className="flex-col"
                        style={{
                            flex: '0 0 10em',
                            fontWeight: 'bold',
                            color: 'rgba(150, 150, 150)',
                        }}
                    >
                        Put Code
                    </div>
                    <div className="flex-col">{this.props.work.putCode}</div>
                </div>
                <div className="flex-row">
                    <div
                        className="flex-col"
                        style={{
                            flex: '0 0 10em',
                            fontWeight: 'bold',
                            color: 'rgba(150, 150, 150)',
                        }}
                    >
                        Source
                    </div>
                    <div className="flex-col">{this.props.work.source}</div>
                </div>
                <div className="flex-row">
                    <div
                        className="flex-col"
                        style={{
                            flex: '0 0 10em',
                            fontWeight: 'bold',
                            color: 'rgba(150, 150, 150)',
                        }}
                    >
                        Created
                    </div>
                    <div className="flex-col">
                        {Intl.DateTimeFormat('en-US').format(this.props.work.createdAt)}
                    </div>
                </div>
            </div>
        );
    }

    renderContributors(contributors: Array<Contributor> | null) {
        if (contributors === null) {
            return <Empty message="No contributors" />;
        }
        const rows = contributors.map(({ name, roles, orcidId }) => {
            return (
                <tr>
                    <td>{name}</td>
                    <td>{roles.join(', ')}</td>
                    <td>{orcidId || 'n/a'}</td>
                </tr>
            );
        });

        return (
            <Table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Roles</th>
                        <th>ORCID</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </Table>
        );
    }

    renderSelfContributor(contributors: Array<Contributor> | null) {
        // const rows = this.props.work.contributors?.map(({ name, roles, orcidInfo }) => {
        //     return <tr>
        //         <td>{name}</td>
        //         <td>{roles.join(', ')}</td>
        //         <td>{orcidInfo?.path || 'n/a'}</td>
        //     </tr>
        // });

        // return <Table>
        //     <thead>
        //         <tr>
        //             <th>Name</th>
        //             <th>Roles</th>
        //             <th>ORCID</th>
        //         </tr>
        //     </thead>
        //     <tbody>
        //         {rows}
        //     </tbody>
        // </Table>
        return <div>NEED TO UPDATE</div>;
    }

    render() {
        return (
            <div className={`${styles.main}`}>
                <div className="flex-table">
                    <div className="flex-row">
                        <div
                            className="flex-col"
                            style={{
                                flex: '0 0 10em',
                                fontWeight: 'bold',
                                color: 'rgba(150, 150, 150)',
                            }}
                        >
                            Work Type
                        </div>
                        <div className="flex-col">{this.props.work.workType}</div>
                    </div>
                    <div className="flex-row">
                        <div
                            className="flex-col"
                            style={{
                                flex: '0 0 10em',
                                fontWeight: 'bold',
                                color: 'rgba(150, 150, 150)',
                            }}
                        >
                            Title
                        </div>
                        <div className="flex-col">{this.props.work.title}</div>
                    </div>
                    <div className="flex-row">
                        <div
                            className="flex-col"
                            style={{
                                flex: '0 0 10em',
                                fontWeight: 'bold',
                                color: 'rgba(150, 150, 150)',
                            }}
                        >
                            Journal
                        </div>
                        <div className="flex-col">{this.props.work.journal || 'n/a'}</div>
                    </div>
                    <div className="flex-row">
                        <div
                            className="flex-col"
                            style={{
                                flex: '0 0 10em',
                                fontWeight: 'bold',
                                color: 'rgba(150, 150, 150)',
                            }}
                        >
                            Date
                        </div>
                        <div className="flex-col">{this.props.work.date}</div>
                    </div>
                    <div className="flex-row">
                        <div
                            className="flex-col"
                            style={{
                                flex: '0 0 10em',
                                fontWeight: 'bold',
                                color: 'rgba(150, 150, 150)',
                            }}
                        >
                            URL
                        </div>
                        <div className="flex-col">{this.props.work.url}</div>
                    </div>
                    <div className="flex-row" style={SECTION_HEADER_STYLE}>
                        CITATION
                    </div>
                    <div className="flex-row">
                        <div
                            className="flex-col"
                            style={{
                                flex: '0 0 10em',
                                fontWeight: 'bold',
                                color: 'rgba(150, 150, 150)',
                            }}
                        >
                            Type
                        </div>
                        <div className="flex-col">{this.props.work.citation?.type}</div>
                    </div>

                    <div className="flex-row">
                        <div
                            className="flex-col"
                            style={{
                                flex: '0 0 10em',
                                fontWeight: 'bold',
                                color: 'rgba(150, 150, 150)',
                            }}
                        >
                            Citation
                        </div>
                        <div className="flex-col">{this.props.work.citation?.value}</div>
                    </div>

                    <div className="flex-row">
                        <div
                            className="flex-col"
                            style={{
                                flex: '0 0 10em',
                                fontWeight: 'bold',
                                color: 'rgba(150, 150, 150)',
                            }}
                        >
                            Short Description
                        </div>
                        <div className="flex-col">{this.props.work.shortDescription}</div>
                    </div>

                    <div className="flex-row" style={SECTION_HEADER_STYLE}>
                        Contributors
                    </div>
                    <div className="flex-row">
                        <div
                            className="flex-col"
                            style={{
                                flex: '0 0 10em',
                                fontWeight: 'bold',
                                color: 'rgba(150, 150, 150)',
                            }}
                        >
                            Your Roles
                        </div>
                        <div className="flex-col">
                            {this.renderSelfContributor(this.props.work.otherContributors)}
                        </div>
                    </div>
                    <div className="flex-row">
                        <div
                            className="flex-col"
                            style={{
                                flex: '0 0 10em',
                                fontWeight: 'bold',
                                color: 'rgba(150, 150, 150)',
                            }}
                        >
                            Other Contributors
                        </div>
                        <div className="flex-col">
                            {this.renderContributors(this.props.work.otherContributors)}
                        </div>
                    </div>

                    <div className="flex-row">
                        <div
                            className="flex-col"
                            style={{
                                flex: '0 0 10em',
                                fontWeight: 'bold',
                                color: 'rgba(150, 150, 150)',
                            }}
                        >
                            Citation
                        </div>
                        <div className="flex-col">{this.props.work.citation?.value}</div>
                    </div>

                    <div className="flex-row" style={SECTION_HEADER_STYLE}>
                        IDENTIFIERS
                    </div>
                    <div
                        className="flex-row"
                        style={{ justifyContent: 'center', marginTop: '1em' }}
                    >
                        {this.renderExternalIds()}
                    </div>

                    <div className="flex-row" style={SECTION_HEADER_STYLE}>
                        INFO
                    </div>
                    <div className="flex-row" style={SECTION_BODY_STYLE}>
                        {this.renderInfo()}
                    </div>
                </div>
            </div>
        );
    }
}
