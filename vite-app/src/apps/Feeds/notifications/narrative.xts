define([
    './base'
], function (
    BaseNotification
) {
    'use strict';

    class NarrativeNotification extends BaseNotification {
        constructor(note, currentUserId) {
            super(note, currentUserId);
        }

        /**
         * Returns an HTML string of the rendered notification.
         * I.e. goes from the structure from the Feeds service to
         * a readable string that makes sense.
         */
        buildHtml() {
            let actor = this.entityHtml(this.note.actor),
                msg = '';

            return new Promise((resolve) => {
                switch(this.note.verb) {
                case 'requested':
                    msg = actor + ' has requested ' + this.permissionLevel() + 'access to ';
                    msg += this.entityHtml(this.note.object) + '.';
                    break;
                default:
                    msg = actor + ' ' + this.note.verb + ' ' + this.entityHtml(this.note.object);
                }
                resolve(msg);
            });
        }

        permissionLevel() {
            const perms = {
                r: 'view only',
                w: 'edit and save',
                a: 'edit, save, and share'
            };
            let level = '';
            if (this.note.context && this.note.context.level) {
                level = this.note.context.level;
                if (level in perms) {
                    level = perms[level];
                }
            }
            return level + ' ';
        }

        /**
         * Returns a link to where a user can resolve this notification, based on
         * the notification's context. If no link is necessary (this is just an
         * alert with no action required), returns null;
         */
        getLink() {
            switch(this.note.verb) {
            case 'requested':
            case 'invited':
                return '/narrative/' + this.note.object.id;
            default:
                return '';
            }
        }
    }

    return NarrativeNotification;
});
