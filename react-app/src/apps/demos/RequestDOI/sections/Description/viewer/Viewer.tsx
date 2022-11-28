import { Description } from "apps/ORCIDLink/ORCIDLinkClient";
import Empty from "components/Empty";
import RotatedTable, { RotatedTableRow } from "components/RotatedTable";
import Well from "components/Well";
import { Component } from "react";
import { Accordion, Col, Container, Row } from "react-bootstrap";
import styles from './Viewer.module.css';

export interface DescriptionViewProps {
    description: Description;
}

export default class DescriptionView extends Component<DescriptionViewProps> {
    constructor(props: DescriptionViewProps) {
        super(props);
        this.state = {
            keyword: ''
        }
    }
    renderKeywords() {
        if (this.props.description.keywords.length === 0) {
            return <Empty message="No keywords" />
        }
        const rows = this.props.description.keywords.map((keyword, index) => {
            return <Row key={index} className={`${styles.bordered} g-0`} >
                <Col>
                    {keyword}
                </Col>
            </Row >
        });
        return <Well style={{ padding: '0.5em' }}>
            <Container fluid >
                {rows}
            </Container>
        </Well>;
    }

    renderKeywords2() {
        if (this.props.description.keywords.length === 0) {
            return <Empty message="No keywords" size="inline" />
        }
        const keywords = this.props.description.keywords.map((value, index) => {
            return <div
                key={index}
                style={{
                    flex: '0 0 auto',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: '0.5em',
                    margin: '0',
                    marginRight: '0.125em',
                    marginBottom: '0.125em',
                    borderRadius: '0.5em',
                    // backgroundColor: 'rgb(225, 225, 225)',
                    border: '1px solid rgb(200, 200, 200)'
                }}>
                {value}
            </div>
        });

        return <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', flex: '0 0 auto' }}>
            {keywords}
        </div>
    }
    render() {
        const { title, researchOrganization, abstract, keywords } = this.props.description;
        const rows: Array<RotatedTableRow> = [
            ['Title', title],
            ['Research Organization', researchOrganization],
            ['Abstract', abstract],
            ['Keywords', this.renderKeywords2()],
        ];
        return <Accordion>
            <Accordion.Item eventKey="0">
                <Accordion.Header>
                    {this.props.description.title}
                </Accordion.Header>
                <Accordion.Body>
                    <RotatedTable rows={rows} styles={{ col1: { flex: '0 0 12em' } }} />
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    }
}
