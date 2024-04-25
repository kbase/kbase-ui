define([
    './base',
    '../api/groups'
], function (
    BaseNotification,
    GroupsAPI
) {
    'use strict';

    class GroupNotification extends BaseNotification {
        constructor(note, currentUserId, runtime) {
            super(note, currentUserId);
            this.runtime = runtime;
        }

        /**
         * Updates note info with missing information. Currently checks if the note's target is missing
         * the entity name (if it's a narrative and is missing the name, for instance), and makes a
         * call to the groups service to get it.
         *
         * If that fails, just silently moves on as a no-op.
         */
        updateNoteInfo() {
            if (this.note.verb === 'requested' && this.note.target.length === 1 &&
                this.note.target[0].type === 'workspace' && !this.note.target[0].hasOwnProperty('name')) {
                let groupsClient = new GroupsAPI(
                    this.runtime.getConfig('services.groups.url'),
                    this.runtime.service('session').getAuthToken()
                );
                return groupsClient.getResourceInfo(this.note.external_key)
                    .then((info) => {
                        this.note.target[0].name = info.narrname;
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            } else {
                return Promise.resolve();
            }
        }

        /**
         * Returns an HTML string of the rendered notification.
         * I.e. goes from the structure from the Feeds service to
         * a readable string that makes sense.
         */
        buildHtml() {
            let actor = this.entityHtml(this.note.actor),
                msg = '',
                target = this.note.target;

            return this.updateNoteInfo()
                .then(() => {
                    switch (this.note.verb) {
                        case 'requested':
                            if (target.length && target.length === 1) {
                                if (target[0].type === 'user' && target[0].id === this.note.actor.id) {
                                    msg = actor + ' has requested to join ';
                                }
                                else {
                                    msg = actor + ' has requested to add ' + this.entityHtml(target[0]) + ' to ';
                                }
                            }
                            else {
                                msg = actor + ' has requested to join ';
                            }
                            msg += this.entityHtml(this.note.object) + '.';
                            break;
                        case 'invited':
                            msg = actor + ' has invited you to join ' + this.entityHtml(this.note.object) + '.';
                            break;
                        case 'accepted':
                            if (target && target.length) {
                                msg = target.map(t => this.entityHtml(t)).join(', ');
                                if (target.length > 1) {
                                    msg += ' have ';
                                }
                                else {
                                    msg += ' has ';
                                }
                                msg += ' been added to ' + this.entityHtml(this.note.object) + '.';
                            }
                            else {
                                msg = this.actorHtml() + ' accepted the invitation from ' + this.entityHtml(this.note.object);
                            }
                            break;
                        default:
                            msg = actor + ' ' + this.note.verb + ' ' + this.entityHtml(this.note.object);
                    }
                    return msg;
                });
        }

        /**
         * Returns a link to where a user can resolve this notification, based on
         * the notification's context. If no link is necessary (this is just an
         * alert with no action required), returns null;
         */
        getLink() {
            switch (this.note.verb) {
                case 'requested':
                case 'invited':
                    return '/#orgs';
                default:
                    return '';
            }
        }
    }

    return GroupNotification;
});
