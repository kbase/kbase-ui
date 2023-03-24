import { StringField, ValidationResult } from "formSupport/Field";

export class ShortDescriptionField extends StringField {
    validate(value: string): ValidationResult {
        if (value.length < 5) {
            return {
                isValid: false,
                message: 'shortDescrption must be longer than 5 characters'
            }
        }
        if (value.length > 250) {
            return {
                isValid: false,
                message: 'shortDescription must be less than 250 characters'
            }
        }
        return {
            isValid: true
        }
    }
}