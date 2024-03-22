import UILink from 'components/UILink2';
import { Component } from 'react';
import { Table } from 'react-bootstrap';
import { renderTimestamp } from '../common';
import './Overview.css';
import { ModuleInfo } from './controller';

export interface OverviewProps {
  moduleInfo: ModuleInfo;
}

export default class Overview extends Component<OverviewProps> {
  renderModuleVersions(module: string, versions: Array<number>) {
    const rows = versions.map((ver) => {
      return (
        <tr key={ver}>
          <td>
            <UILink path={`spec/module/${module}-${ver}`} type="kbaseui" newWindow={true} className="ModuleVersion">
              {ver}
            </UILink>
          </td>
          <td className="text-nowrap">{renderTimestamp(new Date(ver))}</td>
        </tr>
      );
    });
    return (
      <Table striped className="w-auto">
        <thead>
          <tr>
            <th>Version id</th>
            <th>Created on</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    );
  }

  renderOwners(owners: Array<string>) {
    return owners.map((owner) => {
      return (
        <div key={owner}>
          <UILink path={`people/${owner}`} type="kbaseui" newWindow={true}>
            {owner}
          </UILink>
        </div>
      );
    });
  }

  render() {
    const {
      name,
      info: { owners, ver },
    } = this.props.moduleInfo;
    return (
      <div className="TypeView-Overview">
        <table className="table table-striped table-bordered">
          <tbody>
            <tr>
              <th>Module name</th>
              <td>{name}</td>
            </tr>
            <tr>
              <th>Version</th>
              <td>
                <span style={{ fontFamily: 'monospace' }}>{ver}</span>
              </td>
            </tr>
            <tr>
              <th>Owners</th>
              <td>{this.renderOwners(owners)}</td>
            </tr>
            <tr>
              <th>Created</th>
              <td>{renderTimestamp(new Date(ver))}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>
                <pre className="-description">{this.props.moduleInfo.info.description}</pre>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
