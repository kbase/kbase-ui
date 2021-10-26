import React, { Component } from 'react';
// import { History } from 'history';
import Select from 'react-select';

import { sorts } from '../../utils/NarrativeSearch';

// Components
import { SearchInput } from '../generic/SearchInput';

import './Filters.css';

interface SearchParams {
  term: string;
  sort: string;
}
// TODO: Is it not exported from react-select?
interface OptionType {
  [key: string]: any;
}

interface FiltersState {
  loading: boolean;
  searchParams: SearchParams;
}

interface FiltersProps {
  category: string;
  // history: History;
  loading: boolean;
  onSetSearch: (searchParams: SearchParams, invalidateCache?: boolean) => void;
  search: string;
  sort: string;
}
const sortSlugDefault = Object.keys(sorts)[0];
const sortOptions = Object.entries(sorts).map(([value, label]) => {
  return {
    label,
    value,
  };
});

// Filter bar for searching and sorting data results
export class Filters extends Component<FiltersProps, FiltersState> {
  constructor(props: FiltersProps) {
    super(props);
    this.state = {
      loading: false,
      searchParams: this.getSearchParamsFromProps(props),
    };
  }

  getSort(sort: string): OptionType {
    if (sort in sorts) {
      return {
        value: sort,
        label: sorts[sort],
      };
    }
    // An invalid value  (can this occur? TODO!)
    throw new Error(`Sort option "${sort}" not recognized`);
  }

  getSearchParamsFromProps(props: FiltersProps) {
    return {
      term: props.search,
      sort: props.sort,
    };
  }

  // Handle an onSetVal event from SearchInput
  handleSearch(val: string): void {
    const searchParams = this.state.searchParams;
    const queryParams = new URLSearchParams(window.location.search);
    if (!val) {
      queryParams.delete('search');
    } else {
      queryParams.set('search', val);
    }
    window.location.search = `?${queryParams.toString()}`;
    // this.props.history.push(`?${queryParams.toString()}`);
    searchParams.term = val;
    this.props.onSetSearch(searchParams);
  }

  handleFilterChange(value: any): void {
    const { category } = this.props;
    const sortSlug = value.value;

    // Update the url with the new sort option.
    const queryParams = new URLSearchParams(window.location.search);

    // This bit of magic removes the 'sort' query parameter if the
    // sort option is the default one (which is the first one).
    // TODO: this might be cute, but i'm not sure what the use is,
    // If a use case for putting state like this into the url is to
    // provide the ability to pass such links around, removing state
    // from the user might be self-defeating if the sort option order
    // ever changes. Nevertheless, the "Recently updated" order will
    // probably always be the default.
    if (sortSlug === sortSlugDefault) {
      queryParams.delete('sort');
    } else {
      queryParams.set('sort', sortSlug);
    }

    // TODO: again, extra work just to remove a default option?
    const path = 'navigator/' + (category === 'own' ? '' : category);

    // const newLocation = `${path}?${queryParams.toString()}`;

    // TODO: navigator options should either be all in the search,
    // or it should have a concept of the structure of the path
    // i.e. navigator/TAB?sort&search
    window.location.hash = path;
    window.location.search = `?${queryParams.toString()}`;
    // this.props.history.push(newLocation);

    // Perform the search update.
    const searchParams = this.state.searchParams;
    searchParams.sort = sortSlug;
    this.setState({ searchParams });
    if (this.props.onSetSearch) {
      this.props.onSetSearch(searchParams);
    }
  }

  async handleRefresh(evt: any) {
    const searchParams = this.getSearchParamsFromProps(this.props);
    if (this.props.onSetSearch) {
      this.setState({ loading: true }, async () => {
        await this.props.onSetSearch(searchParams, true);
        this.setState({
          loading: false,
          searchParams,
        });
      });
    }
  }

  renderSortDropdown() {
    const sortOption = this.getSort(this.props.sort);
    return (
      <span className="SortDropdown">
        <div className="-control" role="listbox">
          <Select
            // defaultOptions
            isSearchable={false}
            defaultValue={sortOption}
            value={sortOption}
            placeholder="Sort by..."
            options={sortOptions}
            // display="inline"
            // width="10em"
            styles={{
              container: (base) => {
                return {
                  ...base,
                  width: '14em',
                };
              },
            }}
            onChange={this.handleFilterChange.bind(this)}
          />
        </div>
      </span>
    );
  }

  render() {
    const refreshIconClasses = [
      'fa fa-refresh',
      this.state.loading ? ' loading' : '',
    ].join('');
    return (
      <div className="Filters row align-items-center">
        {/* Left-aligned actions (eg. search) */}
        <div className="col-auto">
          <SearchInput
            loading={this.props.loading}
            onSetVal={this.handleSearch.bind(this)}
            placeholder="Search Narratives"
            value={this.props.search}
          />
        </div>

        {/* Right-aligned actions (eg. filter dropdown) */}
        <div className="col-auto">
          Sort
        </div>
        <div className="col-auto">
          {this.renderSortDropdown()}
        </div>
        <div className="col-auto">
          <button
            className="btn btn-primary"
            onClick={this.handleRefresh.bind(this)}
          >
            Refresh &nbsp;
            <i className={refreshIconClasses}></i>
          </button>
        </div>
      </div>
    );
  }
}
