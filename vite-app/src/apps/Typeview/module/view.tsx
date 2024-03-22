import { Component } from "react";
import { Tab, Tabs } from "react-bootstrap";
import IncludedModules from "./IncludedModules";
import Overview from "./Overview";
import Spec from "./Spec";
import Types from "./Types";
import Versions from './Versions';
import { ModuleInfo } from "./controller";
import './view.css';

export interface ViewProps {
    moduleInfo: ModuleInfo
}

export default class View extends Component<ViewProps> {

    renderTabs() {
        return <Tabs variant="tabs"
                     defaultActiveKey="overview">
            <Tab eventKey="overview" title="Overview">
                <div className="-tab-pane-wrapper">
                    <Overview moduleInfo={this.props.moduleInfo} />
                </div>
            </Tab>
            <Tab eventKey="typeSpec" title="Type Spec">
                <Spec spec={this.props.moduleInfo.info.spec} />
            </Tab>
            <Tab eventKey="typesUsing" title="Types Using">
                <div className="-tab-pane-wrapper">
                <Types types={this.props.moduleInfo.types} />
                </div>
            </Tab>
            <Tab eventKey="included" title="Types Used">
                <div className="-tab-pane-wrapper">
                <IncludedModules moduleInfo={this.props.moduleInfo} />
                </div>
            </Tab>
            <Tab eventKey="versions" title="Versions">
                <div className="-tab-pane-wrapper">
                <Versions moduleInfo={this.props.moduleInfo} />
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
