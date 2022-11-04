import { Citation } from 'apps/ORCIDLink/Model';
import { Component } from 'react';
// import CrossRefView from './CrossRefView/Controller';

export interface CitationViewProps {
    citation: Citation;
}

interface CitationViewState {
}

export default class CitationView extends Component<CitationViewProps, CitationViewState> {
    // render() {
    //     const citation = this.props.citation
    //     if (!citation.doi) {
    //         return citation.citation;
    //     }

    //     return <Tab.Container defaultActiveKey="citation">
    //         <Row>
    //             <Col sm={3}>
    //                 <Nav variant="pills" className="flex-column">
    //                     <Nav.Item>
    //                         <Nav.Link eventKey="citation">Citation</Nav.Link>
    //                     </Nav.Item>
    //                     <Nav.Item>
    //                         <Nav.Link eventKey="crossRef">Cross Ref</Nav.Link>
    //                     </Nav.Item>
    //                 </Nav>
    //             </Col>
    //             <Col sm={0}>
    //                 <Tab.Content>
    //                     <Tab.Pane eventKey="citation" mountOnEnter={true}>
    //                         {citation.citation}
    //                     </Tab.Pane>
    //                     <Tab.Pane eventKey="crossRef" mountOnEnter={true} >
    //                         <CrossRefView doi={citation.doi} />
    //                     </Tab.Pane>
    //                 </Tab.Content>
    //             </Col>
    //         </Row>
    //     </Tab.Container>
    // }
    render() {
        const citation = this.props.citation
        // if (!citation.doi) {
        //     return citation.citation;
        // }
        return <div>
            {citation.citation}
        </div>
    }
}
