import Well from 'components/Well';
import { Component } from 'react';
import DataBrowser, {
    ColumnDef
} from '../../../components/DataBrowser';
import { PluginInfo, PluginsInfo } from '../../../types/info';

export interface AboutPluginsProps {
    pluginsInfo: PluginsInfo;
}

export default class AboutPlugins extends Component<
    AboutPluginsProps
> {
    renderPlugins() {
        const columns: Array<ColumnDef<PluginInfo>> = [
            {
                id: 'name',
                label: 'Name',
                style: {},
                render: (plugin: PluginInfo) => {
                    return <span>{plugin.configs.ui.name}</span>;
                },
                sorter: (a: PluginInfo, b: PluginInfo) => {
                    return a.configs.ui.name.localeCompare(b.configs.ui.name);
                },
            },
            {
                id: 'version',
                label: 'Version',
                style: {},
                render: (plugin: PluginInfo) => {
                    return <span>{plugin.configs.ui.version}</span>;
                },
                sorter: (a: PluginInfo, b: PluginInfo) => {
                    return a.configs.ui.version.localeCompare(b.configs.ui.version);
                },
            },
            // {
            //     id: 'date',
            //     label: 'Date',
            //     style: {},
            //     render: (plugin: PluginInfo) => {
            //         return (
            //             <span>
            //                 {Intl.DateTimeFormat('en-US', {}).format(
            //                     new Date(plugin.git.committer.date)
            //                 )}
            //             </span>
            //         );
            //     },
            //     sorter: (a: PluginInfo, b: PluginInfo) => {
            //         return (
            //             new Date(a.git.committer.date).getTime() -
            //             new Date(b.git.committer.date).getTime()
            //         );
            //     },
            // },
            {
                id: 'account',
                label: 'GitHub Account',
                style: {},
                render: (plugin: PluginInfo) => {
                    return <span>{plugin.configs.ui.source.github.account}</span>;
                },
                sorter: (a: PluginInfo, b: PluginInfo) => {
                    return a.configs.ui.source.github.account.localeCompare(b.configs.ui.source.github.account);
                },
            },
            {
                id: 'repoName',
                label: 'Repo',
                style: {},
                render: (plugin: PluginInfo) => {
                    return (
                        <a href={`https://github.com/${plugin.configs.ui.source.github.account}/${plugin.configs.ui.globalName}`} target="_blank" rel="noreferrer" title="URL to the plugin's github repo">
                            {plugin.configs.ui.globalName}
                        </a>
                    );
                },
                sorter: (a: PluginInfo, b: PluginInfo) => {
                    return a.configs.ui.globalName.localeCompare(b.configs.ui.globalName);
                },
            },
        ];

        const data: Array<PluginInfo> = this.props.pluginsInfo.map(
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
        return <Well variant="secondary" stretch>
            <Well.Body>
                {this.renderPlugins()}
            </Well.Body>
        </Well>;
    }
}
