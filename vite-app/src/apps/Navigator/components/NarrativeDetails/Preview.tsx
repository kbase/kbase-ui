import NarrativeModel, {
    AppCell,
    Cell,
    CodeCell,
    DataObjectCell,
    // MarkdownCell,
    NarrativeObject,
    NarrativeSearchDoc,
    OutputObjectCell,
} from 'lib/clients/NarrativeModel';
import { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import Empty from '../../../../components/Empty';
import ErrorMessage from '../../../../components/ErrorMessage';
import Loading from '../../../../components/Loading';
import { AuthInfo } from '../../../../contexts/Auth';
import { AsyncProcess, AsyncProcessStatus } from '../../../../lib/AsyncProcess';
import { Config } from '../../../../types/config';
import AppCellView from './cells/AppCell';
import CodeCellView from './cells/CodeCell';
import DataObjectCellView from './cells/DataObjectCell';
import MarkdownCellView from './cells/MarkdownCell';
import OutputObjectCellVew from './cells/OutputObjectCell';
import UnrecognizedCellView from './cells/UnrecognizedCell';

interface Props {
    authInfo: AuthInfo;
    config: Config;
    narrative: NarrativeSearchDoc;
}

interface State {
    loadingState: AsyncProcess<NarrativeObject, string>;
}

export default class Preview extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            loadingState: {
                status: AsyncProcessStatus.NONE,
            },
        };
    }

    componentDidUpdate(prevProps: Props) {
        if (
            prevProps.narrative.access_group !==
            this.props.narrative.access_group ||
            prevProps.narrative.obj_id !== this.props.narrative.obj_id ||
            prevProps.narrative.version !== this.props.narrative.version
        ) {
            this.fetchNarrativeObject();
        }
    }

    componentDidMount() {
        this.fetchNarrativeObject();
    }

    async fetchNarrativeObject() {
        this.setState({
            loadingState: {
                status: AsyncProcessStatus.PENDING,
            },
        });
        const { narrative } = this.props;
        const { access_group, obj_id, version } = narrative;
        const upa = `${access_group}/${obj_id}/${version}`;
        try {
            const narrativeModel = new NarrativeModel({
                workspaceURL: this.props.config.services.Workspace.url,
                token: this.props.authInfo.token,
            });
            const narrative = await narrativeModel.fetchNarrative(upa);
            this.setState({
                loadingState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: narrative,
                },
            });
        } catch (error) {
            this.setState({
                loadingState: {
                    status: AsyncProcessStatus.ERROR,
                    error:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                },
            });
        }
    }

    renderFullNarrativeLink(wsid: number) {
        const narrativeHref = `/narrative/${wsid}`;
        return (
            <p style={{ textAlign: 'center' }}>
                <a
                    className="btn btn-outline-secondary"
                    href={narrativeHref}
                    target="_blank"
                    rel="noreferrer"
                >
                    View the full narrative
                </a>
            </p>
        );
    }

    renderError(error: string) {
        return <ErrorMessage message={error} />;
    }

    // renderAppCell(cell: AppCell) { }

    // renderMarkdownCell(cell: MarkdownCell) { }

    // renderCodeCell(cell: CodeCell) { }

    // renderOutputCell(cell: OutputObjectCell) { }

    // renderDataObjectCell(cell: DataObjectCell) { }

    renderCell(cell: Cell) {
        switch (cell.cell_type) {
            case 'markdown':
                return <MarkdownCellView cell={cell} />;
            case 'code':
                if ('kbase' in cell.metadata) {
                    switch (cell.metadata.kbase.type) {
                        case 'app':
                            return (
                                <AppCellView
                                    cell={cell as AppCell}
                                    authInfo={this.props.authInfo}
                                    config={this.props.config}
                                />
                            );
                        case 'code':
                            return <CodeCellView cell={cell as CodeCell} />;
                        case 'data':
                            return (
                                <DataObjectCellView
                                    cell={cell as DataObjectCell}
                                    authInfo={this.props.authInfo}
                                    config={this.props.config}
                                />
                            );
                        case 'output':
                            return (
                                <OutputObjectCellVew
                                    cell={cell as OutputObjectCell}
                                />
                            );
                    }
                } else {
                    // TODO: do a better job of showing obsolete cell types.
                    // E.g. some don't have a metadata.kbase because they are old;
                    // and rather have a kbstate e.g. see
                    // https://ci.kbase.us/narrative/2795
                    return (
                        <UnrecognizedCellView
                            title="Unrecognized"
                            content="Code Cell"
                        />
                    );
                }
        }
    }

    renderNarrative(narrative: NarrativeObject) {
        if (
            typeof narrative.cells === 'undefined' ||
            narrative.cells.length === 0
        ) {
            return (
                <Row>
                    <Col>
                        <Empty
                            icon="square-o"
                            message="This Narrative has no cells"
                        />
                    </Col>
                </Row>
            );
        }
        const rows = narrative.cells.map((cell, index) => {
            return (
                <Row className="g-0" key={index}>
                    {this.renderCell(cell)}
                </Row>
            );
        });
        return (
            <>
                {rows}
                <Row className="g-0">
                    {this.renderFullNarrativeLink(
                        this.props.narrative.access_group
                    )}
                </Row>
            </>
        );
    }

    render() {
        switch (this.state.loadingState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return (
                    <Loading
                        size="normal"
                        type="block"
                        message="Loading Narrative..."
                    />
                );
            case AsyncProcessStatus.ERROR:
                return <ErrorMessage message={this.state.loadingState.error} />;
            case AsyncProcessStatus.SUCCESS:
                return this.renderNarrative(this.state.loadingState.value);
        }
    }
}
