import ErrorAlert from 'components/ErrorAlert';
import Loading from 'components/Loading';
import { AsyncProcess, AsyncProcessStatus } from 'lib/AsyncProcess';
import { Component } from 'react';
import { Row, Stack } from 'react-bootstrap';
import AuthorForm from './AuthorForm';
import { EditableAuthor } from './AuthorsSectionController';
import { ValidationStatus } from './Field';


export interface ControllerProps {
    author: EditableAuthor
    onUpdate: (author: EditableAuthor) => void;
}


export interface FormState {
    // status: FormStatus;
    // canImportFromORCID: boolean;
    trigger: number;
    author: EditableAuthor;
}

export type DataState = AsyncProcess<FormState, { message: string }>


interface ControllerState {
    dataState: DataState
}

export default class Controller extends Component<ControllerProps, ControllerState> {
    constructor(props: ControllerProps) {
        super(props);

        this.state = {
            dataState: {
                status: AsyncProcessStatus.SUCCESS,
                value: {
                    trigger: Date.now(),
                    author: this.props.author
                }
            }
        }
    }

    // Model interaction

    // async loadORCIDProfile() {
    //     await new Promise((resolve) => {
    //         this.setState({
    //             dataState: {
    //                 status: AsyncProcessStatus.PENDING
    //             }
    //         }, () => {
    //             resolve(null);
    //         });
    //     });
    //     try {
    //         const isLinked = await this.props.model.isLinked();
    //         if (!isLinked) {
    //             this.setState({
    //                 dataState: {
    //                     status: AsyncProcessStatus.SUCCESS,
    //                     value: {
    //                         status: FormStatus.INITIAL,
    //                         canImportFromORCID: false,
    //                         fields: {
    //                             firstName: {
    //                                 status: FieldStatus.INITIAL,
    //                                 rawValue: this.props.firstName || '',
    //                                 value: this.props.firstName || ''
    //                             },
    //                             middleName: {
    //                                 status: FieldStatus.INITIAL,
    //                                 rawValue: this.props.middleName || '',
    //                                 value: this.props.middleName || ''
    //                             },
    //                             lastName: {
    //                                 status: FieldStatus.INITIAL,
    //                                 rawValue: this.props.lastName || '',
    //                                 value: this.props.lastName || ''
    //                             },
    //                             emailAddress: {
    //                                 status: FieldStatus.INITIAL,
    //                                 rawValue: this.props.emailAddress || '',
    //                                 value: this.props.emailAddress || ''
    //                             },
    //                             orcidId: {
    //                                 status: FieldStatus.INITIAL,
    //                                 rawValue: this.props.orcidId || '',
    //                                 value: this.props.orcidId || ''
    //                             },
    //                             institution: {
    //                                 status: FieldStatus.INITIAL,
    //                                 rawValue: this.props.institution || '',
    //                                 value: this.props.institution || ''
    //                             },
    //                             contributorType: {
    //                                 status: FieldStatus.INITIAL,
    //                                 rawValue: this.props.contributorType || '',
    //                                 value: this.props.contributorType || ''
    //                             }
    //                         }
    //                     }
    //                 }
    //             }, () => {
    //                 this.onUpdate();
    //             });
    //         } else {
    //             const orcidProfile = await this.props.model.getProfile();
    //             const { firstName, lastName, orcidId, emailAddresses, affiliations } = orcidProfile;
    //             const emailAddress = emailAddresses[0] || '';

    //             const orgs = affiliations.filter(({ endYear }) => {
    //                 return !endYear;
    //             }).map(({ name }) => {
    //                 return name;
    //             }).join(', ');

