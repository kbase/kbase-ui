import { Component } from 'react';
import './Tabs.css';

export interface TabItem {
    id: string;
    title: string;
    tabProps: {};
    render: () => JSX.Element;
}

export interface TabProps {
    selectedTab: string;
    tabs: Array<TabItem>;
}

interface TabState {
    selectedTab: string;
}

export default class Tab extends Component<TabProps, TabState> {
    constructor(props: TabProps) {
        super(props);
        this.state = {
            selectedTab: this.props.selectedTab || this.props.tabs[0].id,
        };
    }

    onSelectTab(tabId: string) {
        this.setState({
            selectedTab: tabId,
        });
    }

    renderTabs() {
        return this.props.tabs.map((tab) => {
            const { id, title } = tab;
            const className = ['-tab'];
            if (this.state.selectedTab === id) {
                className.push('-active');
            } else {
                className.push('-inactive');
            }
            return (
                <div
                    className={className.join(' ')}
                    data-tab={id}
                    onClick={() => {
                        this.onSelectTab(id);
                    }}
                >
                    {title}
                    <div className="-bottom-mask-container">
                        <div className="-bottom-mask" />
                    </div>
                </div>
            );
        });
    }

    renderTabBody() {
        return (
            <div className="-body" data-k-b-testhook-element="tab-pane">
                {this.renderTabContent()}
            </div>
        );
    }

    renderTabContent() {
        if (!this.state.selectedTab) {
            return <div>No Body</div>;
        }

        const selectedTab = this.props.tabs.filter((tab) => {
            return tab.id === this.state.selectedTab;
        })[0];

        if (!selectedTab) {
            return <div>No Tab</div>;
        }
        // return <selectedTab.component
        //         {...this.props.tabProps}
        //         data-tab-pane={selectedTab.id}
        //     />
        // `;
        return selectedTab.render();
    }

    render() {
        return (
            <div className="Tabs">
                <div className="-tabs">{this.renderTabs()}</div>
                {this.renderTabBody()}
            </div>
        );
    }
}
