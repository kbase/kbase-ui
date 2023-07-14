import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

interface Props {
    onSetVal: (value: string) => void;
    onRefresh: () => void;
    loading: boolean;
    value?: string;
    placeholder?: string;
}

interface State {
    value: string;
    lastUsedValue: string | null;
    hasBeenModified: boolean;
    isDirty: boolean;
}

// Generic search text input with a loading state
export class SearchInput extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            value: props.value || '',
            lastUsedValue: null,
            isDirty: false,
            hasBeenModified: true,
        };
    }

    componentDidUpdate(prevProps: Props) {
        // handle case of props updating.
        if (
            prevProps.value !== this.props.value &&
            !this.state.hasBeenModified
        ) {
            this.setState({
                value: this.props.value || '',
                isDirty: true,
            });
        }
    }

    handleInput(ev: React.FormEvent<HTMLInputElement>) {
        const value = ev.currentTarget.value;
        const isDirty = value !== this.state.lastUsedValue;
        this.setState({ ...this.state, value, isDirty, hasBeenModified: true });
    }

    handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
        ev.preventDefault();
        this.triggerSearch();
        return false;
    }

    triggerSearch() {
        this.props.onSetVal(this.state.value);
        this.setState({
            ...this.state,
            isDirty: false,
            lastUsedValue: this.state.value,
        });
    }

    doClear() {
        this.setState({ value: '' }, () => {
            this.triggerSearch();
        });
    }

    render() {
        let iconClass = 'fa fa-search';
        if (this.props.loading) {
            iconClass = 'fa fa-spinner fa-spin';
        }
        return (
            <form
                className="row align-items-center"
                onSubmit={this.handleSubmit.bind(this)}
            >
                <div className="col-auto input-group">
                    <div
                        className="input-group-text"
                        style={{ position: 'relative', width: '2.5em' }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Button
                                variant="default"
                                onClick={this.props.onRefresh}
                            >
                                <span className={iconClass} />
                            </Button>
                        </div>
                    </div>
                    <input
                        className="form-control"
                        placeholder={this.props.placeholder || 'Search'}
                        onChange={this.handleInput.bind(this)}
                        value={this.state.value}
                        style={{
                            backgroundColor: this.state.isDirty
                                ? 'yellow'
                                : 'white',
                        }}
                    />
                    <Button
                        variant="outline-secondary"
                        onClick={this.doClear.bind(this)}
                        disabled={this.state.value === ''}
                    >
                        <span className="fa fa-times" />
                    </Button>
                </div>
            </form>
        );
    }
}