    //             this.setState({
    //                 dataState: {
    //                     status: AsyncProcessStatus.SUCCESS,
    //                     value: {
    //                         status: FormStatus.INITIAL,
    //                         canImportFromORCID: true,
    //                         fields: {
    //                             firstName: {
    //                                 status: FieldStatus.INITIAL,
    //                                 rawValue: firstName,
    //                                 value: firstName
    //                             },
    //                             middleName: {
    //                                 status: FieldStatus.INITIAL,
    //                                 rawValue: this.props.middleName || '',
    //                                 value: this.props.middleName || ''
    //                             },
    //                             lastName: {
    //                                 status: FieldStatus.INITIAL,
    //                                 rawValue: lastName,
    //                                 value: lastName
    //                             },
    //                             emailAddress: {
    //                                 status: FieldStatus.INITIAL,
    //                                 rawValue: emailAddress,
    //                                 value: emailAddress
    //                             },
    //                             orcidId: {
    //                                 status: FieldStatus.INITIAL,
    //                                 rawValue: orcidId,
    //                                 value: orcidId
    //                             },
    //                             institution: {
    //                                 status: FieldStatus.INITIAL,
    //                                 rawValue: orgs,
    //                                 value: orgs
    //                             },
    //                             contributorType: {
    //                                 status: FieldStatus.INITIAL,
    //                                 rawValue: '',
    //                                 value: ''
    //                             }
    //                         }
    //                     }
    //                 }
    //             }, () => {
    //                 this.onUpdate();
    //             });
    //         }

    //     } catch (ex) {
    //         if (ex instanceof Error) {
    //             this.setState({
    //                 dataState: {
    //                     status: AsyncProcessStatus.ERROR,
    //                     error: {
    //                         message: ex.message
    //                     }
    //                 }
    //             });
    //         } else {
    //             this.setState({
    //                 dataState: {
    //                     status: AsyncProcessStatus.ERROR,
    //                     error: {
    //                         message: `Unknown error: ${String(ex)}`
    //                     }
    //                 }
    //             });
    //         }
    //     }
    // }

    // async evaluateFields(): Promise<void> {
    //     new Promise<void>((resolve, reject) => {
    //         // TODO: this is currently fake...
    //         if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //             reject(new Error('Not in SUCCESS state'));
    //             return;
    //         }
    //         this.setState({
    //             dataState: {
    //                 ...this.state.dataState,
    //                 value: {
    //                     ...this.state.dataState.value,
    //                     fields: {
    //                         firstName: this.evaluateFirstName(),
    //                         middleName: this.evaluateMiddleName(),
    //                         lastName: this.evaluateLastName(),
    //                         emailAddress: this.evaluateEMailAddress(),
    //                         orcidId: this.evaluateORCIDId(),
    //                         institution: this.evaluateInstitution(),
    //                         contributorType: this.evaluateContributorType()
    //                     }

    //                 }
    //             }
    //         }, () => {
    //             resolve();
    //         })
    //     });
    // }

    // async onUpdate() {
    //     if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //         return;
    //     }
    //     await this.evaluateFields();
    //     const {
    //         firstName, middleName, lastName, emailAddress, institution, orcidId, contributorType
    //     } = this.state.dataState.value.fields;

    //     // TODO: actually, need a validation process to run somewhere before this...
    //     // Ensure all fields are valid.

    //     if (!(firstName.status === FieldStatus.VALID &&
    //         middleName.status === FieldStatus.VALID &&
    //         lastName.status === FieldStatus.VALID &&
    //         emailAddress.status === FieldStatus.VALID &&
    //         institution.status === FieldStatus.VALID &&
    //         orcidId.status === FieldStatus.VALID &&
    //         contributorType.status === FieldStatus.VALID)) {
    //         return;
    //     }
    //     const x = firstName;
    //     const author: Author = {
    //         firstName: firstName.value,
    //         middleName: middleName.value,
    //         lastName: lastName.value,
    //         emailAddress: emailAddress.value,
    //         institution: institution.value,
    //         orcidId: orcidId.value,
    //         contributorType: contributorType.value
    //     };
    //     this.props.onUpdate(author);
    // }

