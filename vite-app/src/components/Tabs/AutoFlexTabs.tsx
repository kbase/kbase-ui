import { Component } from 'react';
import FlexTabs, { Tab } from './FlexTabs';

export interface AutoFlexTabsProps {
    tabs: Array<Tab>
}

interface AutoFlexTabsState {
    tabOrder: Array<string>;
    tabs: Map<string, Tab>;
    selectedTab: string;
}

export default class AutoFlexTabs extends Component<AutoFlexTabsProps, AutoFlexTabsState> {
    constructor(props: AutoFlexTabsProps) {
        super(props);

        this.state = {
            tabOrder: [],
            tabs: new Map(),
            selectedTab: ''
        }
    }
    componentDidMount() {
        let tabOrder: Array<string> = [];
        let tabs: Map<string, Tab> = new Map();
        this.props.tabs.forEach((tab) => {
            tabOrder.push(tab.tab);
            tabs.set(tab.tab, tab);
        });
        this.setState({
            tabOrder, tabs, selectedTab: this.props.tabs[0].tab
        })
    }
    selectTab(selectedTab: string) {
        this.setState({
            selectedTab
        })
    }
    render() {
        return (
            <FlexTabs
                tabOrder={this.state.tabOrder}
                selectedTab={this.state.selectedTab}
                tabs={this.state.tabs}
                onSelectTab={this.selectTab.bind(this)} />
        )
    }
}