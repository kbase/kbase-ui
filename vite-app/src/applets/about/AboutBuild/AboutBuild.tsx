import Well from 'components/Well';
import { Component } from 'react';
import { BuildInfo, GitInfo } from '../../../types/info';

export interface AboutBuildProps {
  gitInfo: GitInfo;
  buildInfo: BuildInfo;
}

export default class AboutBuild extends Component<AboutBuildProps> {
  renderCommit() {
    return (
      <table className="table">
        <tbody>
          <tr>
            <th>hash</th>
            <td>{this.props.gitInfo.hash.full}</td>
          </tr>
          <tr>
            <th>shortHash</th>
            <td>{this.props.gitInfo.hash.abbreviated}</td>
          </tr>
          <tr>
            <th>message</th>
            <td>{this.props.gitInfo.subject}</td>
          </tr>
          <tr>
            <th>by</th>
            <td>{this.props.gitInfo.committer.name}</td>
          </tr>
          <tr>
            <th>date</th>
            <td>{new Date(this.props.gitInfo.committer.date).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  renderAuthor() {
    return (
      <table className="table">
        <tbody>
          <tr>
            <th>author</th>
            <td>{this.props.gitInfo.author.name}</td>
          </tr>
          <tr>
            <th>authorDate</th>
            <td>{new Date(this.props.gitInfo.author.date).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  renderGit() {
    return (
      <table className="table">
        <tbody>
          <tr>
            <th>branch</th>
            <td>{this.props.gitInfo.branch}</td>
          </tr>
          <tr>
            <th>url</th>
            <td>{this.props.gitInfo.originURL}</td>
          </tr>
          <tr>
            <th>commit</th>
            <td>{this.renderCommit()}</td>
          </tr>
          <tr>
            <th>author</th>
            <td>{this.renderAuthor()}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  renderBuildInfo() {
    return (
      <table className="table">
        <tbody>
          <tr>
            <th>builtAt</th>
            <td>{new Date(this.props.buildInfo.builtAt).toLocaleString()}</td>
          </tr>
          <tr>
            <th>git</th>
            <td>{this.renderGit()}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  render() {
    return (
      <Well variant="secondary" stretch>
        <Well.Body>
          <div className="AboutBuild">
            <div data-k-b-testhook-panel="build">{this.renderBuildInfo()}</div>
          </div>
        </Well.Body>
      </Well>
    );
  }
}
