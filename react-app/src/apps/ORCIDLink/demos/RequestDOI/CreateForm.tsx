import { Component } from 'react';
import { Button } from 'react-bootstrap';

export interface CreateFormProps {
    createForm: () => void;
}

interface CreateFormState {

}

export default class CreateForm extends Component<CreateFormProps, CreateFormState> {

    render() {
        return <div className="well">
            <div className="well-header">
                Create DOI Form
            </div>
            <div className="well-body">
                <p>
                    Blah blah
                </p>
            </div>
            <div className="well-footer">
                <Button variant="primary" onClick={this.props.createForm} >
                    <span className="fa fa-plus" /> Create New Form
                </Button>
            </div>
        </div>
    }
}