    // evaluateFirstName(): FieldState<string, string> {
    //     if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //         throw new Error('Async process not SUCCESS');
    //     }
    //     const field = this.state.dataState.value.fields.firstName;
    //     switch (field.status) {
    //         case FieldStatus.NONE:
    //             // nothing to evaluate.
    //             return {
    //                 status: FieldStatus.NONE
    //             };
    //         case FieldStatus.INITIAL:
    //         case FieldStatus.VALID: {
    //             // VALIDATE!
    //             const { value, rawValue } = field;
    //             return {
    //                 status: FieldStatus.VALID,
    //                 rawValue,
    //                 value
    //             }
    //         }
    //         case FieldStatus.INVALID: {
    //             // VALIDATE!
    //             const { rawValue } = field;
    //             return {
    //                 status: FieldStatus.VALID,
    //                 rawValue,
    //                 value: rawValue
    //             }
    //         }
    //     }
    // }

    // evaluateMiddleName(): FieldState<string, string> {
    //     if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //         throw new Error('Async process not SUCCESS');
    //     }
    //     const field = this.state.dataState.value.fields.middleName;
    //     switch (field.status) {
    //         case FieldStatus.NONE:
    //             // nothing to evaluate.
    //             return {
    //                 status: FieldStatus.NONE
    //             };
    //         case FieldStatus.INITIAL:
    //         case FieldStatus.VALID: {
    //             // VALIDATE!
    //             const { value, rawValue } = field;
    //             return {
    //                 status: FieldStatus.VALID,
    //                 rawValue,
    //                 value
    //             }
    //         }
    //         case FieldStatus.INVALID: {
    //             // VALIDATE!
    //             const { rawValue } = field;
    //             return {
    //                 status: FieldStatus.VALID,
    //                 rawValue,
    //                 value: rawValue
    //             }
    //         }
    //     }
    // }

    // evaluateLastName(): FieldState<string, string> {
    //     if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //         throw new Error('Async process not SUCCESS');
    //     }
    //     const field = this.state.dataState.value.fields.lastName;
    //     switch (field.status) {
    //         case FieldStatus.NONE:
    //             // nothing to evaluate.
    //             return {
    //                 status: FieldStatus.NONE
    //             };
    //         case FieldStatus.INITIAL:
    //         case FieldStatus.VALID: {
    //             // VALIDATE!
    //             const { value, rawValue } = field;
    //             return {
    //                 status: FieldStatus.VALID,
    //                 rawValue,
    //                 value
    //             }
    //         }
    //         case FieldStatus.INVALID: {
    //             // VALIDATE!
    //             const { rawValue } = field;
    //             return {
    //                 status: FieldStatus.VALID,
    //                 rawValue,
    //                 value: rawValue
    //             }
    //         }
    //     }
    // }

    // evaluateEMailAddress(): FieldState<string, string> {
    //     if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //         throw new Error('Async process not SUCCESS');
    //     }
    //     const field = this.state.dataState.value.fields.emailAddress;
    //     switch (field.status) {
    //         case FieldStatus.NONE:
    //             // nothing to evaluate.
    //             return {
    //                 status: FieldStatus.NONE
    //             };
    //         case FieldStatus.INITIAL:
    //         case FieldStatus.VALID: {
    //             // VALIDATE!
    //             const { value, rawValue } = field;
    //             return {
    //                 status: FieldStatus.VALID,
    //                 rawValue,
    //                 value
    //             }
    //         }
    //         case FieldStatus.INVALID: {
    //             // VALIDATE!
    //             const { rawValue } = field;
    //             return {
    //                 status: FieldStatus.VALID,
    //                 rawValue,
    //                 value: rawValue
    //             }
    //         }
    //     }
    // }

