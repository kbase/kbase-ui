import { NarrativeInfo } from 'apps/ORCIDLink/ORCIDLinkClient';
import RotatedTable, { RotatedTableRow } from 'components/RotatedTable';
import Well from 'components/Well';
import { Component } from 'react';
import { Stack } from 'react-bootstrap';

export interface NarrativeInfoViewerProps {
    narrative: NarrativeInfo;
}

interface NarrativeInfoViewerState {
}

export default class NarrativeInfoViewer extends Component<NarrativeInfoViewerProps, NarrativeInfoViewerState> {
    render() {
        const { objectInfo: { wsid, version, name }, workspaceInfo: { metadata } } = this.props.narrative;

        const title = metadata['narrative_nice_name'];
        const rows: Array<RotatedTableRow> = [
            ['Ref', () => {
                return <a href={`${document.location.origin}/narrative/${wsid}`} target="_blank">{wsid} (v{version})</a>
            }],
            ['Name', name],
            ['Title', title]
        ];
        return <Well style={{ padding: '1em' }}>
            <Stack gap={2}>
                <RotatedTable rows={rows} styles={{ col1: { flex: '0 0 4em' } }} />
            </Stack>
        </Well>
    }
}
