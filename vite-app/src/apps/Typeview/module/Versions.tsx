import UILink from 'components/UILink2';
import { Component } from 'react';
import { renderTimestamp } from '../common';
import DataTable7, { ColumnDefinition } from './DataTable7';
import { ModuleInfo } from './controller';

export interface VersionsProps {
  moduleInfo: ModuleInfo;
}

export default class Versions extends Component<VersionsProps> {
  render() {
    const columns: Array<ColumnDefinition<number>> = [
      {
        id: 'version',
        label: 'Type Version',
        style: {},
        render: (version: number) => {
          const isCurrentType = this.props.moduleInfo.info.ver === version;
          const [classNames, suffix] = (() => {
            if (isCurrentType) {
              return [['-current'], ' (this one)'];
            }
            return [[], ''];
          })();

          return (
            <UILink
              path={`spec/module/${this.props.moduleInfo.name}-${version}`}
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
      {
        id: 'date',
        label: 'Date',
        style: {},
        render: (version: number) => {
          const isCurrentType = this.props.moduleInfo.info.ver === version;
          const [classNames, _] = (() => {
            if (isCurrentType) {
              return [['-current'], ' (this one)'];
            }
            return [[], ''];
          })();

          return (
            <span className={['TypeVersion'].concat(classNames).join(' ')}>{renderTimestamp(new Date(version))}</span>
          );
        },
      },
    ];

    return (
      <DataTable7<number>
        heights={{ row: 30, header: 30 }}
        // flex={true}
        bordered={false}
        columns={columns}
        dataSource={this.props.moduleInfo.versions.vers}
      />
    );
  }
}