    // evaluateORCIDId(): FieldState<string, string> {
    //     if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //         throw new Error('Async process not SUCCESS');
    //     }
    //     const field = this.state.dataState.value.fields.orcidId;
    //     switch (field.status) {
    //         case FieldStatus.NONE:
    //             // nothing to evaluate.
    //             return {
    //                 status: FieldStatus.NONE
    //             };
    //         case FieldStatus.INITIAL:
    //         case FieldStatus.VALID: {
    //             // VALIDATE!
    //             const { value, rawValue } = field;
    //             return {
    //                 status: FieldStatus.VALID,
    //                 rawValue,
    //                 value
    //             }
    //         }
    //         case FieldStatus.INVALID: {
    //             // VALIDATE!
    //             const { rawValue } = field;
    //             return {
    //                 status: FieldStatus.VALID,
    //                 rawValue,
    //                 value: rawValue
    //             }
    //         }
    //     }
    // }

    // evaluateInstitution(): FieldState<string, string> {
    //     if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //         throw new Error('Async process not SUCCESS');
    //     }
    //     const field = this.state.dataState.value.fields.institution;
    //     switch (field.status) {
    //         case FieldStatus.NONE:
    //             // nothing to evaluate.
    //             return {
    //                 status: FieldStatus.NONE
    //             };
    //         case FieldStatus.INITIAL:
    //         case FieldStatus.VALID: {
    //             // VALIDATE!
    //             const { value, rawValue } = field;
    //             return {
    //                 status: FieldStatus.VALID,
    //                 rawValue,
    //                 value
    //             }
    //         }
    //         case FieldStatus.INVALID: {
    //             // VALIDATE!
    //             const { rawValue } = field;
    //             return {
    //                 status: FieldStatus.VALID,
    //                 rawValue,
    //                 value: rawValue
    //             }
    //         }
    //     }
    // }

    // evaluateContributorType(): FieldState<string, string> {
    //     if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //         throw new Error('Async process not SUCCESS');
    //     }
    //     const field = this.state.dataState.value.fields.contributorType;
    //     switch (field.status) {
    //         case FieldStatus.NONE:
    //             // nothing to evaluate.
    //             return {
    //                 status: FieldStatus.NONE
    //             };
    //         case FieldStatus.INITIAL:
    //         case FieldStatus.VALID: {
    //             // VALIDATE!
    //             const { value, rawValue } = field;
    //             return {
    //                 status: FieldStatus.VALID,
    //                 rawValue,
    //                 value
    //             }
    //         }
    //         case FieldStatus.INVALID: {
    //             // VALIDATE!
    //             const { rawValue } = field;
    //             return {
    //                 status: FieldStatus.VALID,
    //                 rawValue,
    //                 value: rawValue
    //             }
    //         }
    //     }
    // }


    // async updateFirstName(value: string) {
    //     return new Promise<void>((resolve, reject) => {
    //         if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //             reject(new Error('Async process not SUCCESS'));
    //             return;
    //         }
    //         const firstName = ((firstName: FieldState<string, string>): FieldState<string, string> => {
    //             // TODO: validation
    //             switch (firstName.status) {
    //                 case FieldStatus.NONE:
    //                     return firstName;
    //                 case FieldStatus.INITIAL:
    //                 case FieldStatus.VALID:
    //                 case FieldStatus.INVALID:
    //                     return {
    //                         status: FieldStatus.VALID,
    //                         rawValue: value,
    //                         value
    //                     }
    //             }
    //         })(this.state.dataState.value.fields.firstName);
    //         this.setState({
    //             dataState: {
    //                 ...this.state.dataState,
    //                 value: {
    //                     ...this.state.dataState.value,
    //                     fields: {
    //                         ...this.state.dataState.value.fields,
    //                         firstName
    //                     }
    //                 }
    //             }
    //         }, () => {
    //             resolve();
    //         });
    //     });
    // }

