import AlertMessage from "components/AlertMessage";
import FlexGrid from "components/FlexGrid";
import { Component } from "react";
import { Button, ButtonGroup, ButtonToolbar, Col, Row, Stack } from "react-bootstrap";
import AuthorForm from "./AuthorFormController";
import { EditableAuthor } from "./AuthorsSectionController";
import { StringField, ValidationStatus } from "./Field";

export interface AuthorsSectionProps {
    authors: Array<EditableAuthor>;
    selected: EditableAuthor | null;
    onEdit: (author: EditableAuthor) => void;
    onDelete: (author: EditableAuthor) => void;
    onUpdate: (author: EditableAuthor) => void;
    onAdd: () => void;
}

interface AuthorsSectionState {
}

export default class AuthorsSection extends Component<AuthorsSectionProps, AuthorsSectionState> {
    constructor(props: AuthorsSectionProps) {
        super(props);
        this.state = {
        }
    }

    // renderAuthors2() {
    //     // const citations = this.state.citations;
    //     // if (citations.length === 0) {
    //     //     return <Empty message="No citations" />
    //     // }
    //     if (this.props.authors.length === 0) {
    //         return <AlertMessage type="warning">
    //             You must provide one or more authors, one of which must be the primary author.
    //         </AlertMessage>
    //     }
    //     const rows = this.props.authors.map((author, index) => {
    //         const buttons = <ButtonGroup>
    //             <Button variant="outline-primary">
    //                 <span className="fa fa-edit" />
    //             </Button>
    //             <Button variant="outline-danger">
    //                 <span className="fa fa-trash" />
    //             </Button>
    //         </ButtonGroup>;
    //         return <FlexGrid.Row key={index} style={{ borderBottom: '1px solid rgba(200, 200, 200, 0.5)', padding: '0.5em 0' }}>
    //             <FlexGrid.Col style={{ flex: '0 0 1.5em' }}>{when(author.orcidId, <span className="fa fa-check text-success" />, <span className="fa fa-ban text-warning" />)}</FlexGrid.Col>
    //             <FlexGrid.Col style={{ flex: '1 1 0' }}>{author.firstName}</FlexGrid.Col>
    //             <FlexGrid.Col style={{ flex: '1 1 0' }}>{author.lastName}</FlexGrid.Col>
    //             <FlexGrid.Col style={{ flex: '1 1 0' }}>{author.orcidId}</FlexGrid.Col>
    //             <FlexGrid.Col style={{ flex: '1 1 0' }}>{author.contributorType}</FlexGrid.Col>
    //             <FlexGrid.Col style={{ flex: '0 0 5em' }}>{buttons}</FlexGrid.Col>
    //         </FlexGrid.Row>
    //     });
    //     return <FlexGrid>
    //         <FlexGrid.Row style={{ borderBottom: '1px dashed rgb(200, 200, 200)' }}>
    //             <FlexGrid.Col style={{ flex: '0 0 1.5em' }}></FlexGrid.Col>
    //             <FlexGrid.Col style={{ flex: '1 1 0' }}>First </FlexGrid.Col>
    //             <FlexGrid.Col style={{ flex: '1 1 0' }}>Last</FlexGrid.Col>
    //             <FlexGrid.Col style={{ flex: '1 1 0' }}>ORCID Id</FlexGrid.Col>
    //             <FlexGrid.Col style={{ flex: '1 1 0' }}>Type</FlexGrid.Col>
    //             <FlexGrid.Col style={{ flex: '0 0 5em' }}></FlexGrid.Col>
    //         </FlexGrid.Row>
    //         {rows}
    //     </FlexGrid>;
    // }

    // renderAuthors() {
    //     if (this.props.authors.length === 0) {
    //         return <AlertMessage type="warning">
    //             You must provide one or more authors, one of which must be the primary author.
    //         </AlertMessage>
    //     }
    //     const authorItems = this.props.authors.map((author, index) => {
    //         return <Accordion.Item eventKey={String(index)}>
    //             <Accordion.Header>
    //                 {author.firstName} {author.middleName ? author.middleName + ' ' : ''}{author.lastName}
    //             </Accordion.Header>
    //             <Accordion.Body>
    //                 More here...
    //             </Accordion.Body>

    //         </Accordion.Item>
    //     })
    //     return <Accordion>
    //         {authorItems}
    //     </Accordion>
    // }

