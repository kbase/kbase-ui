import { StringField, ValidationResult } from "../form/Field";


export class CitationField extends StringField {
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