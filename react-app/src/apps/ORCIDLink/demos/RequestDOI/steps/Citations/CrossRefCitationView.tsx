import RotatedTable, { RotatedTableRow } from 'components/RotatedTable';
import { Component } from 'react';
import { CrossRefCitation } from './CrossRefClient';


export interface CrossRefCitationViewProps {
    citation: CrossRefCitation
}

export default class CrossRefCitationView extends Component<CrossRefCitationViewProps> {
    // renderTitle(): JSX.Element {
    //     const this.props.citation.title.map((title) => {
    //         return <p>{title}</p>
    //     });
    // }
    // renderAffiliation(affiliation: CrossRefAffiliation) {
    //     return <span>
    //         {affiliation.}
    //     </span>
    // }
    renderAuthor(): JSX.Element {
        const authorsContent = this.props.citation.author.map((author, index) => {
            return <tr key={index}>
                <td>{author.family}</td>
                <td>{author.given}</td>
                <td><a href={author.ORCID} target="_blank">{author.ORCID}</a></td>
            </tr>
        });
        return <table>
            <tbody>
                {authorsContent}
            </tbody>
        </table>;
    }

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
        switch (this.props.citation.type) {
            case 'journal-article':
                return `${this.props.citation.volume}: ${this.props.citation.page}`;
            case 'report':
                return null;
            default:
                return this.props.citation.page
        }
    }

    render() {
        console.log('citation??', this.props.citation);
        const rows: Array<RotatedTableRow> = [
            ['Author', () => { return this.renderAuthor(); }],
            ['Published', () => { return this.renderPublished(); }],
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
}