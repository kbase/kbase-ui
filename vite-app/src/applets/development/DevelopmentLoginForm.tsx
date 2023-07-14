import { Component, FormEvent } from 'react';

export interface DevelopmentLoginFormProps {
    onLogin: (token: string) => void;
}

interface DevelopmentLoginFormState {
    token: string | null;
}

export default class DevelopmentLoginForm extends Component<
    DevelopmentLoginFormProps,
    DevelopmentLoginFormState
> {
    constructor(props: DevelopmentLoginFormProps) {
        super(props);
        this.state = {
            token: null,
        };
    }
    doLoginSubmit(ev: FormEvent<HTMLFormElement>) {
        ev.preventDefault();
        if (this.state.token) {
            this.props.onLogin(this.state.token);
        }
        return false;
    }

    onTokenInput(ev: FormEvent<HTMLInputElement>) {
        this.setState({
            token: ev.currentTarget.value,
        });
    }

    isValidToken() {
        const token = this.state.token;
        if (!token) {
            return false;
        }
        if (token.length !== 32) {
            return false;
        }
        return true;
    }

    render() {
        return (
            <form className="form" onSubmit={this.doLoginSubmit.bind(this)}>
                <h3 style={{ textAlign: 'center' }}>Development Mode Login</h3>
                <p>Please Enter a KBase Login Token Below: </p>
                <div className="form-group row">
                    <div
                        className="col-sm-2"
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <label htmlFor="kbase-token">Token</label>
                    </div>
                    <div className="col-sm-10">
                        <input
                            id="kbase-token"
                            type="text"
                            className="form-control"
                            name="token"
                            onInput={this.onTokenInput.bind(this)}
                        ></input>
                    </div>
                </div>
                <div className="form-group" style={{ textAlign: 'center', marginTop: '10px' }}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!this.isValidToken()}
                    >
                        Use Token
                    </button>
                </div>
            </form>
        );
    }
}
