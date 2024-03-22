import { ServiceWidgetCell } from 'lib/clients/NarrativeModel';
import { Component } from 'react';
import { Accordion } from 'react-bootstrap';
import { DefaultIcon } from '../../Icon';
import cellStyles from './cell.module.css';

interface ServiceWidgetCellProps {
    cell: ServiceWidgetCell;
}

export default class ServiceWidgetCellView extends Component<ServiceWidgetCellProps> {
    // renderParams() {
    //     if (this.props.cell.metadata.kbase.outputCell.widget) {
    //         return <RenderJSON
    //             value={
    //                 this.props.cell
    //                     .metadata.kbase
    //                     .outputCell
    //                     .widget.params
    //             }
    //         />
    //     }
    //     return <Empty message="unknown" />
    // }
    render() {
        // if (!('serviceWidget' in this.props.cell.metadata.kbase)) {
        //     return (
        //         <div className="row my-2">
        //             <div className="col-auto">
        //                 <ErrorMessage message="Cell type is 'serviceWidget', but doesn't have a 'serviceWidget' property" />
        //             </div>
        //         </div>
        //     );
        // }
        // const { name } = (() => {
        //     if (this.props.cell.metadata.kbase.outputCell.widget) {
        //         return this.props.cell.metadata.kbase.outputCell.widget;
        //     } else {
        //         return {
        //             name: 'unknown',
        //         };
        //     }
        // })();
        const { title } = (() => {
            if (this.props.cell.metadata.kbase.attributes) {
                return this.props.cell.metadata.kbase.attributes;
            } else {
                return {
                    title: 'unknown',
                };
            }
        })();
        // const { tag } = (() => {
        //     if (this.props.cell.metadata.kbase.outputCell.widget) {
        //         return this.props.cell.metadata.kbase.outputCell.widget;
        //     } else {
        //         return {
        //             tag: 'unknown',
        //         };
        //     }
        // })();

        // TODO: build the cell according to the icon spec in the cell.
        //       in fact, do that for all cells!

        return (
            <div className="row my-2 g-0">
                <div className="col-md-2 d-flex flex-column align-items-center justify-content-start">
                    <div>
                        <DefaultIcon cellType="serviceWidget"/>
                    </div>
                    <div
                        style={{
                            fontSize: '80%',
                            color: 'rgb(150 150 150)',
                            fontStyle: 'italic',
                            textAlign: 'center',
                        }}
                    >
                        service widget
                    </div>
                </div>
                <div className="col" style={{ minWidth: 0 }}>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <div className={cellStyles.header}>
                                    <div className={cellStyles.title}>
                                        {title}
                                    </div>
                                    {/* <div className={cellStyles.subtitle}>
                                        {name}
                                    </div> */}
                                </div>
                            </Accordion.Header>
                            <Accordion.Body>
                                SERVICE WIDGET HERE
                                {/* <div className={styles.content}>
                                    <Table size="sm" bordered>
                                        <tbody>
                                            <tr>
                                                <th>Widget</th>
                                                <td>
                                                    <EZTooltip
                                                        id="saved-at-tooltip"
                                                        tooltip={name}
                                                    >
                                                        <span>
                                                            {name}
                                                        </span>
                                                    </EZTooltip>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Tag</th>
                                                <td>
                                                    {tag}
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Params</th>
                                                <td>
                                                    {this.renderParams()}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div> */}
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </div>
        );
    }
}
