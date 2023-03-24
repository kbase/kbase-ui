import { renderORCIDIcon } from 'apps/ORCIDLink/common';
import { ORCID_URL } from 'apps/ORCIDLink/lib/constants';
import { LinkRecord } from 'apps/ORCIDLink/lib/ORCIDLinkClient';
import DataBrowser, { ColumnDef } from 'components/DataBrowser';
import Well from 'components/Well';
import { Component } from 'react';
import { Button, Table } from 'react-bootstrap';
import FlexGrid, { FlexCol, FlexRow } from '../common/FlexGrid';
import { GetStaticNarrativesResult } from '../Model';

export interface BrowserProps {
    staticNarratives: Array<GetStaticNarrativesResult>;
    orcidLink: LinkRecord | null;
    baseURL: string;
    deleteWork: (putCode: string) => void;
}

interface BrowserState { }
function renderORCIDLink(orcidId: string) {
    return (
        <a href={`${ORCID_URL}/${orcidId}`} target="_blank" rel="noreferrer">
            {renderORCIDIcon()}
            {orcidId}
        </a>
    );
}

export default class Browser extends Component<BrowserProps, BrowserState> {
    renderTable() {
        const columns: Array<ColumnDef<GetStaticNarrativesResult>> = [
            {
                id: 'narrative',
                label: 'Narrative',
                render: (item: GetStaticNarrativesResult) => {
                    return (
                        <a href={`/narrative/${item.workspaceInfo.id}`} target="_blank">
                            {item.workspaceInfo.metadata['narrative_nice_name']}
                        </a>
                    );
                },
                sorter: (a: GetStaticNarrativesResult, b: GetStaticNarrativesResult) => {
                    const aTitle = a.workspaceInfo.metadata['narrative_nice_name'];
                    const bTitle = b.workspaceInfo.metadata['narrative_nice_name'];
                    return aTitle.localeCompare(bTitle);
                },
            },
            {
                id: 'workspaceId',
                label: 'Id',
                flex: '0 0 8em',
                style: { textAlign: 'right', paddingRight: '2em' },
                render: (item: GetStaticNarrativesResult) => {
                    return item.staticNarrativeInfo.ws_id;
                },
                sorter: (a: GetStaticNarrativesResult, b: GetStaticNarrativesResult) => {
                    return a.staticNarrativeInfo.ws_id - b.staticNarrativeInfo.ws_id;
                },
            },
            {
                id: 'version',
                label: 'Version',
                flex: '0 0 7em',
                style: { textAlign: 'right', paddingRight: '2em' },
                render: (item: GetStaticNarrativesResult) => {
                    return item.staticNarrativeInfo.version;
                },
                sorter: (a: GetStaticNarrativesResult, b: GetStaticNarrativesResult) => {
                    return a.staticNarrativeInfo.version - b.staticNarrativeInfo.version;
                },
            },
            {
                id: 'published',
                label: 'Published',
                flex: '0 0 8em',
                render: (item: GetStaticNarrativesResult) => {
                    const date = new Date(item.staticNarrativeInfo.static_saved);
                    return (
                        <a
                            href={`/n/${item.staticNarrativeInfo.ws_id}/${item.staticNarrativeInfo.version}`}
                            target="_blank"
                        >
                            {Intl.DateTimeFormat('en-US', {}).format(date)}
                        </a>
                    );
                },
                sorter: (a: GetStaticNarrativesResult, b: GetStaticNarrativesResult) => {
                    return a.staticNarrativeInfo.static_saved - b.staticNarrativeInfo.static_saved;
                },
            },
            // {
            //     id: 'doi_tools',
            //     label: '',
            //     flex: '0 0 3em',
            //     render: (item: GetStaticNarrativesResult) => {
            //         if (!item.doi) {
            //             return;
            //         }
            //         return (
            //             <Button
            //                 href={`/#narrativepublishing/add_doi/${item.staticNarrativeInfo.ws_id}/${item.staticNarrativeInfo.version}`}
            //                 size="sm"
            //                 variant="outline-primary"
            //                 style={{ marginLeft: '0.5em' }}
            //             >
            //                 <span className="fa fa-pencil" />
            //             </Button>
            //         );
            //     },
            // },
            {
                id: 'doi',
                label: 'DOI',
                flex: '0 0 20em',
                render: (item: GetStaticNarrativesResult) => {
                    if (!item.doi) {
                        return (
                            <Button
                                href={`/#narrativepublishing/add_doi/${item.staticNarrativeInfo.ws_id}/${item.staticNarrativeInfo.version}`}
                            >
                                Get DOI
                            </Button>
                        );
                    }
                    return (
                        <span>
                            <Button
                                href={`/#narrativepublishing/add_doi/${item.staticNarrativeInfo.ws_id}/${item.staticNarrativeInfo.version}`}
                                size="sm"
                                variant="outline-primary"
                                style={{ marginRight: '0.5em' }}
                            >
                                <span className="fa fa-pencil" />
                            </Button>
                            <a href={`https://doi.org/${item.doi}`} target="_blank">
                                {item.doi}
                            </a>
                        </span>
                    );
                },
            },
            {
                id: 'orcidWork',
                label: 'ORCID Work Record',
                flex: '0 0 10em',
                render: (item: GetStaticNarrativesResult) => {
                    if (item.doi !== null) {
                        const workRecord = item.workRecord;
                        if (!workRecord) {
                            if (this.props.orcidLink) {
                                return (
                                    <Button
                                        href={`${this.props.baseURL}/#narrativepublishing/work/new/${item.staticNarrativeInfo.ws_id}/${item.staticNarrativeInfo.version}`}
                                    >
                                        Add to ORCID
                                    </Button>
                                );
                            } else {
                                const linkBack = {
                                    url: new URL(
                                        `${this.props.baseURL}/#narrativepublishing`
                                    ).toString(),
                                    label: 'Narrative Publication Manager',
                                };
                                const linkingURL = new URL(`${this.props.baseURL}/#orcidlink/link`);
                                linkingURL.searchParams.set(
                                    'return_link',
                                    JSON.stringify(linkBack)
                                );
                                return (
                                    <Button href={linkingURL.toString()} target="_blank">
                                        Get ORCID Link
                                    </Button>
                                );
                            }
                        }
                        return (
                            <span>
                                {/* <Button
                                    href={`/#narrativepublishing/work/${encodeURIComponent(
                                        item.doi
                                    )}`}
                                    size="sm"
                                    variant="outline-primary"
                                    style={{ marginLeft: '0.5em' }}
                                >
                                    <span className="fa fa-eye" />
                                </Button> */}

                                <Button
                                    href={`/#narrativepublishing/work/edit/${workRecord.putCode}`}
                                    size="sm"
                                    variant="outline-primary"
                                    style={{ marginLeft: '0.5em' }}
                                >
                                    <span className="fa fa-pencil" />
                                </Button>

                                <Button
                                    onClick={() => {
                                        this.props.deleteWork(workRecord.putCode);
                                    }}
                                    size="sm"
                                    variant="outline-danger"
                                    style={{ marginLeft: '0.5em' }}
                                >
                                    <span className="fa fa-trash" />
                                </Button>
                            </span>
                        );
                    } else {
                        return 'n/a';
                    }
                },
            },
        ];
        return (
            <DataBrowser
                columns={columns}
                heights={{ header: 50, row: 50 }}
                dataSource={this.props.staticNarratives}
            />
        );
    }
    renderSimpleTable() {
        const head = (
            <tr>
                <th>Workspace Id</th>
                <th>Version</th>
                <th>Title</th>
                <th>Owner</th>
            </tr>
        );
        const rows = this.props.staticNarratives.map(({ staticNarrativeInfo, workspaceInfo }) => {
            return (
                <tr>
                    <td>{staticNarrativeInfo.ws_id}</td>
                    <td>{staticNarrativeInfo.version}</td>
                    <td>{workspaceInfo.metadata['narrative_nice_name']}</td>
                    <td>{workspaceInfo.owner}</td>
                </tr>
            );
        });
        return (
            <Table>
                <thead>{head}</thead>
                <body>{rows}</body>
            </Table>
        );
    }

