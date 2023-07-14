import { Component } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { Config } from '../../types/config';
import ConfigEditor from './ConfigEditor';
import Main from './Main';
import './index.css';
import Features from './FeaturesController';

export interface DeveloperProps {
    tab?: string;
    config: Config;
    setTitle: (title: string) => void;
}

interface DeveloperState { }

export default class Developer extends Component<
    DeveloperProps,
    DeveloperState
> {
    componentDidMount() {
        this.props.setTitle('Developer Tools ;)');
    }

    // TODO: convert to bootstrap tabs??
    renderTabs() {
        return (
            <Tabs variant="tabs" defaultActiveKey="main" mountOnEnter>
                <Tab eventKey="main" title="Main">
                    <Main setTitle={this.props.setTitle} />
                </Tab>
                <Tab eventKey="config" title="Config Editor">
                    <ConfigEditor
                        setTitle={this.props.setTitle}
                        config={this.props.config}
                    />
                </Tab>
                <Tab eventKey="features" title="Features">
                    <Features
                        setTitle={this.props.setTitle} />
                </Tab>
            </Tabs>
        );
    }

    render() {
        return (
            <div className="Developer" data-k-b-testhook-plugin="developer">
                {this.renderTabs()}
            </div>
        );
    }
}
