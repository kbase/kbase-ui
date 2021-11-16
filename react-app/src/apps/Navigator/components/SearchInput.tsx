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
}

// Generic search text input with a loading state
export class SearchInput extends Component<Props, State> {
    inputID: string;
    constructor(props: Props) {
        super(props);
        this.inputID =
            'search-input' + String(Math.floor(Math.random() * 1000000));
        this.state = {
            value: props.value || '',
        };
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.value !== this.props.value) {
            this.setState({ value: this.props.value || '' });
        }
    }

    handleInput(ev: React.FormEvent<HTMLInputElement>) {
        const value = ev.currentTarget.value;
        this.setState({ value });
    }

    handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
        ev.preventDefault();
        this.props.onSetVal(this.state.value);
        return false;
    }

    doClear() {
        this.setState({ value: '' });
        this.props.onSetVal('');
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
                        id={this.inputID}
                        placeholder={this.props.placeholder || 'Search'}
                        onChange={this.handleInput.bind(this)}
                        value={this.state.value}
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
