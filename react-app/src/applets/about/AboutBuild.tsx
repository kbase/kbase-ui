import { Component } from 'react';
import { BuildInfo, Config } from '../../types/config';

export interface AboutBuildProps {
    config: Config;
    setTitle: (title: string) => void;
}

interface AboutBuildState {}

export default class AboutBuild extends Component<
    AboutBuildProps,
    AboutBuildState
> {
    componentDidMount() {
        this.props.setTitle('About the kbase-ui build');
    }

    renderCommit(buildInfo: BuildInfo) {
        return (
            <table className="table">
                <tbody>
                    <tr>
                        <th>hash</th>
                        <td>{buildInfo.git.commitHash}</td>
                    </tr>
                    <tr>
                        <th>shortHash</th>
                        <td>{buildInfo.git.commitAbbreviatedHash}</td>
                    </tr>
                    <tr>
                        <th>message</th>
                        <td>{buildInfo.git.subject}</td>
                    </tr>
                    <tr>
                        <th>by</th>
                        <td>{buildInfo.git.committerName}</td>
                    </tr>
                    <tr>
                        <th>date</th>
                        <td>
                            {new Date(
                                buildInfo.git.committerDate
                            ).toLocaleString()}
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }

    renderAuthor(buildInfo: BuildInfo) {
        return (
            <table className="table">
                <tbody>
                    <tr>
                        <th>author</th>
                        <td>{buildInfo.git.authorName}</td>
                    </tr>
                    <tr>
                        <th>authorDate</th>
                        <td>
                            {new Date(
                                buildInfo.git.authorDate
                            ).toLocaleString()}
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }

    renderGit(buildInfo: BuildInfo) {
        return (
            <table className="table">
                <tbody>
                    <tr>
                        <th>branch</th>
                        <td>{buildInfo.git.branch}</td>
                    </tr>
                    <tr>
                        <th>url</th>
                        <td>{buildInfo.git.originUrl}</td>
                    </tr>
                    <tr>
                        <th>commit</th>
                        <td>{this.renderCommit(buildInfo)}</td>
                    </tr>
                    <tr>
                        <th>author</th>
                        <td>{this.renderAuthor(buildInfo)}</td>
                    </tr>
                </tbody>
            </table>
        );
    }

    renderBuildInfo() {
        const buildInfo = this.props.config.build;
        return (
            <table className="table">
                <tbody>
                    <tr>
                        <th>builtAt</th>
                        <td>{new Date(buildInfo.builtAt).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <th>git</th>
                        <td>{this.renderGit(buildInfo)}</td>
                    </tr>
                </tbody>
            </table>
        );
    }

    render() {
        return (
            <div className="AboutBuild">
                <div data-k-b-testhook-panel="build">
                    <h2>Build</h2>
                    {this.renderBuildInfo()}
                </div>

                <div data-k-b-testhook-panel="dependencies">
                    <h2>Dependencies</h2>
                    ...not yet...
                </div>
            </div>
        );
    }
}
