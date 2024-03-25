import UILink from 'components/UILink2';
import { Component } from 'react';
import { Table } from 'react-bootstrap';
import TypeIcon from '../TypeIcon';
import { renderTimestamp } from '../common';
import './Overview.css';
import { EnhancedTypeInfo } from './controller';

export interface OverviewProps {
  typeInfo: EnhancedTypeInfo;
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

  render() {
    const {
      typeIdentifier: { module, name, version },
    } = this.props.typeInfo;
    return (
      <div className="TypeView-Overview">
        <table className="table table-striped table-bordered">
          <tbody>
            <tr>
              <th>Type name</th>
              <td>{name}</td>
            </tr>
            <tr>
              <th>Module</th>
              <td>
                <UILink path={`spec/module/${module}`} type="kbaseui" newWindow={true}>
                  {module}
                </UILink>
              </td>
            </tr>
            <tr>
              <th>Version</th>
              <td>
                <span className="TypeVersion">{version}</span>
              </td>
            </tr>
            <tr>
              <th>In module version(s)</th>
              <td>{this.renderModuleVersions(module, this.props.typeInfo.module_vers)}</td>
            </tr>
            <tr>
              <th>Icon</th>
              <td>
                <TypeIcon typeName={name} size="small" />
              </td>
            </tr>
            <tr>
              <th>Description</th>
              <td>
                <pre className="-description">{this.props.typeInfo.description}</pre>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
