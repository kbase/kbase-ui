import { Option } from 'lib/reactSelectTypes';
import { Component } from "react";
import { Col, Row } from "react-bootstrap";
import Select from "react-select";
import { FieldStatus, StringField } from "../Field";

const OSTI_CONTRIBUTOR_TYPES: Array<Option<string>> = [
    {
        "value": "ContactPerson",
        "label": "Person with knowledge of how to access, troubleshoot, or otherwise field issues related to the resource."
    },
    {
        "value": "DataCollector",
        "label": "Person/institution responsible for finding or gathering data under the guidelines of the author(s) or Principal Investigator."
    },
    {
        "value": "DataCurator",
        "label": "Person tasked with reviewing, enhancing, cleaning, or standardizing metadata and the associated data submitted."
    },
    {
        "value": "DataManager",
        "label": "Person (or organization with a staff of data managers, such as a data centre) responsible for maintaining the finished resource."
    },
    {
        "value": "Distributor",
        "label": "Institution tasked with responsibility to generate/disseminate copies of the resource in either electronic or print form."
    },
    {
        "value": "Editor",
        "label": "A person who oversees the details related to the publication format of the resource."
    },
    {
        "value": "HostingInstitution",
        "label": "The organization allowing the resource to be available on the internet."
    },
    {
        "value": "Producer",
        "label": "Typically a person or organization responsible for the artistry and form of a media product."
    },
    {
        "value": "ProjectLeader",
        "label": "Person officially designated as head of project team instrumental in the work necessary to development of the resource."
    },
    {
        "value": "ProjectManager",
        "label": "Person officially designated as manager of a project. Project may consist of one or many project teams and sub-teams."
    },
    {
        "value": "ProjectMember",
        "label": "Person on the membership list of a designated project/project team."
    },
    {
        "value": "RegistrationAgency",
        "label": "Institution officially appointed by a Registration Authority to handle specific tasks within a defined area of responsibility."
    },
    {
        "value": "RegistrationAuthority",
        "label": "A standards-setting body from which Registration Agencies obtain official recognition and guidance."
    },
    {
        "value": "RelatedPerson",
        "label": "Person with no specifically defined role in the development of the resource, but who is someone the author wishes to recognize."
    },
    {
        "value": "Researcher",
        "label": "A person involved in analyzing data or the results of an experiment or formal study."
    },
    {
        "value": "ResearchGroup",
        "label": "Refers to a group of individuals with a lab, department, or division; the group has a particular, defined focus of activity."
    },
    {
        "value": "RightsHolder",
        "label": "Person or institution owning or managing property rights, including intellectual property rights over the resource."
    },
    {
        "value": "Sponsor",
        "label": "Person or organization that issued a contract or under the auspices of which a work has been performed."
    },
    {
        "value": "Supervisor",
        "label": "Designated administrator over one or more groups working to produce a resource or over one or more steps of development process."
    },
    {
        "value": "WorkPackageLeader",
        "label": "A Work Package is a recognized data product, not all of which is included in publication."
    },
    {
        "value": "Other",
        "label": "Any person or institution making a significant contribution, but whose contribution does not fit."
    }
];

export interface FormDropdownStringFieldProps {
    field: StringField;
    label: string;
    onEdit: (editValue: string) => void;
}

export class FormDropdownStringField extends Component<FormDropdownStringFieldProps> {

    onChange(value: string) {
        this.props.onEdit(value);
    }

    getOptionValue(): Option<string> | null {
        const currentValue: string = this.props.field.getEditValue();
        return OSTI_CONTRIBUTOR_TYPES.filter(({ value, label }) => {
            return (value === currentValue)
        })[0] || null;
    }

    renderControl() {
        const classes = [];
        switch (this.props.field.getStatus()) {
            case FieldStatus.NONE:
                return;
            case FieldStatus.INVALID:
                classes.push('is-invalid')
                break;
            case FieldStatus.REQUIRED_EMPTY:
                classes.push('is-invalid')
        }

        return <Select<Option<string>>
            // styles={{ menu: (css) => ({ ...css, width: 'max-content', maxWidth: '20em' }) }}
            isSearchable={true}
            // defaultValue={currentRelationship}
            onChange={(newValue) => { this.onChange(newValue!.value) }}
            options={OSTI_CONTRIBUTOR_TYPES}
            value={this.getOptionValue()}
            formatOptionLabel={({ value, label }) => {
                return <div>
                    <b>{value}</b> - {label}
                </div>
            }}
        />
    }
    renderLabel() {
        const requiredIcon = (() => {
            if (!(this.props.field.isRequired)) {
                return;
            }
            if (this.props.field.getStatus() === FieldStatus.REQUIRED_EMPTY) {
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
        return <div>{message}</div>;
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