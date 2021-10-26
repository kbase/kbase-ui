import { Component, createRef, RefObject } from 'react';
import * as uuid from 'uuid';

export interface AutoPostFormProps {
    params: { [key: string]: string };
    action: string;
}

interface AutoPostFormState {}

export default class AutoPostForm extends Component<
    AutoPostFormProps,
    AutoPostFormState
> {
    ref: RefObject<HTMLFormElement>;
    constructor(props: AutoPostFormProps) {
        super(props);
        this.ref = createRef();
    }
    componentDidMount() {
        // Should never occur, throw error?
        if (this.ref.current === null) {
            return;
        }
        this.ref.current.submit();
    }
    render() {
        const { params, action } = this.props;
        const id = uuid.v4();
        const formID = `html_${id}`;

        const paramInputs = Array.from(Object.entries(params)).map(
            ([name, value]) => {
                return (
                    <input type="hidden" key={name} name={name} value={value} />
                );
            }
        );

        return (
            <form
                method="post"
                ref={this.ref}
                id={formID}
                action={action}
                style={{ display: 'hidden' }}
            >
                {paramInputs}
            </form>
        );
    }
}
