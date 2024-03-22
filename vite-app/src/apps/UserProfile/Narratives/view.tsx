/**
 *  Narrative.tsx is a view component
 *
 */
import { CompassOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Empty, Popover, Row, Table } from 'antd';
import UILink from 'components/UILink2';
import { navigationPathToURL } from 'contexts/RouterContext';
import React from 'react';
import { NarrativeData } from '../API';
import { dateElapsed } from './controller';
import styles from './index.module.css';

export interface Props {
  narratives: Array<NarrativeData>;
  isOwner: boolean;
  username: string;
  // uiOrigin: string;
}

/**
 * Returns a component with list of narratives in a table.
 * @param props
 */
export default class Narratives extends React.Component<Props> {
  renderManageNarrativesButton() {
    if (!this.props.isOwner) {
      return;
    }
    const [label, icon] = (() => {
      if (this.props.narratives.length === 0) {
        return ['Create your first Narrative with the Navigator!', <PlusOutlined style={{ fontSize: '140%' }} />];
      }
      return ['Manage your Narratives with the Navigator', <CompassOutlined style={{ fontSize: '140%' }} />];
    })();

    const openNavigator = () => {
      window.open(navigationPathToURL({ path: 'narratives', type: 'europaui' }, true), '_top');
    };
    // return <Button type="primary" href={`${this.props.uiOrigin}/narratives`} icon={icon} target="_blank">
    //     {label}
    // </Button>
    return (
      <div className="ButtonBar">
        <div className="ButtonBar-button">
          <Button type="primary" onClick={openNavigator} icon={icon}>
            {label}
          </Button>
        </div>
      </div>
    );
  }

  render() {
    let message: string;
    let emptyText: JSX.Element;
    if (this.props.isOwner) {
      message = 'This table shows all of your narratives.';
      emptyText = <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="You have no Narratives" />;
    } else {
      message = `This table shows all Narratives owned by user "${this.props.username}" which are also accessible to you.`;
      emptyText = (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="You do not have access to any Narratives owned by this user"
        />
      );
    }

    return (
      <div className={styles.main}>
        <Row gutter={[16, 16]} style={{ marginBottom: '1rem' }}>
          <Col span={12}>{message}</Col>
          <Col span={12} flex="auto" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
            {this.renderManageNarrativesButton()}
          </Col>
        </Row>
        <Table
          size="small"
          className="AntTable-FullHeight"
          dataSource={this.props.narratives}
          // loading={this.props.loading}
          pagination={false}
          scroll={{ y: '100%' }}
          rowKey="wsID"
          locale={{ emptyText }}
        >
          <Table.Column
            title="Title"
            dataIndex="name"
            key="wsID"
            render={(name: string, row: NarrativeData) => {
              return (
                <UILink path={`narrative/${row.wsID}`} type="europaui" newWindow={true}>
                  {name}
                </UILink>
              );
              // return <a
              //     href={makeEuropaURL({path: `narrative/${row.wsID}`, type: 'europaui'}).toString()}
              //     target="_blank"
              //     rel="noopener noreferrer">
              //     {name}
              // </a>;
            }}
            sorter={(a: NarrativeData, b: NarrativeData) => {
              return a.name.localeCompare(b.name);
            }}
          />
          <Table.Column
            title="Last Saved"
            dataIndex="last_saved"
            width={190}
            render={(last_saved: number) => {
              const day = dateElapsed(last_saved);
              return (
                <Popover placement="right" content={day[0]}>
                  <span>{day[1]}</span>
                </Popover>
              );
            }}
            defaultSortOrder={'descend'}
            sorter={(a: NarrativeData, b: NarrativeData) => {
              return a.last_saved - b.last_saved;
            }}
          />
        </Table>
      </div>
    );
  }
}
