import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { keepParamsLinkTo } from '../utils';
import { Doc } from '../../utils/NarrativeModel';
import {niceRelativeTime} from "../../../../lib/time";
import Loading from "../../../../components/Loading";
import './NarrativeLIsting.css';

export type NarrativeListCategories =
  'own' |
  'shared' |
  'narratorials' |
  'public';

interface Props {
  category: NarrativeListCategories;
  items: Array<Doc>;
  loading: boolean;
  onSelectItem?: (idx: number) => void;
  pageSize: number;
  selected: string;
  selectedIdx: number;
  sort?: string;
  totalItems: number;
}

interface State {}

// Active and inactive classnames for the item listing
const itemClasses = {
  active: {
    inner: 'narrative-item-inner',
    outer: 'narrative-item-outer active',
  },
  inactive: {
    inner: 'narrative-item-inner',
    outer: 'narrative-item-outer inactive',
  },
};

// Simple UI for a list of selectable search results
export class ItemList extends Component<Props, State> {
  selectItem(idx: number) {
    if (idx < 0 || idx >= this.props.items.length) {
      throw new Error(`Invalid index for ItemList: ${idx}.
        Max is ${this.props.items.length - 1} and min is 0.`);
    }
    if (this.props.onSelectItem) {
      this.props.onSelectItem(idx);
    }
  }

  // Handle click event on an individual item
  handleClickItem(idx: number) {
    this.selectItem(idx);
  }

  /**
   * Creates a view for a single Narrative item.
   * @param {Doc} item - the Narrative to show.
   * @param {number} idx - the index of the narrative being shown. Used to
   *   communicate to the onSelectItem prop.
   * @return {JSX} narrative selection link
   */
  renderNarrative (item: Doc, idx: number) {
    // I need this until I figure out what's in item
    const status = this.props.selectedIdx === idx ? 'active' : 'inactive';
    const css = itemClasses[status];
    const upa = `${item.access_group}/${item.obj_id}/${item.version}`;
    const keepParams = (link: string) =>
      keepParamsLinkTo(['limit', 'search', 'sort', 'view'], link);
    const { category } = this.props;
    const prefix = '/' + (category === 'own' ? '' : `${category}/`);
    // Action to select an item to view details
    return (
      <div
        className="-narrative"
        key={upa}
        onClick={() => this.handleClickItem(idx)}
        // to={keepParams(prefix + `${upa}/`)}
      >
            <div className="-title">
              {item.narrative_title || 'Untitled'}
            </div>
            <div className="-subtitle">
              Updated {niceRelativeTime(new Date(item.timestamp))} by {item.creator}
            </div>
      </div>
    );
  };

  hasMoreButton() {
    const { items, pageSize, totalItems } = this.props;
    const hasMore = items.length < totalItems;
    if (!hasMore) {
      return <span className="">No more results.</span>;
    }
    if (this.props.loading) {
      return (
        <span className="">
          <i className="fa fa-cog fa-spin"></i>
          Loading...
        </span>
      );
    }
    const keepParams = (link: string) =>
      keepParamsLinkTo(['sort', 'view', 'search'], link);
    return (
      <Link
        className=""
        to={keepParams(`./?limit=${items.length + pageSize}`)}
      >
        Load more ({this.props.totalItems - this.props.items.length} remaining)
      </Link>
    );
  }

  renderNarratives(narratives: Array<Doc>) {
    return narratives.map((item, idx) => {
      return this.renderNarrative(item, idx);
    });
  }

  render() {
    const { items } = this.props;
    if (items.length === 0) {
      if (this.props.loading) {
        return <Loading size="normal" type="inline" message="Loading Narratives..." />;
      } else {
        return (
          <div className="alert alert-warning">
            <p> No results found. </p>
          </div>
        );
      }
    }
    return (
      <div className="NarrativeListing">
        {this.renderNarratives(this.props.items)}
        {this.hasMoreButton()}
      </div>
    );
  }
}
