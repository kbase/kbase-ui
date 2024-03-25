import UILink from 'components/UILink2';
import { Component } from 'react';
import { TypeInfo } from '../common';
import DataTable7, { ColumnDefinition } from './DataTable7';
import { EnhancedTypeInfo } from './controller';

export interface VersionsProps {
  typeInfo: EnhancedTypeInfo;
}

export default class Versions extends Component<VersionsProps> {
  render() {
    const columns: Array<ColumnDefinition<TypeInfo>> = [
      {
        id: 'version',
        label: 'Type Version',
        style: {},
        render: ({ version, id }: TypeInfo) => {
          const isCurrentType = this.props.typeInfo.type_def === id;
          const [classNames, suffix] = (() => {
            if (isCurrentType) {
              return [['-current'], ' (this one)'];
            }
            return [[], ''];
          })();

          return (
            <UILink
              path={`spec/type/${id}`}
              type="kbaseui"
              newWindow={true}
              className={['TypeVersion'].concat(classNames).join(' ')}
            >
              {version}
              {suffix}
            </UILink>
          );
        },
      },
    ];

    return (
      <DataTable7<TypeInfo>
        heights={{ row: 30, header: 30 }}
        // flex={true}
        bordered={false}
        columns={columns}
        dataSource={this.props.typeInfo.typeVersions}
      />
    );
  }
}
