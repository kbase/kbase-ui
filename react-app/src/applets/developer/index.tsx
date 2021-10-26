import {Component} from 'react';
import Tabs from '../../components/Tabs';
import {Config} from '../../types/config';
import ConfigEditor from './ConfigEditor';
import Main from './Main';

export interface DeveloperProps {
    tab?: string;
    config: Config;
    setTitle: (title: string) => void;
}

interface DeveloperState {
}

export default class Developer extends Component<DeveloperProps,
    DeveloperState> {
    componentDidMount() {
        this.props.setTitle('Developer Tools ;)');
    }

    // TODO: convert to bootstrap tabs??
    renderTabs() {
        const tabs = [
            {
                id: 'main',
                title: 'Main',
                tabProps: {},
                render: () => {
                    return <Main setTitle={this.props.setTitle}/>;
                },
            },
            {
                id: 'config',
                title: 'Config Editor',

                tabProps: {},
                render: () => {
                    return (
                        <ConfigEditor
                            setTitle={this.props.setTitle}
                            config={this.props.config}
                        />
                    );
                },
            },
        ];
        return <Tabs tabs={tabs} selectedTab={this.props.tab || 'main'}/>;
    }

    render() {
        return (
            <div className="Developer" data-k-b-testhook-plugin="developer">
                {this.renderTabs()}
            </div>
        );
    }
}
