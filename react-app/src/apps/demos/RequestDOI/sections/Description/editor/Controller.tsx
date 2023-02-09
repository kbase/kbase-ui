import { Component } from "react";
import { Description } from "../../../DOIRequestClient";
import { Model } from "../../../Model";
import { AbstractField, KeywordField, KeywordsField, ResearchOrganizationField, TitleField } from "./Fields";
import DescriptionForm from './Form';

export interface DescriptionControllerProps {
    model: Model;
    narrativeTitle: string;
    description?: Description;
    setTitle: (title: string) => void;
    onDone: (description: Description) => void;
}

export interface EditableDescription {
    title: TitleField;
    abstract: AbstractField;
    researchOrganization: ResearchOrganizationField;
    keyword: KeywordField;
    keywords: KeywordsField;
}

interface DescriptionControllerState {
    description: EditableDescription;
    trigger: number;
    canComplete: boolean;
}

export default class DescriptionController extends Component<DescriptionControllerProps, DescriptionControllerState> {
    constructor(props: DescriptionControllerProps) {
        super(props);

        const title = (() => {
            if (typeof this.props.description !== 'undefined') {
                return this.props.description.title;
            }
            return this.props.narrativeTitle
        })();
        const abstract = (() => {
            if (typeof this.props.description !== 'undefined') {
                return this.props.description.abstract;
            }
            return '';
        })();
        const researchOrganization = (() => {
            if (typeof this.props.description !== 'undefined') {
                return this.props.description.researchOrganization;
            }
            return '';
        })();
        const keywords = (() => {
            if (typeof this.props.description !== 'undefined') {
                return this.props.description.keywords;
            }
            return [];
        })();
        const description: EditableDescription = {
            title: new TitleField(true).set(title),
            keyword: new KeywordField(true).set(''),
            keywords: new KeywordsField(false).set(keywords),
            abstract: new AbstractField(true).set(abstract),
            researchOrganization: new ResearchOrganizationField(true).set(researchOrganization)
        }
        this.state = {
            description,
            trigger: 0,
            canComplete: this.isFormValid(description)
        }
    }
    componentDidMount() {
        this.props.setTitle('DOI Request Form - 2. Description');
    }
    addKeyword(keyword: string) {
        const keywords = this.state.description.keywords.add(keyword);
        this.setState({
            description: {
                ...this.state.description,
                keywords
            }
        })
    }

    removeKeyword(position: number) {
        const keywords = this.state.description.keywords.remove(position);
        this.setState({
            description: {
                ...this.state.description,
                keywords
            }
        })
    }

    isFormValid(description: EditableDescription) {
        const { title, researchOrganization, abstract, keywords } = description;
        return (
            title.isValid() &&
            researchOrganization.isValid() &&
            abstract.isValid() &&
            keywords.isValid()
        );
    }

    evaluate() {
        this.setState({
            canComplete: this.isFormValid(this.state.description)
        })
    }

    async onEditTitle(value: string) {
        this.state.description.title.set(value);
        this.setState({
            trigger: Date.now()
        }, () => {
            this.evaluate()
        });
    }

    async onEditResearchOrganization(value: string) {
        this.state.description.researchOrganization.set(value);
        this.setState({
            trigger: Date.now()
        }, () => {
            this.evaluate()
        });
    }

    async onEditAbstract(value: string) {
        this.state.description.abstract.set(value);
        this.setState({
            trigger: Date.now()
        }, () => {
            this.evaluate()
        });
    }

    async onAddKeywords(value: Array<string>) {
        this.state.description.keywords.add(value);
        this.setState({
            trigger: Date.now()
        }, () => {
            this.evaluate()
        });
    }

    async onRemoveKeyword(index: number) {
        this.state.description.keywords.remove(index);
        this.setState({
            trigger: Date.now()
        }, () => {
            this.evaluate()
        });
    }

    editableDescriptionToDescription(description: EditableDescription) {
        const { title, researchOrganization, abstract, keywords } = description;
        if (!(
            title.isValid() &&
            researchOrganization.isValid() &&
            abstract.isValid() &&
            keywords.isValid()
        )) {
            throw new Error('Editable description is not fully valid');
        }

        return {
            title: title.getFinalValue(),
            researchOrganization: researchOrganization.getFinalValue(),
            abstract: abstract.getFinalValue(),
            keywords: keywords.getFinalValue()
        }
    }


    onDone() {
        if (!this.isFormValid(this.state.description)) {
            return;
        }
        return this.props.onDone(this.editableDescriptionToDescription(this.state.description));
    }

    render() {
        return <DescriptionForm
            description={this.state.description}
            onEditTitle={this.onEditTitle.bind(this)}
            onEditReaserchOrganization={this.onEditResearchOrganization.bind(this)}
            onEditAbstract={this.onEditAbstract.bind(this)}
            // onEditKeywords={this.onEditKeywords.bind(this)}
            onAddKeywords={this.onAddKeywords.bind(this)}
            onRemoveKeyword={this.onRemoveKeyword.bind(this)}
            // setAbstract={this.setAbstract.bind(this)}
            // setTitle={this.setTitle.bind(this)}
            // setResearchOrganization={this.setResearchOrganization.bind(this)}
            canComplete={this.state.canComplete}
            onDone={this.onDone.bind(this)} />
    }
}
