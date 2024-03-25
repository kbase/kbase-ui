import { SearchOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, Spin, Table, Tooltip } from 'antd';
import {
  UserRunSummaryQuery,
  UserRunSummaryStat,
  UserRunSummaryViewDataError,
} from 'apps/JobBrowser/store/UserRunSummary';
import UILink from 'components/UILink2';
import { Component } from 'react';
import './style.css';

export interface UserRunSummaryProps {
  userRunSummary: UserRunSummaryStat[];
  search: (query: UserRunSummaryQuery) => void;
}

interface UserRunSummaryState {}

export default class UserRunSummary extends Component<UserRunSummaryProps, UserRunSummaryState> {
  currentQuery: UserRunSummaryQuery;
  constructor(props: UserRunSummaryProps) {
    super(props);
    this.currentQuery = {
      query: '',
    };
  }
  componentDidMount() {
    this.props.search(this.currentQuery);
  }
  onSubmitSearch(_fields: any) {
    this.props.search(this.currentQuery);
  }
  onChangeQuery(event: React.ChangeEvent<HTMLInputElement>) {
    this.currentQuery.query = event.target.value;
  }
  renderControlBar() {
    return (
      <Form layout="inline" onFinish={this.onSubmitSearch.bind(this)} style={{ marginBottom: '1rem' }}>
        <Form.Item>
          <Input
            defaultValue={this.currentQuery.query}
            placeholder="Search (leave empty for all)"
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

  renderTable() {
    return (
      <Table<UserRunSummaryStat>
        dataSource={this.props.userRunSummary}
        // loading={view.searchState === SearchState.SEARCHING}
        loading={false}
        rowKey={(stat: UserRunSummaryStat) => {
          return [stat.username, stat.appId, stat.moduleName, stat.functionName].join(':');
        }}
        pagination={{ position: ['bottomCenter'], showSizeChanger: true }}
        // pagination={false}
        // scroll={{ y: '100%' }}
        size="small"
        className="PreciseTable ScrollingFlexTable"
      >
        <Table.Column
          title="User"
          dataIndex="username"
          // key="username"
          width="30%"
          render={(username: string) => {
            return (
              <Tooltip title={username}>
                <UILink path={`people/${username}`} type="kbaseui" newWindow={false}>
                  {username}
                </UILink>
              </Tooltip>
            );
          }}
          sorter={(a: UserRunSummaryStat, b: UserRunSummaryStat) => {
            return a.username.localeCompare(b.username);
          }}
        />
        <Table.Column
          title="Module"
          dataIndex="moduleName"
          // key="moduleId"
          width="30%"
          render={(moduleName: string) => {
            return (
              <Tooltip title={moduleName}>
                <UILink path={`catalog/modules/${moduleName}`} type="kbaseui" newWindow={false}>
                  {moduleName}
                </UILink>
              </Tooltip>
            );
          }}
          sorter={(a: UserRunSummaryStat, b: UserRunSummaryStat) => {
            return a.moduleName.localeCompare(b.moduleName);
          }}
        />
        <Table.Column
          title="Function"
          dataIndex="functionName"
          // key="functionId"
          width="30%"
          render={(functionName: string, stat: UserRunSummaryStat) => {
            return (
              <Tooltip title={functionName}>
                <UILink path={`catalog/apps/${stat.appId}`} type="kbaseui" newWindow={false}>
                  {functionName}
                </UILink>
              </Tooltip>
            );
          }}
          sorter={(a: UserRunSummaryStat, b: UserRunSummaryStat) => {
            return a.functionName.localeCompare(b.functionName);
          }}
        />
        <Table.Column
          title="Runs"
          dataIndex="runCount"
          // key="runCount"
          width="10%"
          align="right"
          render={(runCount: number) => {
            return (
              <div className="NumericColumn">
                {Intl.NumberFormat('en-US', {
                  useGrouping: true,
                }).format(runCount)}
              </div>
            );
          }}
          sorter={(a: UserRunSummaryStat, b: UserRunSummaryStat) => {
            return a.runCount - b.runCount;
          }}
          defaultSortOrder="descend"
        />
      </Table>
    );
  }

  renderLoading() {
    return <Spin />;
  }

  renderError(view: UserRunSummaryViewDataError) {
    return <Alert type="error" message={view.error.message} />;
  }

  render() {
    return (
      <div className="UserRunSummary">
        {this.renderControlBar()}
        {/* {this.renderViewState()} */}
        {this.renderTable()}
      </div>
    );
  }
}
