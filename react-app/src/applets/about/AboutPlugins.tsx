import { Component } from 'react';
import DataBrowser, {
    ColumnDef,
    SortDirection,
    SortState,
} from '../../components/DataBrowser';
import { Config, PluginInfo } from '../../types/config';
import styles from './AboutPlugins.module.css';

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

    renderPluginsx() {
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
                            <a
                                href={plugin.url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {plugin.globalName}
                            </a>
                        </td>
                    </tr>
                );
            });
    }

    renderPlugins() {
        const columns: Array<ColumnDef<PluginInfo>> = [
            {
                id: 'name',
                label: 'Name',
                style: {},
                render: (plugin: PluginInfo) => {
                    return <span>{plugin.name}</span>;
                },
                // sort: (sortState: SortState, dataSource: Array<PluginInfo>) => {
                //     console.log('sort', sortState);
                //     if (sortState === SortState.NONE) {
                //         return dataSource;
                //     }
                //     return dataSource.sort((a, b) => {
                //         const direction =
                //             sortState === SortState.ASCENDING ? 1 : -1;
                //         return direction * a.name.localeCompare(b.name);
                //     });
                // },
                sorter: (a: PluginInfo, b: PluginInfo) => {
                    return a.name.localeCompare(b.name);
                },
            },
            {
                id: 'version',
                label: 'Version',
                style: {},
                render: (plugin: PluginInfo) => {
                    return <span>{plugin.version}</span>;
                },
                sorter: (a: PluginInfo, b: PluginInfo) => {
                    return a.version.localeCompare(b.version);
                },
            },
            {
                id: 'date',
                label: 'Date',
                style: {},
                render: (plugin: PluginInfo) => {
                    return (
                        <span>
                            {Intl.DateTimeFormat('en-US', {}).format(
                                new Date(plugin.gitInfo.committerDate)
                            )}
                        </span>
                    );
                },
                sorter: (a: PluginInfo, b: PluginInfo) => {
                    return (
                        new Date(a.gitInfo.committerDate).getTime() -
                        new Date(b.gitInfo.committerDate).getTime()
                    );
                },
            },
            {
                id: 'gitAccount',
                label: 'GitHub Account',
                style: {},
                render: (plugin: PluginInfo) => {
                    return <span>{plugin.gitAccount}</span>;
                },
            },
            {
                id: 'repo',
                label: 'Repo',
                style: {},
                render: (plugin: PluginInfo) => {
                    return (
                        <a href={plugin.url} target="_blank" rel="noreferrer">
                            {plugin.globalName}
                        </a>
                    );
                },
            },
        ];
        // return (
        //     <tr key={index}>
        //         <td>{plugin.name}</td>
        //         <td>{plugin.version}</td>
        //         <td>
        //             {Intl.DateTimeFormat('en-US', {}).format(
        //                 new Date(plugin.gitInfo.committerDate)
        //             )}
        //         </td>
        //         <td>{plugin.gitAccount}</td>
        //         <td>
        //             <a
        //                 href={plugin.url}
        //                 target="_blank"
        //                 rel="noreferrer"
        //             >
        //                 {plugin.globalName}
        //             </a>
        //         </td>
        //     </tr>
        // );
        // });

        const data: Array<PluginInfo> = this.props.config.plugins.map(
            (value) => {
                return value;
            }
        );

        return (
            <DataBrowser
                columns={columns}
                heights={{ header: 50, row: 50 }}
                dataSource={data}
            />
        );
    }

    render() {
        return <div className={styles.main}>{this.renderPlugins()}</div>;
    }
}