    renderORCIDLink(link: LinkRecord) {
        return (
            <FlexGrid>
                <FlexRow>
                    <FlexCol title>
                        ORCID Account Id
                    </FlexCol>
                    <FlexCol>
                        <a href={`${ORCID_URL}/${link.orcid_auth.orcid}`} target="_blank" rel="noreferrer">
                            {renderORCIDIcon()}
                            {link.orcid_auth.orcid}
                        </a>
                    </FlexCol>
                    <FlexCol title>
                        Name on account
                    </FlexCol>
                    <FlexCol>
                        {link.orcid_auth.name}
                    </FlexCol>
                </FlexRow>
            </FlexGrid>
        );
    }

    renderORCID() {
        if (this.props.orcidLink) {
            return this.renderORCIDLink(this.props.orcidLink);
        } else {
            const linkBack = {
                url: new URL(`${this.props.baseURL}/#narrativepublishing`).toString(),
                label: 'Narrative Publication Manager',
            };
            const linkingURL = new URL(`${this.props.baseURL}/#orcidlink/link`);
            linkingURL.searchParams.set('return_link', JSON.stringify(linkBack));
            return (
                <Button href={linkingURL.toString()} target="_blank">
                    Get ORCID Link
                </Button>
            );
        }
    }
    renderHeader() {
        return (
            <Well variant="secondary" style={{ marginBottom: '2em' }}>
                <Well.Header>
                    ORCID Link
                </Well.Header>
                <Well.Body>
                    <div>ORCID Id</div>
                    <div>{this.renderORCID()}</div>
                </Well.Body>
            </Well>
        );
    }

    renderBrowser() {
        return (
            <Well variant="secondary" style={{ marginBottom: '2em' }}>
                <Well.Header>
                    Static Narratives
                </Well.Header>
                <Well.Body>
                    {this.renderTable()}
                </Well.Body>
            </Well>
        );
    }

    render() {
        return (
            <div>
                <div>{this.renderHeader()}</div>
                <div>{this.renderBrowser()}</div>
            </div>
        );
    }
}
