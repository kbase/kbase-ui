import { Component } from "react";
import { Tab, Tabs } from "react-bootstrap";
import Overview from "./Overview";
import Spec from "./Spec";
import TypesUsed from "./TypesUsed";
import TypesUsing from "./TypesUsing";
import Versions from './Versions';
import { EnhancedTypeInfo } from "./controller";
import './view.css';

export interface ViewProps {
    typeInfo: EnhancedTypeInfo
}

export default class View extends Component<ViewProps> {

    renderTabs() {
        // const tabs = [
        //     {
        //         id: 'overview',
        //         title: 'Type Overview',
        //         autoScroll: true,
        //         render: () => {
        //             return <Overview typeInfo={this.props.typeInfo} />
        //         }
        //     },
        //     {
        //         id: 'typeSpec',
        //         title: 'Type Spec',
        //         autoScroll: true,
        //         render: () => {
        //              return <Spec spec={this.props.typeInfo.spec_def} />
        //         }
        //     },
        //     {
        //         id: 'typesUsing',
        //         title: 'Types Using',
        //         render: () => {
        //            return <TypesUsing typesUsing={this.props.typeInfo.typesUsing} />;
        //         }
        //     },
        //     {
        //         id: 'typesUsed',
        //         title: 'Types Used',
        //         render: () => {
        //             return <TypesUsed typesUsed={this.props.typeInfo.typesUsed} />;
        //         }
        //     },
        //     {
        //         id: 'versions',
        //         title: 'Versions',
        //         render: () => {
        //            return <Versions typeInfo={this.props.typeInfo} />
        //         }
        //     }
        // ];
        // return <Tabs tabs={tabs} />

        return <Tabs variant="tabs"
                     defaultActiveKey="overview">
            <Tab eventKey="overview" title="Overview">
                <div className="-tab-pane-wrapper">
                    <Overview typeInfo={this.props.typeInfo} />
                </div>
            </Tab>
            <Tab eventKey="typeSpec" title="Type Spec">
                <Spec spec={this.props.typeInfo.spec_def} />
            </Tab>
            <Tab eventKey="typesUsing" title="Types Using">
                <div className="-tab-pane-wrapper">
                <TypesUsing typesUsing={this.props.typeInfo.typesUsing} />
                </div>
            </Tab>
            <Tab eventKey="typesUsed" title="Types Used">
                <div className="-tab-pane-wrapper">
                <TypesUsed typesUsed={this.props.typeInfo.typesUsed} />
                </div>
            </Tab>
            <Tab eventKey="versions" title="Versions">
                <div className="-tab-pane-wrapper">
                <Versions typeInfo={this.props.typeInfo} />
                </div>
            </Tab>
        </Tabs>;
    }
    
    render() {
        return <div className="TypeView">
            {this.renderTabs()}
        </div>
    }
}
