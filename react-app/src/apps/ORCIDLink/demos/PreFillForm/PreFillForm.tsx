import { renderORCIDIcon } from "apps/ORCIDLink/common";
import { ORCID_URL } from "apps/ORCIDLink/constants";
import { ORCIDProfile } from "apps/ORCIDLink/Model";
import { isEqual } from "lib/kb_lib/Utils";
import { Component } from "react";
import { Button, Form } from "react-bootstrap";
import styles from './PreFillForm.module.css';

export interface PreFillFormProps {
    profile: ORCIDProfile;
    syncProfile: () => Promise<void>;
}

interface PreFillFormState {
    profile: ORCIDProfile;

    // TODO: this should be an editable model, with edit
    // state for each editable thing.
    name: string;
}

export default class PreFillForm extends Component<PreFillFormProps, PreFillFormState> {

    constructor(props: PreFillFormProps) {
        super(props);
        this.state = this.stateFromProps()
    }

    stateFromProps() {
        return {
            profile: this.props.profile,
            name: this.props.profile.firstName + ' ' + this.props.profile.lastName,
        };
    }

    componentDidUpdate(prevProps: PreFillFormProps, prevState: PreFillFormState) {
        if (!isEqual(prevState.profile, this.props.profile)) {
            this.setState(this.stateFromProps());
        }
    }

    changeFirstName(firstName: string) {
        this.setState({
            profile: {
                ...this.state.profile,
                firstName
            }
        });
    }

    changeLastName(lastName: string) {
        this.setState({
            profile: {
                ...this.state.profile,
                lastName
            }
        });
    }

    changeName(name: string) {
        this.setState({
            name
        });
    }

    changeBio(bio: string) {
        this.setState({
            profile: {
                ...this.state.profile,
                bio
            }
        });
    }

    onClearForm() {
        this.setState({
            profile: {
                ...this.state.profile,
                firstName: '',
                lastName: '',
                bio: '',
                affiliations: []
            },
            name: ''
        })
    }

    onSyncForm() {
        this.props.syncProfile();
    }

    renderAffiliations() {
        const rows = this.state.profile.affiliations.map(({ name, role, startYear, endYear }, index) => {
            return <tr key={index}>
                <td>{name}</td>
                <td>{role}</td>
                <td>{startYear}</td>
                <td>{endYear || "-"}</td>
            </tr>
        });
        return <table className="table table-bordered">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Start</th>
                    <th>End</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    }

    renderForm() {
        return <Form className={`${styles.main} well`} style={{ padding: '1em' }}>
            <div className="flex-table">
                <div className="flex-row">
                    <div className="flex-col" style={{ flex: '0 0 10em', fontWeight: 'bold', color: 'rgba(150, 150, 150)' }} >
                        First Name
                    </div>
                    <div className="flex-col">
                        <input type="text" className="form-control" value={this.state.profile.firstName}
                            onInput={(e) => { this.changeFirstName(e.currentTarget.value) }} />
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={{ flex: '0 0 10em', fontWeight: 'bold', color: 'rgba(150, 150, 150)' }} >
                        Last Name
                    </div>
                    <div className="flex-col">
                        <input type="text" className="form-control" value={this.state.profile.lastName}
                            onInput={(e) => { this.changeLastName(e.currentTarget.value || '') }} />
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={{ flex: '0 0 10em', fontWeight: 'bold', color: 'rgba(150, 150, 150)' }} >
                        Name
                    </div>
                    <div className="flex-col">
                        <input type="text" className="form-control" value={this.state.name}
                            onInput={(e) => { this.changeName(e.currentTarget.value || '') }} />
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={{ flex: '0 0 10em', fontWeight: 'bold', color: 'rgba(150, 150, 150)' }} >
                        Bio
                    </div>
                    <div className="flex-col">
                        <textarea className="form-control" value={this.state.profile.bio || ''}
                            onInput={(e) => { this.changeBio(e.currentTarget.value) }} />
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={{ flex: '0 0 10em', fontWeight: 'bold', color: 'rgba(150, 150, 150)' }} >
                        Affiliations
                    </div>
                    <div className="flex-col">
                        {this.renderAffiliations()}
                    </div>
                </div>
                <div className="flex-row" style={{ justifyContent: 'center', marginTop: '1em' }}>

                    <Button variant="secondary" onClick={this.onSyncForm.bind(this)} style={{ marginRight: '0.5em' }}>
                        Sync
                    </Button>
                    <Button variant="danger" onClick={this.onClearForm.bind(this)}>
                        Clear
                    </Button>
                </div>
            </div>
        </Form >;
    }

    renderORCIDLink(label: string) {
        return <a href={`${ORCID_URL}/${this.props.profile.orcidId}`} target="_blank">
            {renderORCIDIcon()}
            {label}
        </a>
    }

    renderIntro() {
        return <div>
            <h2>
                DEMO: Pre Fill a Form from Profile
            </h2>
            <p>
                <Button variant="secondary" href="/#orcidlink"><span className="fa fa-arrow-left" /> Back</Button>
            </p>
            <p>
                This is a demonstration of using a link to ORCID to pre-fill (or fill afterwards) a form using the
                user's ORCID profile.
            </p>
            <p>
                Here are some things to do:
            </p>
            <ul>
                <li>
                    Click clear button, then the Sync button
                </li>
                <li>
                    Modify {this.renderORCIDLink("ORCID profile")}, <b>then</b> clear, sync
                </li>
                <li>
                    Make {this.renderORCIDLink("ORCID profile")} field private, <b>then</b> clear, sync
                </li>
            </ul>
        </div>
    }

    render() {
        return <div className={`${styles.main} flex-table`}>
            <div className="flex-row">
                <div className="flex-col">
                    {this.renderIntro()}
                </div>
                <div className="flex-col">
                    {this.renderForm()}
                </div>
            </div>
        </div>;
    }
}