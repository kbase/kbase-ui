import React from 'react';
import { niceRelativeTime } from '../../../../lib/time';
import { NarrativeSearchDoc } from '../../utils/NarrativeModel';
import './Narrative.css';

export interface NarrativeProps {
    narrative: NarrativeSearchDoc;
    isSelected: boolean;
    height: number;
    onSelect: () => void;
}

interface NarrativeState {}

export default class Narrative extends React.Component<
    NarrativeProps,
    NarrativeState
> {
    render() {
        const {
            access_group,
            obj_id,
            version,
            narrative_title,
            timestamp,
            creator,
        } = this.props.narrative;
        const title = (() => {
            if (narrative_title.trim().length === 0) {
                return '** EMPTY TITLE **';
            }
            return narrative_title;
        })();
        // I need this until I figure out what's in item
        const upa = `${access_group}/${obj_id}/${version}`;

        // Action to select an item to view details
        const classList = ['Narrative'];
        if (this.props.isSelected) {
            classList.push('-selected');
        }
        return (
            <div
                className={classList.join(' ')}
                style={{ height: `${this.props.height}px` }}
                key={upa}
                onClick={() => this.props.onSelect()}
            >
                <div className="-title" title={title}>
                    {title}
                </div>
                <div className="-subtitle">
                    Updated {niceRelativeTime(new Date(timestamp))} by {creator}
                </div>
            </div>
        );
    }
}
