import React, { Component } from 'react';

interface Props {
  loading: boolean;
  itemCount?: number;
  totalItems?: number;
  onLoadMore?: () => void;
}

interface State {}

/**
 * This is a stateless button with a few different forms based on its props.
 * If it has a loading prop, it'll return a spinner.
 * If it has some nonzero numerical items, it'll compare them and return how many remain.
 * If there are more items, then when clicked it'll trigger its onLoadMore function prop.
 */
export class LoadMoreBtn extends Component<Props, State> {
  handleClick() {
    if (this.props.onLoadMore) {
      this.props.onLoadMore();
    }
  }

  render() {
    const { loading = false, totalItems = 0, itemCount = 0 } = this.props;
    const hasMore = itemCount < totalItems;
    if (loading) {
      return (
        <span className="black-60 pa3 tc dib">
          <i className="fa fa-cog fa-spin mr2"></i>
          Loading...
        </span>
      );
    }
    if (!hasMore) {
      return <span className="black-50 pa3 dib tc">No more results.</span>;
    }
    return (
      <a
        className="tc pa3 dib pointer blue dim b"
        onClick={this.handleClick.bind(this)}
      >
        Load more ({totalItems - itemCount} remaining)
      </a>
    );
  }
}
