import { Component } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { Config } from '../../types/config';
import ConfigEditor from './ConfigEditor';
import Features from './FeaturesController';
import Main from './Main';
import styles from './index.module.css';

export interface DeveloperProps {
    tab?: string;
    config: Config;
    setTitle: (title: string) => void;
}

export default class Developer extends Component<
    DeveloperProps
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
            <div className={styles.main} data-k-b-testhook-plugin="developer">
                {this.renderTabs()}
            </div>
        );
    }
}
