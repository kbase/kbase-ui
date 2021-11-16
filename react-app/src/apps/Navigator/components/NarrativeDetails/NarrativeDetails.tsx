import { Component } from 'react';
import { NarrativeSearchDoc } from '../../utils/NarrativeModel';
import ToolMenu from './ToolMenu/ToolMenuWrapper';
import DataView from './DataView';
import Preview from './Preview';
import { AuthInfo } from '../../../../contexts/Auth';
import { Config } from '../../../../types/config';
import NarrativeHeader from './NarrativeHeader';
import { Tab, Tabs } from 'react-bootstrap';
import { updateHistory } from '../../utils/navigation';
import './NarrativeDetails.css';

interface Props {
    authInfo: AuthInfo;
    narrativeDoc: NarrativeSearchDoc;
    updateSearch: () => void;
    view: string;
    config: Config;
}

interface State {
    view: string | null;
}

// Narrative details side panel in the narrative listing.
export default class NarrativeDetails extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            view: this.props.view,
        };
    }

    async componentDidMount() {
        // const detailsHeaderComponent = await this.detailsHeader(
        //   this.state.activeItem
        // );
        // this.setState({
        //   detailsHeader: detailsHeaderComponent,
        // });
    }

    async componentDidUpdate(prevProps: Props) {
        if (prevProps.narrativeDoc === this.props.narrativeDoc) {
            return;
        }
        // const detailsHeaderComponent = await this.detailsHeader(
        //   this.props.activeItem
        // );
        // this.setState({
        //   detailsHeader: detailsHeaderComponent,
        // });
        // this.setState({
        //     narrativeDoc: this.props.narrativeDoc,
        // });
    }

    handleTabSelected(eventKey: string | null) {
        this.setState({
            view: eventKey,
        });
        updateHistory('view', eventKey);
    }

    renderTitle(narrativeDoc: NarrativeSearchDoc) {
        const narrativeHref = `/narrative/${narrativeDoc.access_group}`;
        const title = (() => {
            if (narrativeDoc.narrative_title.match(/^\s*$/)) {
                return '** EMPTY TITLE **';
            }
            return narrativeDoc.narrative_title;
        })();
        return (
            <a
                className=""
                href={narrativeHref}
                rel="noopener noreferrer"
                target="_blank"
            >
                <span className="-title">{title}</span>
            </a>
        );
    }

    render() {
        const { narrativeDoc, updateSearch } = this.props;
        if (!narrativeDoc) {
            return null;
        }

        return (
            <div className="container-fluid NarrativeDetails">
                <div className="row -title-row align-items-center">
                    <div
                        className="col-10 -fullheight"
                        style={{
                            overflowX: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {this.renderTitle(narrativeDoc)}
                    </div>
                    <div className="col-2 -fullheight align-items-end">
                        <ToolMenu
                            authInfo={this.props.authInfo}
                            config={this.props.config}
                            narrative={narrativeDoc}
                            doneFn={() => {
                                updateSearch();
                            }}
                        />
                    </div>
                </div>
                <div className="row" style={{ marginBottom: '1em' }}>
                    <div className="col-12">
                        <NarrativeHeader
                            authInfo={this.props.authInfo}
                            config={this.props.config}
                            narrativeDoc={this.props.narrativeDoc}
                        />
                    </div>
                </div>

                <div className="row h-100">
                    <div className="col-12 -fullheight">
                        <Tabs
                            variant="tabs"
                            onSelect={this.handleTabSelected.bind(this)}
                            defaultActiveKey="data"
                            activeKey={(() => {
                                return this.state.view || undefined;
                            })()}
                        >
                            <Tab eventKey="data" title="Data">
                                <div
                                    style={{ flex: '1 1 0', overflowY: 'auto' }}
                                >
                                    <DataView
                                        accessGroup={narrativeDoc.access_group}
                                        dataObjects={narrativeDoc.data_objects}
                                        authInfo={this.props.authInfo}
                                        config={this.props.config}
                                    />
                                </div>
                            </Tab>
                            <Tab eventKey="preview" title="Cells">
                                <div
                                    style={{ flex: '1 1 0', overflowY: 'auto' }}
                                >
                                    <Preview
                                        authInfo={this.props.authInfo}
                                        narrative={narrativeDoc}
                                        config={this.props.config}
                                    />
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </div>
            </div>
        );
    }
}
