import { StringArrayField, StringField, ValidationResult } from "../../Field"

export class TitleField extends StringField {
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
                message: `Must be no longer than 50 characters (it is ${finalValue.length}`
            }
        }

        return {
            isValid: true
        }
    }
}

export class AbstractField extends StringField {
    validate(finalValue: string): ValidationResult {
        if (finalValue.length < 1) {
            return {
                isValid: false,
                message: 'Must be at least 1 character long'
            }
        }
        if (finalValue.length > 1000) {
            return {
                isValid: false,
                message: `Must be no longer than 1000 characters (it is ${finalValue.length}`
            }
        }

        return {
            isValid: true
        }
    }
}

export class ResearchOrganizationField extends StringField {
    validate(finalValue: string): ValidationResult {
        if (finalValue.length < 1) {
            return {
                isValid: false,
                message: 'Must be at least 1 character long'
            }
        }
        if (finalValue.length > 1000) {
            return {
                isValid: false,
                message: `Must be no longer than 1000 characters (it is ${finalValue.length}`
            }
        }

        return {
            isValid: true
        }
    }
}

export class KeywordField extends StringField {
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

export class KeywordsField extends StringArrayField {
    validate(values: Array<string>): ValidationResult {
        let totalLength = 0;
        const MIN_ITEM_LENGTH = 0;
        const MAX_ITEM_LENGTH = 50;
        const MAX_LENGTH = 1000;
        for (const value of values) {
            // do our per value validation here.
            if (value.length === MIN_ITEM_LENGTH) {
                return {
                    isValid: false,
                    message: `One or more values are of ${MIN_ITEM_LENGTH} length`
                }
            }

            if (value.length > 50) {
                return {
                    isValid: false,
                    message: `One or more values is greater than the maximum length of ${MAX_ITEM_LENGTH}`
                }
            }

            totalLength += (value.length + '; '.length);
        }

        if (totalLength > 1000) {
            return {
                isValid: false,
                message: `The total length of the resulting formatted data is greater than the maximum of ${MAX_LENGTH}`
            }
        }

        return {
            isValid: true
        }
    }
}
