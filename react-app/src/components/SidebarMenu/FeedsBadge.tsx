import { Component } from 'react';
import { AsyncProcess, AsyncProcessStatus } from '../../lib/AsyncProcess';
import { FeedsState } from '../../contexts/FeedsContext';
import ErrorMessage from '../ErrorMessage';

export interface FeedsBadgeProps {
    feedsState: FeedsState
}

interface FeedsInfo {
    count: number;
}

interface FeedsBadgeState {
    feedsState: AsyncProcess<FeedsInfo, string>;
}

export class FeedsBadge extends Component<FeedsBadgeProps, FeedsBadgeState> {
    renderLoading() {
        return <span className="fa fa-sm fa-spinner fa-pulse"></span>;
    }
    renderError(message: string) {
        return <ErrorMessage message={message} />;
    }
    renderBadge(info: FeedsInfo) {
        const baseStyle: React.CSSProperties = {
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid silver',
            padding: '0 4px',
            borderRadius: '.5em',
            backgroundColor: 'rgba(255, 255, 255, 0.5)'
        };
        const activeStyle = Object.assign({}, baseStyle, {
            fontWeight: 'bold', 
            color: 'white',
            backgroundColor: 'rgba(255,0, 0, 0.5)', 
        })
        if (info.count > 0) {
            return <div style={activeStyle} title={`You have ${Intl.NumberFormat('en-US', {useGrouping: true}).format(info.count)} unread notification${info.count > 1 ? 's' : ''}`}>
                {info.count}
            </div>;
        } else {
            return <div style={baseStyle} title={'You have no unread notifications'}>
                {info.count}
            </div>;
        }
    }
    render() {
        const feedsState = this.props.feedsState;
        switch (feedsState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(feedsState.error);
            case AsyncProcessStatus.SUCCESS:
                return this.renderBadge(feedsState.value);
        }
    }
}
