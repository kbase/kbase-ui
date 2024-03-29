import Empty from "components/Empty";
import { Component } from "react";
import { Button, Col, Form, Row, Stack } from "react-bootstrap";
import { FieldStatus, StringArrayField } from "../Field";

export interface Names {
    singular: string;
    plural: string;
}

export interface StringArrayEditorProps {
    field: StringArrayField;
    // name: string;
    names: Names;
    label: string;
    onAdd: (value: Array<string>) => void;
    onRemove: (index: number) => void;
    // onEdit: (editValue: Array<string>) => void;
}

export interface StringArrayEditorState {
    keyword: string;
}

export class StringArrayEditor extends Component<StringArrayEditorProps, StringArrayEditorState> {
    constructor(props: StringArrayEditorProps) {
        super(props);
        this.state = {
            keyword: ''
        }
    }

    renderValueList() {
        const classes = [];
        switch (this.props.field.fieldState.status) {
            case FieldStatus.NONE:
                return;
            case FieldStatus.INVALID:
                classes.push('is-invalid')
                break;
            case FieldStatus.REQUIRED_EMPTY:
                classes.push('is-invalid')
        }

        if (this.props.field.fieldState.editValue.length === 0) {
            return <Empty message="No keywords" size="compact" />
        }

        const keywords = this.props.field.fieldState.editValue.map((value, index) => {
            return <div
                key={index}
                style={{
                    flex: '0 0 auto',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: '0.5em',
                    margin: '0',
                    marginRight: '0.125em',
                    marginBottom: '0.125em',
                    borderRadius: '0.5em',
                    // backgroundColor: 'rgb(225, 225, 225)',
                    border: '1px solid rgb(200, 200, 200)'
                }}>
                <Button variant="outline-danger"
                    style={{ border: 'none', padding: '0.125em', margin: '0', marginRight: '1em' }}
                    onClick={() => { this.props.onRemove(index); }}>
                    <span className="fa fa-trash" />
                </Button>
                {value}
            </div>
        });

        return <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', flex: '0 0 auto' }}>
            {keywords}
        </div>

    }
    renderControl() {
        const classes = [];
        switch (this.props.field.fieldState.status) {
            case FieldStatus.NONE:
                return;
            case FieldStatus.INVALID:
                classes.push('is-invalid')
                break;
            case FieldStatus.REQUIRED_EMPTY:
                classes.push('is-invalid')
        }

        return <Form onSubmit={(e) => {
            e.preventDefault();
            this.onAddKeyword();
        }}>
            <Stack gap={2}>
                <div>
                    <Form.Control
                        type="text"
                        name={this.props.names.plural}
                        placeholder={`Enter a new ${this.props.names.singular}`}
                        value={this.state.keyword}
                        style={{ width: '12em' }}
                        className={classes.join(' ')}
                        onInput={(e) => { this.onEditKeyword(e.currentTarget.value) }}
                    />
                </div>
                <div>
                    {this.renderValueList()}
                </div>
            </Stack>
        </Form>
    }


    onEditKeyword(keyword: string) {
        this.setState({
            keyword
        });
    }

    onAddKeyword() {
        const keywords = this.state.keyword.split(/\s+/);
        this.props.onAdd(keywords);
        this.setState({
            keyword: ''
        })
        // this.props.onEdit(this.)
    }

    renderLabel() {
        const requiredIcon = (() => {
            if (!(this.props.field.isRequired)) {
                return;
            }
            if (this.props.field.fieldState.status === FieldStatus.REQUIRED_EMPTY) {
                return <span className="fa fa-asterisk text-danger ms-1" />;
            } else {
                return <span className="fa fa-asterisk text-secondary ms-1" />;
            }
        })();
        return <>
            <span>{this.props.label}</span>
            {requiredIcon}
        </>;
    }

    renderMessage() {
        const message = (() => {
            switch (this.props.field.fieldState.status) {
                case FieldStatus.REQUIRED_EMPTY:
                    return 'This field is required';
                case FieldStatus.INVALID:
                    return this.props.field.fieldState.message;
            }
        })();
        return <div className="text-danger">{message}</div>;
    }

    render() {
        return <Row className="g-0">
            <Col md={2}>
                {this.renderLabel()}
            </Col>
            <Col md={10}>
                {this.renderControl()}
                {this.renderMessage()}
            </Col>
        </Row>
    }
}
