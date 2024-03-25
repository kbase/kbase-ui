import CloseOutlined from "@ant-design/icons/lib/icons/CloseOutlined";
import SaveOutlined from "@ant-design/icons/lib/icons/SaveOutlined";
import { Button, Checkbox, Form, FormInstance, Input, Space } from "antd";
import { FieldData, FieldName } from "apps/UserProfile/Profile/ProfileEditor";
import Organization from "apps/UserProfile/Profile/fields/Organization";
import { LoginChoice } from "lib/kb_lib/Auth2";
import { Component, ReactNode, createRef } from "react";
import { Button as BSButton } from 'react-bootstrap';
import { Asterisk } from "react-bootstrap-icons";
import referralSourcesData from '../resources/data/referralSources.json';
import CheckUsernameField from "./CheckUsernameField";
import Policy, { CurrentTermsAndConditionsPolicy } from "./Policy";
import { SignUpFormInfo } from "./SignInContinue";

/**
 * Now we use ant design forms. Don't reinvent the wheel (yet again!)
 */

export interface OptionItem {
    value: string
    label: string
}
const referralSources  = referralSourcesData as unknown as Array<OptionItem>

const HEAR_ABOUT_QUESTION = 'How did you hear about us?';

export interface SignUpFormProps {
    choice: LoginChoice;
    serverTimeOffset: number;
    checkUsername: (username: string) => Promise<string|null>
    cancelSignUp: (message: string) => void;
    onSignUp: (signUpInfo: SignUpFormInfo) => void;
}

interface SignUpFormState {
    ready: boolean;
    hearAboutOther: boolean;
    canCheckUsername: boolean;
    isUsernameAvailable: boolean;
    termsAndConditionsOpened: boolean;
    isFormValid: boolean;
}

function fieldNameEqual(fieldName: FieldName, value: string) {
    if (typeof fieldName === 'string') {
        return fieldName === value;
    } else if (Array.isArray(fieldName) && fieldName.length === 1) {
        return fieldName[0] === value;
    }
    return false;
}

export interface FormData {
    realname: string;
    username: string;
    email: string;
    organization: string;
    department: string;
    hearAbout: Array<string>;
    hearAboutOther?: string;

}

export default class SignUpForm extends Component <SignUpFormProps, SignUpFormState> {
    formRef = createRef<FormInstance>()
    policy: CurrentTermsAndConditionsPolicy = new Policy().currentPolicy();
    constructor(props: SignUpFormProps) {
        super(props);

        this.state = {
            ready: true,
            hearAboutOther: false,
            canCheckUsername: false,
            isUsernameAvailable: false,
            termsAndConditionsOpened: false,
            isFormValid: false
        }
    }

    componentDidMount() {
        const {realname, email} = (() => {
            const createChoice = this.props.choice.create[0];
            if (!createChoice) {
                return {realname: '', email: ''}
            }
            return {
                realname: createChoice.provfullname,
                email: createChoice.provemail
            }
        })();

        this.formRef.current?.setFieldsValue({realname, email})
    }

    checkForm(allFields: Array<FieldData>) {
        const isValid = (() => {
            const hearAboutField = allFields.filter(({name}) => {
                if (typeof name === 'string') {
                    return name === "hearAbout"
                } else if (Array.isArray(name)) {
                    return name[0] === 'hearAbout';
                }
                
            })[0];
            const needHearAboutOther = hearAboutField.touched && hearAboutField.errors?.length === 0 && hearAboutField.value === 'other';

            // for the "heard about other" field, only consider it if
            // the username is not empty
            const fields = allFields.filter((field) => {
                if (fieldNameEqual(field.name, 'hearAboutOther') && !needHearAboutOther) {
                    return false;
                }
                return true;
            })

            if (fields) {
                // Invalid if there all fields are touched and have no errors.
                const allValid =  fields.every(({ errors, touched }) => {
                    return !errors || errors.length === 0 && touched;
                })
                return allValid;
            }
            const fieldsError = this.formRef.current?.getFieldsError();
            if (!fieldsError) {
                return true;
            }
            return fieldsError.every(({ errors }) => {
                return errors.length === 0;
            })
        })();

        const isTouched = this.formRef.current?.isFieldsTouched();

        return { isValid, isTouched }
    }

