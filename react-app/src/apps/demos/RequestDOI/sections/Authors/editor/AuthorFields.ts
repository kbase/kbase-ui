import { StringField, ValidationResult } from "../../Field"


export class FirstNameField extends StringField {
    validate(finalValue: string): ValidationResult {
        if (finalValue.length < 1) {
            return {
                isValid: false,
                message: 'Must be at least 1 character long'
            }
        }
        if (finalValue.length > 50) {
            return {
                isValid: false,
                message: 'Must be no more than 50 characters long'
            }
        }

        return {
            isValid: true
        }
    }
}

export class MiddleNameField extends StringField {
    validate(finalValue: string): ValidationResult {
        if (finalValue.length < 1) {
            return {
                isValid: false,
                message: 'Must be at least 1 character long'
            }
        }
        if (finalValue.length > 50) {
            return {
                isValid: false,
                message: 'Must be no more than 50 characters long'
            }
        }

        return {
            isValid: true
        }
    }
}

export class LastNameField extends StringField {
    validate(finalValue: string): ValidationResult {
        if (finalValue.length < 1) {
            return {
                isValid: false,
                message: 'Must be at least 1 character long'
            }
        }
        if (finalValue.length > 50) {
            return {
                isValid: false,
                message: 'Must be no more than 50 characters long'
            }
        }

        return {
            isValid: true
        }
    }
}
export class EmailAddressField extends StringField {
    validate(finalValue: string): ValidationResult {
        if (finalValue.length < 1) {
            return {
                isValid: false,
                message: 'Must be at least 1 character long'
            }
        }
        if (finalValue.length > 50) {
            return {
                isValid: false,
                message: 'Must be no more than 50 characters long'
            }
        }

        if (!finalValue.match(/^[\S]+?@[\S]+[.][\S]+$/)) {
            return {
                isValid: false,
                message: 'Not a valid E-Mail address of the form user@example.com'
            };
        }

        return {
            isValid: true
        }
    }
}

export class ORCIDIdField extends StringField {
    validate(finalValue: string): ValidationResult {
        if (finalValue.length < 1) {
            return {
                isValid: false,
                message: 'Must be at least 1 character long'
            }
        }
        if (finalValue.length > 50) {
            return {
                isValid: false,
                message: 'Must be no more than 50 characters long'
            }
        }

        return {
            isValid: true
        }
    }
}

export class ContributorTypeField extends StringField {
    validate(finalValue: string): ValidationResult {
        if (finalValue.length < 1) {
            return {
                isValid: false,
                message: 'Must be at least 1 character long'
            }
        }
        if (finalValue.length > 50) {
            return {
                isValid: false,
                message: 'Must be no more than 50 characters long'
            }
        }

        return {
            isValid: true
        }
    }
}

export class InstitutionField extends StringField {
    validate(finalValue: string): ValidationResult {
        if (finalValue.length < 1) {
            return {
                isValid: false,
                message: 'Must be at least 1 character long'
            }
        }
        if (finalValue.length > 50) {
            return {
                isValid: false,
                message: 'Must be no more than 50 characters long'
            }
        }

        return {
            isValid: true
        }
    }
}