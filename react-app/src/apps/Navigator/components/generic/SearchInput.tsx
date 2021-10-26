import React, { Component } from 'react';

// Milliseconds to wait before calling the "setVal" method and "onSetVal"
// callback
const DEBOUNCE = 250;

interface Props {
  onSetVal: (value: string) => void;
  loading: boolean;
  value?: string;
  placeholder?: string;
}

interface State {
  value: string;
}

// Generic search text input with a loading state
export class SearchInput extends Component<Props, State> {
  // Used for debouncing the search input while typing
  timeout: number | null = null;
  inputID: string;

  constructor(props: Props) {
    super(props);
    this.inputID = 'search-input' + String(Math.floor(Math.random() * 1000000));
    this.state = {
      value: props.value || '',
    };
    this.handleInput = this.handleInput.bind(this);
  }

  componentDidUpdate(prevProps: Props) {
    const initializeCondition = prevProps.value !== this.props.value;
    if (initializeCondition) this.setState({ value: '' });
  }

  setVal(value: string) {
    if (this.props.onSetVal) {
      this.props.onSetVal(value);
    }
  }

  // From an input event, call setVal at most every DEBOUNCE milliseconds
  handleInput(ev: React.FormEvent<HTMLInputElement>) {
    const value = ev.currentTarget.value;
    this.setState({ value });
    const callback = () => {
      this.setVal(value);
    };
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.timeout = window.setTimeout(callback, DEBOUNCE);
  }

  render() {
    let iconClass = 'fa fa-search black-30 absolute';
    if (this.props.loading) {
      iconClass = 'fa fa-cog fa-spin black-50 absolute';
    }
    return (
      <div className="row align-items-center">
        <div className={`col-auto ${iconClass}`} style={{ top: '0.65rem', left: '0.5rem' }}></div>
        <div className="col-auto">
          <label htmlFor={this.inputID}>
            Search
          </label>
        </div>
        <div className="col-auto">
          <input
            className="form-control"
            type="search"
            id={this.inputID}
            placeholder={this.props.placeholder || 'Search'}
            onChange={this.handleInput}
            value={this.state.value || this.props.value || ''}
            // style={{ paddingLeft: '2rem' }}
          />
        </div>
      </div>
    );
  }
}