    // renderFirstNameField(field: FirstNameField) {
    //     switch (field.validationState.status) {
    //         case ValidationStatus.NONE:
    //             return 'n/a';
    //         case ValidationStatus.INITIAL_EMPTY:
    //             return '';
    //         case ValidationStatus.REQUIRED_EMPTY:
    //             return '';
    //         case ValidationStatus.INVALID:
    //             return field.getEditValue();
    //         case ValidationStatus.UNTRANSFORMABLE:
    //             return field.getEditValue();
    //         case ValidationStatus.VALID:
    //             return field.getEditValue();
    //     }
    //     return <div>Foo</div>;
    // }


    renderAuthors() {
        // const citations = this.state.citations;
        // if (citations.length === 0) {
        //     return <Empty message="No citations" />
        // }
        if (this.props.authors.length === 0) {
            return <AlertMessage type="warning">
                You must provide one or more authors, one of which must be the primary author.
            </AlertMessage>
        }
        const isValid = (field: StringField) => {
            return [
                ValidationStatus.VALID,
                ValidationStatus.INITIAL_EMPTY
            ].includes(field.validationState.status);
        }
        const rows = this.props.authors.map((author, index) => {
            const buttons = <ButtonGroup>
                <Button variant="outline-primary" onClick={() => { this.props.onEdit(author) }}>
                    <span className="fa fa-edit" />
                </Button>
                <Button variant="outline-danger">
                    <span className="fa fa-trash" onClick={() => { this.props.onDelete(author) }} />
                </Button>
            </ButtonGroup>;
            const renderValidationIcon = () => {
                if (isValid(author.firstName) && isValid(author.middleName) && isValid(author.lastName) &&
                    isValid(author.institutionField) && isValid(author.emailAddressField) && isValid(author.orcidIdField) &&
                    isValid(author.contributorType)) {
                    return <span className="fa fa-check text-success" />
                }
                return <span className="fa fa-times text-danger" />
            };
            return <FlexGrid.Row key={index} style={{ borderBottom: '1px solid rgba(200, 200, 200, 0.5)', padding: '0.5em 0' }}>
                <FlexGrid.Col style={{ flex: '0 0 1.5em' }}>{renderValidationIcon()}</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1 1 0' }}>{author.firstName.getEditValue()}</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1 1 0' }}>{author.lastName.getEditValue()}</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1 1 0' }}>{author.orcidIdField.getEditValue()}</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1 1 0' }}>{author.contributorType.getEditValue()}</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '0 0 5em' }}>{buttons}</FlexGrid.Col>
            </FlexGrid.Row>
        });
        return <FlexGrid>
            <FlexGrid.Row style={{ borderBottom: '1px dashed rgb(200, 200, 200)' }}>
                <FlexGrid.Col style={{ flex: '0 0 1.5em' }}></FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1 1 0' }}>First </FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1 1 0' }}>Last</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1 1 0' }}>ORCID Id</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1 1 0' }}>Type</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '0 0 5em' }}></FlexGrid.Col>
            </FlexGrid.Row>
            {rows}
        </FlexGrid>;
    }


    renderAddBar() {
        return <ButtonToolbar style={{ marginTop: '1em', justifyContent: 'center' }}>
            <Button variant="primary" onClick={this.props.onAdd}>
                <span className="fa fa-plus" /> Add Author
            </Button>
        </ButtonToolbar>
    }

    onUpdate(author: EditableAuthor) {
        this.props.onUpdate(author)
    }

    renderAuthorEditor() {
        if (!(this.props.selected)) {
            return <AlertMessage type="info">
                To edit an Author click the edit button <Button size="sm" variant="secondary-outline" disabled><span className="fa fa-edit" /></Button>, to
                add a new Author, click the <Button size="sm" variant="secondary-outline" disabled><span className="fa fa-plus" /> Add Author</Button> button..
            </AlertMessage>
        }
        return <AuthorForm
            author={this.props.selected}
            onUpdate={this.onUpdate.bind(this)}
            key={this.props.selected.id}
        />
    }

    render() {
        return <Stack>
            <Row>
                <Col md={5}>
                    {this.renderAuthors()}
                    {this.renderAddBar()}
                </Col>
                <Col md={7}>
                    {this.renderAuthorEditor()}
                </Col>
            </Row>
        </Stack>
    }


}