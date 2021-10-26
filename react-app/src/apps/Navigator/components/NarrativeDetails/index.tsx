import React from 'react';

// Utils
import {Doc} from '../../utils/NarrativeModel';
import {keepParamsLinkTo} from '../utils';
import ControlMenu from './ControlMenu/ControlMenu';
import DataView from './DataView';
import Preview from './Preview';
import {AuthInfo} from "../../../../contexts/Auth";
import {Config} from "../../../../types/config";
import NarrativeHeader from "./NarrativeHeader";
import {Tab, Tabs} from "react-bootstrap";
import './NarrativeDetails.css'


interface Props {
    authInfo: AuthInfo;
    activeItem: Doc;
    updateSearch: () => void;
    view: string;
    config: Config
}

interface State {
    activeItem: Doc;
    // detailsHeader: JSX.Element;
}

// Narrative details side panel in the narrative listing.
export default class NarrativeDetails extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        const {activeItem} = this.props;
        this.state = {
            activeItem,
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
        if (prevProps.activeItem === this.props.activeItem) return;
        // const detailsHeaderComponent = await this.detailsHeader(
        //   this.props.activeItem
        // );
        // this.setState({
        //   detailsHeader: detailsHeaderComponent,
        // });
        this.setState({
            activeItem: this.props.activeItem
        });
    }

    render() {
        const {activeItem, updateSearch, view} = this.props;
        if (!activeItem) {
            return null;
        }
        const wsid = activeItem.access_group;
        const narrativeHref = `/narrative/${wsid}`;
        // const content = (() => {
        //   // Choose which content to show based on selected tab
        //   switch (view) {
        //     case 'preview':
        //       return  (
        //           <Preview authInfo={this.props.authInfo}
        //                    narrative={activeItem}
        //                    config={this.props.config}/>
        //       );
        //     case 'data':
        //     default:
        //       return (
        //           <DataView accessGroup={wsid}
        //                     dataObjects={activeItem.data_objects}
        //                     authInfo={this.props.authInfo}
        //                     config={this.props.config}/>
        //       );
        //   }
        // })();
        const keepParams = (link: string) =>
            keepParamsLinkTo(['limit', 'sort', 'search'], link);
        const tabs = Object.entries({
            data: {
                name: 'Data',
                link: keepParams('?view=data'),
            },
            preview: {
                name: 'Preview',
                link: keepParams('?view=preview'),
            },
        });
        return (
            <div
                className="container-fluid NarrativeDetails"
            >
                <div className="row -title-row align-items-center">
                    <div className="col-10">
                        <a
                            className=""
                            href={narrativeHref}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <span className="fa fa-external-link -icon"></span>
                            <span className="-title">
                {activeItem.narrative_title || 'Untitled'}
              </span>
                        </a>
                        <span className="-version">v{activeItem.version}</span>
                    </div>
                    <div className="col-2">
                        <ControlMenu
                            narrative={activeItem}
                            doneFn={() => {
                                updateSearch();
                            }}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <NarrativeHeader authInfo={this.props.authInfo}
                                         config={this.props.config}
                                         narrativeDoc={this.state.activeItem}/>
                    </div>
                </div>

                <div className="row h-100">
                    <Tabs variant="tabs">
                        <Tab eventKey="data" title="Data">
                            <DataView accessGroup={wsid}
                                      dataObjects={activeItem.data_objects}
                                      authInfo={this.props.authInfo}
                                      config={this.props.config}/>
                        </Tab>
                        <Tab eventKey="preview" title="Preview">
                            <Preview authInfo={this.props.authInfo}
                                     narrative={activeItem}
                                     config={this.props.config}/>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        );
    }
}