    // async updateMiddleName(value: string) {
    //     return new Promise<void>((resolve, reject) => {
    //         if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //             reject(new Error('Async process not SUCCESS'));
    //             return;
    //         }
    //         const middleName = ((middleName: FieldState<string, string>): FieldState<string, string> => {
    //             // TODO: validation
    //             switch (middleName.status) {
    //                 case FieldStatus.NONE:
    //                     return middleName;
    //                 case FieldStatus.INITIAL:
    //                 case FieldStatus.VALID:
    //                 case FieldStatus.INVALID:
    //                     return {
    //                         status: FieldStatus.VALID,
    //                         rawValue: value,
    //                         value
    //                     }
    //             }
    //         })(this.state.dataState.value.fields.middleName);
    //         this.setState({
    //             dataState: {
    //                 ...this.state.dataState,
    //                 value: {
    //                     ...this.state.dataState.value,
    //                     fields: {
    //                         ...this.state.dataState.value.fields,
    //                         middleName
    //                     }
    //                 }
    //             }
    //         }, () => {
    //             resolve();
    //         });
    //     });
    // }

    // async updateLastName(value: string) {
    //     return new Promise<void>((resolve, reject) => {
    //         if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //             reject(new Error('Async process not SUCCESS'));
    //             return;
    //         }
    //         const lastName = ((lastName: FieldState<string, string>): FieldState<string, string> => {
    //             // TODO: validation
    //             switch (lastName.status) {
    //                 case FieldStatus.NONE:
    //                     return lastName;
    //                 case FieldStatus.INITIAL:
    //                 case FieldStatus.VALID:
    //                 case FieldStatus.INVALID:
    //                     return {
    //                         status: FieldStatus.VALID,
    //                         rawValue: value,
    //                         value
    //                     }
    //             }
    //         })(this.state.dataState.value.fields.lastName);
    //         this.setState({
    //             dataState: {
    //                 ...this.state.dataState,
    //                 value: {
    //                     ...this.state.dataState.value,
    //                     fields: {
    //                         ...this.state.dataState.value.fields,
    //                         lastName
    //                     }
    //                 }
    //             }
    //         }, () => {
    //             resolve();
    //         });
    //     });
    // }

    // async updateEMailAddress(value: string) {
    //     return new Promise<void>((resolve, reject) => {
    //         if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //             reject(new Error('Async process not SUCCESS'));
    //             return;
    //         }
    //         const emailAddress = ((emailAddress: FieldState<string, string>): FieldState<string, string> => {
    //             // TODO: validation
    //             switch (emailAddress.status) {
    //                 case FieldStatus.NONE:
    //                     return emailAddress;
    //                 case FieldStatus.INITIAL:
    //                 case FieldStatus.VALID:
    //                 case FieldStatus.INVALID:
    //                     return {
    //                         status: FieldStatus.VALID,
    //                         rawValue: value,
    //                         value
    //                     }
    //             }
    //         })(this.state.dataState.value.fields.emailAddress);
    //         this.setState({
    //             dataState: {
    //                 ...this.state.dataState,
    //                 value: {
    //                     ...this.state.dataState.value,
    //                     fields: {
    //                         ...this.state.dataState.value.fields,
    //                         emailAddress
    //                     }
    //                 }
    //             }
    //         }, () => {
    //             resolve();
    //         });
    //     });
    // }

    // async updateInstitution(value: string) {
    //     return new Promise<void>((resolve, reject) => {
    //         if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //             reject(new Error('Async process not SUCCESS'));
    //             return;
    //         }
    //         const institution = ((institution: FieldState<string, string>): FieldState<string, string> => {
    //             // TODO: validation
    //             switch (institution.status) {
    //                 case FieldStatus.NONE:
    //                     return institution;
    //                 case FieldStatus.INITIAL:
    //                 case FieldStatus.VALID:
    //                 case FieldStatus.INVALID:
    //                     return {
    //                         status: FieldStatus.VALID,
    //                         rawValue: value,
    //                         value
    //                     }
    //             }
    //         })(this.state.dataState.value.fields.institution);
    //         this.setState({
    //             dataState: {
    //                 ...this.state.dataState,
    //                 value: {
    //                     ...this.state.dataState.value,
    //                     fields: {
    //                         ...this.state.dataState.value.fields,
    //                         institution
    //                     }
    //                 }
    //             }
    //         }, () => {
    //             resolve();
    //         });
    //     });
    // }

