import { Button } from 'antd';
import { Component } from 'react';
import './FlexTabs.css';

export interface Tab {
    tab: string;
    title: JSX.Element | string;
    renderBody: () => JSX.Element
}

export interface TabsProps {
    tabOrder: Array<string>;
    // tabs: Array<Tab>;
    tabs: Map<string, Tab>;
    selectedTab: string;
    onSelectTab: ((tab: string) => void)
}

interface TabsState {
    // selectedTab: string;
}

export default class Tabs extends Component<TabsProps, TabsState> {
    constructor(props: TabsProps) {
        super(props);
        this.state = {
            // selectedTabIndex: 0
        };
    }

    selectTab(tabID: string) {
        // this.setState({ selectedTabIndex: tabIndex })
        this.props.onSelectTab(tabID)
    }

    renderTabs() {
        return this.props.tabOrder.map((tabID) => {
            const tab = this.props.tabs.get(tabID);
            // TODO: best way to handle this?
            if (!tab) {
                return <span>
                    no tab
                </span>;
            }
            const classNames = ['FlexTabs-tab']
            if (tabID === this.props.selectedTab) {
                classNames.push('FlexTabs-tab-active');
            }
            return (
                <span key={tabID} className={classNames.join(' ')}>
                    <Button type="link" onClick={() => { this.selectTab(tabID) }}>{tab.title}</Button>
                </span>
            )
        })
    }

    renderTabBody() {
        const tab = this.props.tabs.get(this.props.selectedTab);
        if (!tab) {
            return;
        }
        return tab.renderBody();
    }

    render() {
        return <div className="FlexTabs">
            <div className="FlexTabs-header">
                {this.renderTabs()}
            </div>
            <div className="FlexTabs-body">
                {this.renderTabBody()}
            </div>
        </div>
    }
}