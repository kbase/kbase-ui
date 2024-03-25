import Empty from 'components/Empty';
import UILink from 'components/UILink2';
import { Component } from 'react';
import { ModuleIdentifier } from '../common';
import DataTable7, { ColumnDefinition } from './DataTable7';
import { ModuleInfo } from './controller';

export interface IncludedModulesProps {
  moduleInfo: ModuleInfo;
}

export default class IncludedModules extends Component<IncludedModulesProps> {
  render() {
    if (this.props.moduleInfo.includedModules.length === 0) {
      return <Empty className="mt-2">No types used in this module</Empty>;
    }

    const columns: Array<ColumnDefinition<ModuleIdentifier>> = [
      {
        id: 'name',
        label: 'Name',
        style: {},
        render: ({ name }: ModuleIdentifier) => {
          return (
            <UILink path={`spec/module/${name}`} type="kbaseui" newWindow={true}>
              {name}
            </UILink>
          );
        },
      },
      {
        id: 'version',
        label: 'Type Version',
        style: {},
        render: ({ id, version }: ModuleIdentifier) => {
          return (
            <UILink path={`spec/type/${id}`} type="kbaseui" newWindow={true}>
              {version}
            </UILink>
          );
        },
      },
    ];

    return (
      <DataTable7<ModuleIdentifier>
        heights={{ row: 40, header: 40 }}
        // flex={true}
        bordered={true}
        columns={columns}
        dataSource={this.props.moduleInfo.includedModules}
      />
    );
  }
}