    // async updateORCIDId(value: string) {
    //     return new Promise<void>((resolve, reject) => {
    //         if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //             reject(new Error('Async process not SUCCESS'));
    //             return;
    //         }
    //         const orcidId = ((orcidId: FieldState<string, string>): FieldState<string, string> => {
    //             // TODO: validation
    //             switch (orcidId.status) {
    //                 case FieldStatus.NONE:
    //                     return orcidId;
    //                 case FieldStatus.INITIAL:
    //                 case FieldStatus.VALID:
    //                 case FieldStatus.INVALID:
    //                     return {
    //                         status: FieldStatus.VALID,
    //                         rawValue: value,
    //                         value
    //                     }
    //             }
    //         })(this.state.dataState.value.fields.orcidId);
    //         this.setState({
    //             dataState: {
    //                 ...this.state.dataState,
    //                 value: {
    //                     ...this.state.dataState.value,
    //                     fields: {
    //                         ...this.state.dataState.value.fields,
    //                         orcidId
    //                     }
    //                 }
    //             }
    //         }, () => {
    //             resolve();
    //         });
    //     });
    // }

    // async updateContributorType(value: string) {
    //     return new Promise<void>((resolve, reject) => {
    //         if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //             reject(new Error('Async process not SUCCESS'));
    //             return;
    //         }
    //         const contributorType = ((contributorType: FieldState<string, string>): FieldState<string, string> => {
    //             // TODO: validation
    //             switch (contributorType.status) {
    //                 case FieldStatus.NONE:
    //                     return contributorType;
    //                 case FieldStatus.INITIAL:
    //                 case FieldStatus.VALID:
    //                 case FieldStatus.INVALID:
    //                     return {
    //                         status: FieldStatus.VALID,
    //                         rawValue: value,
    //                         value
    //                     }
    //             }
    //         })(this.state.dataState.value.fields.orcidId);
    //         this.setState({
    //             dataState: {
    //                 ...this.state.dataState,
    //                 value: {
    //                     ...this.state.dataState.value,
    //                     fields: {
    //                         ...this.state.dataState.value.fields,
    //                         contributorType
    //                     }
    //                 }
    //             }
    //         }, () => {
    //             resolve();
    //         });
    //     });
    // }



    // async importFromORCID() {
    //     if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //         return;
    //     }

    //     const orcidProfile = await this.props.model.getProfile();
    //     const { firstName, lastName, orcidId, emailAddresses, affiliations } = orcidProfile;
    //     await this.updateFirstName(firstName);
    //     await this.updateLastName(lastName);
    //     await this.updateORCIDId(orcidId);
    //     // TODO: since there may be multiple available email addresses, we need
    //     // a more complex control to allow the user to choose the one they want,
    //     // or to override.
    //     await this.updateEMailAddress(emailAddresses[0] || '')
    //     const orgs = affiliations.filter(({ endYear }) => {
    //         return !endYear;
    //     }).map(({ name }) => {
    //         return name;
    //     }).join(', ');
    //     await (this.updateInstitution(orgs))

    // }

    // async importFromNarrative() {
    //     if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
    //         return;
    //     }

    //     const fields = this.state.dataState.value.fields;

    //     const orcidProfile = await this.props.model.getProfile();
    //     const { firstName, lastName, orcidId } = orcidProfile;
    //     if (fields.firstName.status !== FieldStatus.NONE) {
    //         fields.firstName.value = firstName;
    //     }
    //     if (fields.lastName.status !== FieldStatus.NONE) {
    //         fields.lastName.value = lastName;
    //     }
    //     if (fields.orcidId.status !== FieldStatus.NONE) {
    //         fields.orcidId.value = orcidId;
    //     }

    //     this.setState({
    //         dataState: {
    //             status: AsyncProcessStatus.SUCCESS,
    //             value: {
    //                 ...this.state.dataState.value,
    //                 status: FormStatus.INITIAL,
    //                 fields
    //             }
    //         }
    //     });
    // }

