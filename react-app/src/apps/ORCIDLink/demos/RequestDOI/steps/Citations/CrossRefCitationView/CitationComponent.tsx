import RotatedTable, { RotatedTableRow } from 'components/RotatedTable';
import { Component } from 'react';
import { CrossRefCitation } from '../CrossRefClient';


export interface CitationComponentProps {
    citation: CrossRefCitation
}

export default class CitationComponent extends Component<CitationComponentProps> {


    renderPublished() {
        const published = this.props.citation.published['date-parts'];
        if (!published || published.length === 0) {
            return 'n/a';
        }
        const [year, month, day] = published[0];

        if (typeof year !== 'undefined') {
            if (typeof month !== 'undefined') {
                if (typeof day !== 'undefined') {
                    return `${year}/${month}/${day}`;
                } else {

                    return `${year}/${month}`;
                }
            } else {
                return `${year}`;
            }
        } else {
            return 'n/a';
        }
    }

    renderJournal() {
        const journal = this.props.citation['container-title'];
        if (!journal || journal.length === 0) {
            return 'n/a';
        }
        return journal.map((part, index) => {
            return <div key={index}>{part}</div>
        })
    }

    renderPage() {
        return `${this.props.citation.volume}: ${this.props.citation.page}`;
    }

    renderData() {
        const rows: Array<RotatedTableRow> = [
            // ['Published', () => { return this.renderPublished(); }],
            ['Title', this.props.citation.title.map((title, index) => { return <div key={index}>{title}</div> })],
            ['Publication', () => { return this.renderJournal() }],
            ['Page', () => { return this.renderPage(); }],
            ['Type', this.props.citation.type]
        ];
        return <RotatedTable
            styles={{
                col1: {
                    flex: '0 0 10em'
                }
            }}
            rows={rows}
            omitEmptyRows={true}
        />
    }

    render() {
        return <div>
            <h3>Component</h3>
            {this.renderData()}
        </div>
    }
}