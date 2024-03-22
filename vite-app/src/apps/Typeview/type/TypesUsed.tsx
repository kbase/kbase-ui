import Empty from 'components/Empty';
import UILink from 'components/UILink2';
import { Component } from 'react';
import { TypeInfo } from '../common';
import DataTable7, { ColumnDefinition } from './DataTable7';

export interface TypesUsingProps {
  typesUsed: Array<TypeInfo>;
}

export default class TypesUsing extends Component<TypesUsingProps> {
  render() {
    if (this.props.typesUsed.length === 0) {
      return <Empty className="mt-2">This type is not used by any other types</Empty>;
    }

    const columns: Array<ColumnDefinition<TypeInfo>> = [
      {
        id: 'module',
        label: 'Module',
        style: {},
        render: ({ module }: TypeInfo) => {
          return (
            <UILink path={`spec/module/${module}`} type="kbaseui" newWindow={true}>
              {module}
            </UILink>
          );
        },
      },
      {
        id: 'name',
        label: 'Type Name',
        style: {},
        render: ({ id, name }: TypeInfo) => {
          return (
            <UILink path={`spec/type/${id}`} type="kbaseui" newWindow={true}>
              {name}
            </UILink>
          );
        },
      },
      {
        id: 'version',
        label: 'Type Version',
        style: {},
        render: ({ id, version }: TypeInfo) => {
          return (
            <UILink path={`spec/type/${id}`} type="kbaseui" newWindow={true}>
              {version}
            </UILink>
          );
        },
      },
    ];

    return (
      <DataTable7<TypeInfo>
        heights={{ row: 40, header: 40 }}
        // flex={true}
        bordered={true}
        columns={columns}
        dataSource={this.props.typesUsed}
      />
    );
  }
}