    saveForm() {
        const rawFormData = (this.formRef.current?.getFieldsValue());

        if (typeof rawFormData !== 'object' || rawFormData === null) {
            throw new Error('The update is not an object');
        }

        const formData = rawFormData as FormData;

        const formInfo: SignUpFormInfo = {
            realname: formData.realname,
            username: formData.username,
            email: formData.email,
            organization: formData.organization,
            department: formData.organization,
            hearAbout: {
                question: HEAR_ABOUT_QUESTION,
                response: formData.hearAbout.reduce<Record<string, string>>((accum, value) => {
                    if (value === 'other') {
                        accum[value] = formData.hearAboutOther!
                    } else {
                        accum[value] = '';
                    }
                    return accum;
                }, {})
            },
            agreement: {
                id: this.policy.id,
                version: this.policy.version
            }
        }

        this.props.onSignUp(formInfo);
    }

    onFieldsChange(changedFields: FieldData[], allFields: Array<FieldData>) {
        const newState = {...this.state}

        // Sets the "hearAboutOther" state flag if the hearAbout field is set to 
        // the value "other"
        const hearAbout = changedFields.filter(({name}) => {
            if (Array.isArray(name)) {
                return name.includes('hearAbout');
            }
            return false;
        })[0];
        if (hearAbout) {
            // TODO: assert this? but what then? it is, by definition, an array of
            // strings since it comes from a checkbox group.
            const hearAboutValue = hearAbout.value as Array<string>;
            newState.hearAboutOther = hearAboutValue.includes('other')
        }

        // Sets the "canCheckUsername" state flag if the username is set to a valid
        // value.
        // Also esets the "check username availability" flag to "none" if the username was changed.
        const username = changedFields.filter(({name}) => {
            if (Array.isArray(name)) {
                return name.includes('username');
            } else if (typeof name === 'string') {
                return name === 'username';
            }
            return false;
        });


        if (username.length > 0) {
            newState.canCheckUsername = true;
            this.formRef.current?.setFieldsValue({usernameavailable: "required"})
        }

        // Get the global form validation state, and set the "isFormValid" state flag
        // appropriately.
        const {isValid} = this.checkForm(allFields);
        newState.isFormValid = isValid;

        this.setState(newState);
    }

    requiredMark(labelNode: ReactNode, {required}: {required: boolean}) {
        if (required) {
            return  <span><Asterisk className="text-danger" />{' '}{labelNode}</span>
        }
        return labelNode;
    }

    openTermsAndConditions() {
        const url = this.policy.url;
        this.setState({
            termsAndConditionsOpened: true
        });
        window.open(url, "_blank");
    }