    // Event handlers

    async onResetForm() {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        // await this.updateFirstName('');
        // await this.updateLastName('');
        // await this.updateMiddleName('');
        // await this.updateEMailAddress('');
        // await this.updateORCIDId('');
        // await this.updateInstitution('');
        // await this.updateContributorType('');
    }

    async onEditFirstName(value: string) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.state.dataState.value.author.firstName.set(value);
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    trigger: Date.now()
                }
            }
        });
        this.props.onUpdate(this.state.dataState.value.author);
    }

    async onEditMiddleName(value: string) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.state.dataState.value.author.middleName.set(value);
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    trigger: Date.now()
                }
            }
        });
        this.props.onUpdate(this.state.dataState.value.author);
    }

    async onEditLastName(value: string) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.state.dataState.value.author.lastName.set(value);
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    trigger: Date.now()
                }
            }
        });
        this.props.onUpdate(this.state.dataState.value.author);
    }

    async onEditInstitution(value: string) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.state.dataState.value.author.institutionField.set(value);
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    trigger: Date.now()
                }
            }
        });
        this.props.onUpdate(this.state.dataState.value.author);
    }

    async onEditEmailAddress(value: string) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.state.dataState.value.author.emailAddressField.set(value);
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    trigger: Date.now()
                }
            }
        });
        this.props.onUpdate(this.state.dataState.value.author);
    }

    async onEditORCIDId(value: string) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.state.dataState.value.author.orcidIdField.set(value);
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    trigger: Date.now()
                }
            }
        });
        this.props.onUpdate(this.state.dataState.value.author);
    }

    async onEditContributorType(value: string) {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.state.dataState.value.author.contributorType.set(value);
        this.setState({
            dataState: {
                ...this.state.dataState,
                value: {
                    ...this.state.dataState.value,
                    trigger: Date.now()
                }
            }
        });
        this.props.onUpdate(this.state.dataState.value.author);
    }

    async onImportFromORCID() {
        if (this.state.dataState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        if (this.state.dataState.value.author.orcidIdField.validationState.status !== ValidationStatus.VALID) {
            return;
        }

        // TODO: NOw do it!
        // if (this.state.dataState.value.canImportFromORCID) {
        //     await this.importFromORCID();
        // }
        // import from user profile?

        // await this.importFromNarrative();
    }


    // Renderers

    renderLoading() {
        return <Loading message="Loading ..." />;
    }

    renderError({ message }: { message: string }) {
        return <ErrorAlert message={message} />
    }

    renderSuccess(formState: FormState) {
        return <Stack gap={2}>
            <Row className="g-0">
                <AuthorForm
                    author={formState.author}
                    onEditFirstName={this.onEditFirstName.bind(this)}
                    onEditMiddleName={this.onEditMiddleName.bind(this)}
                    onEditLastName={this.onEditLastName.bind(this)}
                    onEditInstitution={this.onEditInstitution.bind(this)}
                    onEditEmailAddress={this.onEditEmailAddress.bind(this)}
                    onEditORCIDId={this.onEditORCIDId.bind(this)}
                    onEditContributorType={this.onEditContributorType.bind(this)}
                    onResetForm={this.onResetForm.bind(this)}
                    onImportFromORCID={this.onImportFromORCID.bind(this)}
                />
            </Row>
            {/* <Row className="g-0">
                <ButtonToolbar style={{ justifyContent: 'center' }}>
                    <ButtonGroup>
                        <Button variant="outline-primary" onClick={this.onImportToForm.bind(this)}>Import your profile from ORCID</Button>
                        <Button variant="danger" onClick={this.onResetForm.bind(this)}>Erase (empty all form fields)</Button>
                    </ButtonGroup>
                </ButtonToolbar>
            </Row> */}
        </Stack>
    }

    render() {
        switch (this.state.dataState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.dataState.error)
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.dataState.value);
        }
    }
}