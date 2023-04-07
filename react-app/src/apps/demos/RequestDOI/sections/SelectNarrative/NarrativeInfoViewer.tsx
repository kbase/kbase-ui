import RotatedTable, { RotatedTableRow } from 'components/RotatedTable';
import { Component } from 'react';
import { Button } from 'react-bootstrap';
import { StaticNarrativeSummary } from '../../Model';

export interface NarrativeInfoViewerProps {
    narrative: StaticNarrativeSummary;
}

interface NarrativeInfoViewerState {
}

export default class NarrativeInfoViewer extends Component<NarrativeInfoViewerProps, NarrativeInfoViewerState> {
    render() {
        const { workspaceId, version, title, owner, staticNarrativeSavedAt } = this.props.narrative;
        const rows: Array<RotatedTableRow> = [
            ['Narrative', () => {
                return <div>
                    {workspaceId} (v{version})
                    {' '}
                    <Button variant="outline-info" size="sm" href={`${document.location.origin}/narrative/${workspaceId}`} target="_blank">Open Narrative</Button>
                    {' '}
                    <Button variant="outline-info" size="sm" href={`${document.location.origin}/sn/${workspaceId}`} target="_blank">Open Static Narrative</Button>
                </div>
            }],

            ['Title', title],
            ['Published', Intl.DateTimeFormat('en-US', {}).format(staticNarrativeSavedAt)],
            ['Owner', owner]
        ];
        return <RotatedTable rows={rows} styles={{ col1: { flex: '0 0 8em' } }} />;
    }
}
