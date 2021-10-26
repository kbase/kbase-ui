import { Component } from 'react';
import { Config } from '../../types/config';

export interface AboutPluginsProps {
    config: Config;
    setTitle: (title: string) => void;
}

interface AboutPluginsState {}

export default class AboutPlugins extends Component<
    AboutPluginsProps,
    AboutPluginsState
> {
    componentDidMount() {
        this.props.setTitle('About KBase UI Plugins');
    }

    renderPlugins() {
        return this.props.config.plugins
            .sort((pluginA, pluginB) => {
                return pluginA.name.localeCompare(pluginB.name);
            })
            .map((plugin, index) => {
                return (
                    <tr key={index}>
                        <td>{plugin.name}</td>
                        <td>{plugin.version}</td>
                        <td>
                            {Intl.DateTimeFormat('en-US', {}).format(
                                new Date(plugin.gitInfo.committerDate)
                            )}
                        </td>
                        <td>{plugin.gitAccount}</td>
                        <td>
                            <a href={plugin.url} target="_blank">
                                {plugin.globalName}
                            </a>
                        </td>
                    </tr>
                );
            });
    }

    render() {
        return (
            <div className="AboutPlugins">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Version</th>
                            <th>Date</th>
                            <th>Github Account</th>
                            <th>Repo</th>
                        </tr>
                    </thead>
                    <tbody>{this.renderPlugins()}</tbody>
                </table>
            </div>
        );
    }
}
