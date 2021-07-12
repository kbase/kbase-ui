define([
    'preact',
    'htm',
    'css!./Tabs.css',
], (
    preact,
    htm,
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class Tab extends Component {
        constructor(props) {
            super(props);
            this.state = {
                selectedTab: this.props.selectedTab || this.props.tabs[0].id,
            };
        }

        onSelectTab(tabId) {
            this.setState({
                selectedTab: tabId,
            });
        }

        renderTabs() {
            return this.props.tabs.map((tab) => {
                const {id, title} = tab;
                const className = ['-tab'];
                if (this.state.selectedTab === id) {
                    className.push('-active');
                } else {
                    className.push('-inactive');
                }
                return html`
                    <div className=${className.join(' ')}
                         data-tab=${id} onClick=${() => {
    this.onSelectTab(id);
}}>
                        ${title}
                        <div className="-bottom-mask-container">
                            <div className="-bottom-mask" />
                        </div>
                    </div>
                `;
            });
        }

        renderTabBody() {
            return html`
                <div className="-body" data-k-b-testhook-element="tab-pane">
                    ${this.renderTabContent()}
                </div>
            `;
        }

        renderTabContent() {
            if (!this.state.selectedTab) {
                return html`
                    No Body
                `;
            }

            const selectedTab = this.props.tabs.filter((tab) => {
                return tab.id === this.state.selectedTab;
            })[0];

            if (!selectedTab) {
                return html`
                    No Tab
                `;
            }
            return html`
                <${selectedTab.component} ...${this.props.tabProps} data-tab-pane=${selectedTab.id}/>
            `;
        }

        render() {
            return html`
                <div className='Tabs'>
                    <div className="-tabs">
                        ${this.renderTabs()}
                    </div>
                    ${this.renderTabBody()}
                </div>
            `;
        }
    }

    return Tab;
});