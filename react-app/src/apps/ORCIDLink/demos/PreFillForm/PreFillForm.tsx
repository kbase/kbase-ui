import { Affiliation, ORCIDProfile } from "apps/ORCIDLink/Model";
import { isEqual } from "lib/kb_lib/Utils";
import { Component } from "react";
import { Button, Form } from "react-bootstrap";
import styles from './PreFillForm.module.css';
import { DataState } from './PreFillFormController';

export interface PreFillFormProps {
    profile: ORCIDProfile;
    syncProfile: () => Promise<void>;
}

interface PreFillFormState {
    profile: ORCIDProfile;

    // TODO: this should be an editable model, with edit
    // state for each editable thing.
    firstName: string;
    lastName: string;
    name: string;
    bio: string;
    affiliations: Array<Affiliation>;
}

export default class PreFillForm extends Component<PreFillFormProps, PreFillFormState> {

    constructor(props: PreFillFormProps) {
        super(props);
        this.state = this.stateFromProps()
    }

    stateFromProps() {
        return {
            profile: this.props.profile,
            firstName: this.props.profile.firstName,
            lastName: this.props.profile.lastName,
            name: this.props.profile.firstName + ' ' + this.props.profile.lastName,
            bio: this.props.profile.bio,
            affiliations: this.props.profile.affiliations
        };
    }

    componentDidUpdate(prevProps: PreFillFormProps, prevState: PreFillFormState) {
        const { firstName, lastName, bio, affiliations } = prevState;
        const prevProfile = { firstName, lastName, bio, affiliations };

        if (!isEqual(prevState.profile, this.props.profile)) {
            this.setState(this.stateFromProps());
        }

        // if (prevState.firstName === this.props.profile.firstName &&
        //     prevState.lastName === this.props.profile.lastName &&
        //     prevState.bio === this.props.profile.bio) {
        //     return;
        // }

    }

    changeFirstName(firstName: string) {
        this.setState({
            firstName
        });
    }

    changeLastName(lastName: string) {
        this.setState({
            lastName
        });
    }

    changeName(name: string) {
        this.setState({
            name
        });
    }

    changeBio(bio: string) {
        this.setState({
            bio
        });
    }

    onClearForm() {
        this.setState({
            firstName: '',
            lastName: '',
            name: '',
            bio: '',
            affiliations: []
        })
    }

    onSyncForm() {
        this.props.syncProfile();
    }

    renderAffiliations() {
        const rows = this.state.affiliations.map(({ name, role, startYear, endYear }, index) => {
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
                        <input type="text" className="form-control" value={this.state.firstName}
                            onInput={(e) => { this.changeFirstName(e.currentTarget.value) }} />
                    </div>
                </div>
                <div className="flex-row">
                    <div className="flex-col" style={{ flex: '0 0 10em', fontWeight: 'bold', color: 'rgba(150, 150, 150)' }} >
                        Last Name
                    </div>
                    <div className="flex-col">
                        <input type="text" className="form-control" value={this.state.lastName}
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
                        <textarea className="form-control" value={this.state.bio || ''}
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

    renderIntro() {
        return <div>
            <h2>
                DEMO: Pre Fill a Form from Profile
            </h2>
            <p>
                <a href="/#orcidlink">Back</a>
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
                    Modify ORCID profile, <b>then</b> clear, sync
                </li>
                <li>
                    Make ORCID profile field private, <b>then</b> clear, sync
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