    renderForm() {
        return <Form 
                    ref={this.formRef}
                    labelCol={{span: 8}}
                    // wrapperCol={{ span: 10}}
                    layout="horizontal"
                    disabled={!this.state.ready}
                    style={{maxWidth: 900}}
                    autoComplete="off"
                    onFieldsChange={this.onFieldsChange.bind(this)}
                    requiredMark={this.requiredMark.bind(this)}
                >
            <Form.Item 
                label="Your Name"
                name="realname"
                validateTrigger="onChange"
                hasFeedback
                rules={
                    [
                        {required: true},
                        {type: 'string', min: 2, max: 100,}
                    ]
                }
            >
                <Input placeholder="Please provide your real name"/>
            </Form.Item>

            <Form.Item 
                label="E-Mail"
                name="email"
                validateTrigger="onChange"
                hasFeedback
                rules={[
                    {required: true},
                    {type: 'email', message: 'This is not a vaild E-Mail Address'}
                ]}
            >
                <Input placeholder="Your email address"/>
            </Form.Item>

            <Form.Item 
                label="KBase Username"
                name="username"
                validateTrigger="onChange"
                hasFeedback
                rules={[
                    {required: true},
                    {type: 'string', min: 2, max: 100},
                    {
                        validator: async (_, rawValue: string) => {
                            if (/^\d+/.test(rawValue)) {
                                throw new Error('A username may not begin with a number');
                            }
                            if (/^_+/.test(rawValue)) {
                                throw new Error('A username may not start with the underscore character')
                            }
                            if (/\s/.test(rawValue)) {
                                throw new Error('A username may not contain spaces')
                            }
                        }
                    },
                ]}
            >
                <Input
                    placeholder="Create your unique KBase username"
                />
            </Form.Item>

            <Form.Item
                name="usernameavailable"
                label="Check Username Availability"
                hasFeedback
                dependencies={["username"]}
                rules={[
                    {required: true},
                    {type: 'string', enum: ["na", "required", "available", "unavailable" ]},
                    {
                        validator: async (_, value: string ) => {
                            switch (value) {
                                case "na": throw new Error('Can check when supply a valid username')
                                case "required": throw new Error('Need to check if username is available')
                                case "unavailable": throw new Error("Username not available")
                            }
                        }

                    },
                    // {
                    //     validator: async(_, value: string) => {
                    //         const username = this.formRef.current?.getFieldValue('username');
                    //         if (username.length === 0) {
                                
                    //         }
                    //     }
                    // }
                ]}
            >
                <CheckUsernameField 
                    disabled={!this.state.canCheckUsername} 
                    username={this.formRef.current?.getFieldValue('username')} 
                    checkUsername={this.props.checkUsername}
                    />
            </Form.Item>

            <Organization name="organization" label="Organization" required={true} hasFeedback={true} />

            <Form.Item 
                label="Department"
                name="department"
                validateTrigger="onChange"
                hasFeedback
                rules={[
                    {required: true},
                    {type: 'string', min: 2, max: 100}
                ]}
            >
                <Input 
                    placeholder="Your department with the organization"
                />
            </Form.Item>

            <Form.Item 
                label={HEAR_ABOUT_QUESTION}
                name="hearAbout"
                validateTrigger="onChange"
                hasFeedback
                valuePropName="checked"
                rules={[
                    {required: true}
                ]}
            >
                <Checkbox.Group name="hearAbout" style={{flexWrap: 'nowrap', display: 'flex', flexDirection: 'column'}}>
                    {referralSources.map(({value, label}) => {
                        return <div>
                            <Checkbox value={value}>{label}</Checkbox>
                        </div>
                    })}
                </Checkbox.Group>
            </Form.Item>

            <Form.Item 
                label="Other"
                name="hearAboutOther"
                validateTrigger="onChange"
                hasFeedback
                dependencies={["hearAbout"]}
                hidden={!this.state.hearAboutOther}
                rules={[
                    // {required: true},
                    ({getFieldValue}) => {
                        if (getFieldValue("hearAbout") == "other") {
                            return {
                                required: true,
                                type: 'string',
                                min: 2, 
                                max: 100
                            }
                        }
                        return {
                            required: false
                        }
                    }
                    // {type: 'string', min: 2, max: 100, }
                ]}
            >
                <Input 
                    placeholder={HEAR_ABOUT_QUESTION}
                />
            </Form.Item>

            <Form.Item 
                label="Read Terms & Conditions"
            >
                Open and review the <BSButton variant="outline-primary" onClick={this.openTermsAndConditions.bind(this)}>Terms and Conditions (v{this.policy.version}, {Intl.DateTimeFormat('en-US', {}).format(this.policy.publishedAt)})</BSButton><br />
                (After opening the link above, you can agree to the terms below)
            </Form.Item>

            <Form.Item 
                label="Terms & Conditions"
                name="termsAndConditions"
                validateTrigger="onChange"
                hasFeedback
                valuePropName="checked"
                rules={[
                    {required: true},
                    // {type: 'boolean', }
                    {
                        validator: async (_, value: boolean ) => {
                            if (!value) {
                                throw new Error('You must agree to the Terms and Conditions in order Sign Up')
                            }
                        }

                    },
                ]}
            >
                <Checkbox 
                    disabled={!this.state.termsAndConditionsOpened}
                    value={`${this.policy.id}.${this.policy.version}`} >
                    I have read and agree to the KBase Terms and Conditions
                </Checkbox>
            </Form.Item>
        </Form>
    }

    render() {
        return <div>
            {this.renderForm()}
            <Space wrap>
                <Button
                    icon={<SaveOutlined />}
                    disabled={!(this.state.isFormValid)}
                    type="primary"
                    onClick={() => {this.saveForm()}}
                >
                    Submit Sign Up Request
                </Button>
                <Button
                    icon={<CloseOutlined />}
                    danger
                    onClick={() => {
                        this.props.cancelSignUp('User canceled sign up session')}
                    }
                >
                        Cancel Sign Up
                </Button>
            </Space>
        </div>
    }
}
