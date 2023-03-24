import { Component } from 'react';
import { Button, FormControl } from 'react-bootstrap';

export interface DOIFormProps {
    doi: string | null;
    saving: boolean;
    save: (doi: string) => void;
}

interface DOIFormState {
    doi: string;
}

export default class DOIForm extends Component<DOIFormProps, DOIFormState> {
    constructor(props: DOIFormProps) {
        super(props);
        this.state = {
            doi: props.doi || ''
        }
    }
    render() {
        return  <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'column', fontWeight: 'bold', color: 'gray', flex: '0 0 auto', marginRight: '0.5em'}}>
                    DOI
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '0.5em', marginRight: '0.5em' }}>
                    <FormControl type="text"
                        value={this.state.doi || ''}
                        onInput={(ev) => { this.setState({ doi: ev.currentTarget.value }) }} />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', flex: '0 0 auto', marginLeft: '0.5em'}}>
                    <Button onClick={() => { this.props.save(this.state.doi) }} disabled={this.props.saving}>Save</Button>
                </div>
            </div>
    }
}