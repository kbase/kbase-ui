import { SearchOutlined } from '@ant-design/icons';
import { Button, Form, Input, Progress, Spin, Table, Tooltip } from 'antd';
import { PublicAppStatsQuery } from 'apps/JobBrowser/store/PublicAppStats';
import { AppStat } from 'apps/JobBrowser/store/base';
import NiceTimeDuration from 'components/NiceTimeDuration';
import UILink from 'components/UILink2';
import React from 'react';
import './style.css';

export function nullableNumberCompare(a: number | null, b: number | null): number {
  if (a === null) {
    if (blur === null) {
      return 0;
    } else {
      return -1;
    }
  } else {
    if (b === null) {
      return 1;
    } else {
      return a - b;
    }
  }
}

export interface PublicAppStatsProps {
  stats: Array<AppStat>;
  // searchState: SearchState;
  // appStats: Array<AppStat>;
  onSearch: (query: PublicAppStatsQuery) => void;
}

interface PublicAppStatsState {
  appStats: Array<AppStat>;
}

export default class PublicAppStats extends React.Component<PublicAppStatsProps, PublicAppStatsState> {
  currentQuery: string;
  constructor(props: PublicAppStatsProps) {
    super(props);
    this.currentQuery = '';
  }
  // componentDidMount() {
  //     this.props.onSearch({
  //         query: this.currentQuery
  //     });
  // }
  onSubmitSearch(_fields: any) {
    // event.preventDefault();
    this.props.onSearch({
      query: this.currentQuery,
    });
  }

  onChangeQuery(event: React.ChangeEvent<HTMLInputElement>) {
    this.currentQuery = event.target.value;
  }

  renderControlBar() {
    // TODO: refactor - the clear does not resend the query.
    return (
      <Form layout="inline" onFinish={this.onSubmitSearch.bind(this)}>
        <Form.Item>
          <Input
            allowClear
            defaultValue={this.currentQuery}
            placeholder="Search App Stats (leave empty for all)"
            style={{ width: '20em' }}
            onChange={this.onChangeQuery.bind(this)}
          />
        </Form.Item>
        <Form.Item>
          <Button icon={<SearchOutlined />} type="primary" htmlType="submit" />
        </Form.Item>
      </Form>
    );
  }

  // onTableChange(pagination: PaginationConfig, filters: any, sorter: SorterResult<AppStat>) { }

  renderAppStatsTable() {
    // TODO: Refactor to infinite scrolling, this table display sucks.
    return (
      <Table<AppStat>
        dataSource={this.props.stats}
        // loading={this.props.view.searchState === SearchState.SEARCHING}
        // TODO: restore table in loading state; we can ignore the reloading
        // state as search is synchronous...
        loading={false}
        rowKey={(stat: AppStat) => {
          return stat.appId;
        }}
        pagination={{ position: ['bottomCenter'], showSizeChanger: true }}
        // pagination={false}
        // scroll={{ y: '100%' }}
        size="small"
        className="PreciseTable ScrollingFlexTable"
        // onChange={this.onTableChange.bind(this)}
      >
        <Table.Column
          title="Module"
          dataIndex="moduleId"
          key="moduleId"
          width="25%"
          render={(moduleId: string, stat: AppStat) => {
            return (
              <Tooltip title={stat.moduleTitle}>
                <UILink path={`catalog/modules/${moduleId}`} type="kbaseui" newWindow={true}>
                  {stat.moduleTitle}
                </UILink>
              </Tooltip>
            );
          }}
          sorter={(a: AppStat, b: AppStat) => {
            return a.moduleTitle.localeCompare(b.moduleTitle);
          }}
        />
        <Table.Column
          title="Function"
          dataIndex="functionId"
          key="functionId"
          width="25%"
          render={(stat: AppStat) => {
            return (
              <Tooltip title={stat.functionTitle}>
                <UILink path={`catalog/apps/${stat.moduleId}/${stat.functionId}`} type="kbaseui" newWindow={true}>
                  {stat.functionTitle}
                </UILink>
              </Tooltip>
            );
          }}
          sorter={(a: AppStat, b: AppStat) => {
            return a.functionTitle.localeCompare(b.functionTitle);
          }}
        />
        <Table.Column
          title="Runs"
          dataIndex="runCount"
          key="runCount"
          width="5%"
          align="right"
          render={(runCount: number) => {
            return (
              <div className="NumericColumn">
                {new Intl.NumberFormat('en-US', {
                  useGrouping: true,
                }).format(runCount)}
              </div>
            );
          }}
          sorter={(a: AppStat, b: AppStat) => {
            return a.runCount - b.runCount;
          }}
          defaultSortOrder="descend"
        />
        <Table.Column
          title="Errors"
          dataIndex="errorCount"
          key="errorCount"
          width="5%"
          align="right"
          render={(errorCount: number) => {
            return (
              <div className="NumericColumn">
                {new Intl.NumberFormat('en-US', {
                  useGrouping: true,
                }).format(errorCount)}
              </div>
            );
          }}
          sorter={(a: AppStat, b: AppStat) => {
            return a.errorCount - b.errorCount;
          }}
        />
        <Table.Column
          title="Success"
          dataIndex="successRate"
          key="successRate"
          width="10%"
          render={(successRate: number) => {
            return (
              <Progress
                percent={successRate * 100}
                format={(_percent: number | undefined) => {
                  return new Intl.NumberFormat('en-US', {
                    style: 'percent',
                  }).format(successRate);
                }}
              />
            );
          }}
          sorter={(a: AppStat, b: AppStat) => {
            return nullableNumberCompare(a.successRate, b.successRate);
          }}
        />
        <Table.Column
          title="Avg Run"
          dataIndex="averageRunTime"
          key="averageRunTime"
          width="10%"
          render={(averageRunTime: number) => {
            return <NiceTimeDuration precision={2} duration={averageRunTime * 1000} />;
          }}
          sorter={(a: AppStat, b: AppStat) => {
            return nullableNumberCompare(a.averageRunTime, b.averageRunTime);
          }}
        />
        <Table.Column
          title="Avg Queue"
          dataIndex="averageQueueTime"
          key="averageQueueTime"
          width="10%"
          render={(averageQueueTime: number) => {
            return <NiceTimeDuration precision={2} duration={averageQueueTime * 1000} />;
          }}
          sorter={(a: AppStat, b: AppStat) => {
            return nullableNumberCompare(a.averageQueueTime, b.averageQueueTime);
          }}
        />
        <Table.Column
          title="Total Run"
          dataIndex="totalRunTime"
          key="totalRunTime"
          width="10%"
          render={(totalRunTime: number) => {
            return <NiceTimeDuration precision={2} duration={totalRunTime * 1000} />;
          }}
          sorter={(a: AppStat, b: AppStat) => {
            return a.totalRunTime - b.totalRunTime;
          }}
        />
      </Table>
    );
  }

  renderLoading() {
    return <Spin />;
  }

  render() {
    return (
      <div className="PublicAppStats">
        <div className="mb-2">{this.renderControlBar()}</div>
        {this.renderAppStatsTable()};
      </div>
    );
  }
}
