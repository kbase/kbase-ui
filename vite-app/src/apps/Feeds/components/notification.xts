define([
    'jquery',
    'kb_common/html',
    '../util',
    '../notifications/base',
    '../notifications/groups',
    '../notifications/narrative'
], ($,
    HTML,
    Util,
    DefaultNotification,
    GroupsNotification,
    NarrativeNotification) => {
    'use strict';
    const t = HTML.tag, div = t('div'), span = t('span'), small = t('small'), i = t('i'), a = t('a');

    const GROUPS = 'groupsservice';
    const NARRATIVE = 'narrativeservice';

    class Notification {
        /**
             * @param {object} note
             * has keys: actor, context, created, expires, id, level, object, source, verb
             * @param {string} userId - The current user id
             * @param {function} toggleSeenFn - the function to call when toggling a note seen/unseen
             * @param {function} expireNoteFn - the function to call when expiring a notification
             * @param {string} runtime - the current Runtime state object
             */
        constructor(note, userId, toggleSeenFn, expireNoteFn, runtime) {
            this.note = note;
            this.userId = userId;
            this.runtime = runtime;
            this.noteObj = this.makeNoteObj();
            this.toggleSeenFn = toggleSeenFn;
            this.expireNoteFn = expireNoteFn;
            this.element = null;
        }

        makeNoteObj() {
            switch (this.note.source) {
            case GROUPS:
                return new GroupsNotification(this.note, this.userId, this.runtime);
            case NARRATIVE:
                return new NarrativeNotification(this.note, this.userId);
            default:
                return new DefaultNotification(this.note, this.userId);
            }
        }

        render() {
            if (this.element !== null) {
                return new Promise((resolve) => resolve(this.element));
            }
            else {
                return this.renderBody()
                    .then((bodyHtml) => {
                        this.element = document.createElement('div');
                        this.element.classList.add('feed-note');
                        if (this.note.seen) {
                            this.element.classList.add('seen');
                        }
                        const level = div({ class: 'feed-note-icon' }, [this.renderLevel()]), body = div({ class: 'feed-note-body' }, [bodyHtml]), link = div({ class: 'feed-link' }, [this.renderLink()]), control = div({ class: 'feed-note-control' }, this.renderControl());
                        // xss safe (traced all usages)
                        this.element.innerHTML = level + control + link + body;
                        this.bindEvents();
                        return this.element;
                    });
            }
        }

        renderBody() {
            return this.renderMessage()
                .then((message) => {
                    const text = div(message), infoStamp = this.renderCreated();
                    return text + infoStamp;
                });
        }

        /**
             * Renders controls for dismissing/marking a notification seen.
             */
        renderControl() {
            let seenBtn = '';
            const icon = this.note.seen ? 'eye-slash' : 'eye';
            const text = this.note.seen ? 'unseen' : 'seen';
            if (this.toggleSeenFn) {
                seenBtn = span(
                    {
                        class: 'feed-seen'
                    },
                    i({
                        class: 'fa fa-' + icon,
                        dataToggle: 'tooltip',
                        dataPlacement: 'left',
                        title: 'Mark ' + text,
                        style: 'cursor: pointer'
                    })
                );
            }

            let expBtn = '';
            if (this.expireNoteFn) {
                expBtn = span(
                    {
                        class: 'feed-expire'
                    },
                    i({
                        class: 'fa fa-times',
                        dataToggle: 'tooltip',
                        dataPlacement: 'left',
                        title: 'Expire this notification',
                        style: 'cursor: pointer'
                    })
                );
            }
            return [seenBtn, expBtn];
        }

        renderLink() {
            const url = this.noteObj.getLink();
            if (url) {
                return a({
                    href: url,
                    target: '_blank'
                }, i({
                    class: 'fa fa-external-link'
                }));
            }
            return '';
        }

        renderLevel() {
            let icon = 'fa fa-info';
            switch (this.note.level) {
            case 'error':
                icon = 'fa fa-ban';
                this.element.classList.add('alert-danger');
                break;
            case 'request':
                icon = 'fa fa-question-circle';
                this.element.classList.add('alert-success');
                break;
            case 'warning':
                icon = 'fa fa-exclamation-triangle';
                this.element.classList.add('alert-warning');
                break;
            case 'alert':
            default:
                icon = 'fa fa-info';
                this.element.classList.add('alert-info');
            }
            return `<span style="font-size: 1.5em;"><i class="${icon}"></i></span>`;
        }

        renderSeen() {
            let icon = 'fa fa-times';
            if (this.note.seen) {
                icon = 'fa fa-eye';
            }
            return `
                <span style="font-size: 1.5em; cursor: pointer;" id="seen-icon">
                    <i class="${icon}"></i>
                </span>
            `;
        }

        renderCreated() {
            const date = new Date(this.note.created), timeAgo = Util.dateToAgo(date), tooltip = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            return small({
                class: 'feed-timestamp',
                dataToggle: 'tooltip',
                dataPlacement: 'right',
                title: tooltip
            }, [timeAgo]);
        }

        renderSource() {
            return this.note.source;
        }

        renderMessage() {
            if (this.note.context && this.note.context.text) {
                return new Promise((resolve) => resolve(Util.cleanText(this.note.context.text)));
            }
            else {
                return this.noteObj.buildHtml();
            }
        }

        bindEvents() {
            $(this.element).find('[data-toggle="tooltip"]').tooltip();
            const seenBtn = this.element.querySelector('.feed-note-control span.feed-seen');
            if (seenBtn) {
                seenBtn.onclick = () => this.toggleSeenFn(this.note);
            }
            const expireBtn = this.element.querySelector('.feed-note-control span.feed-expire');
            if (expireBtn) {
                expireBtn.onclick = () => this.expireNoteFn(this.note);
            }
        }
    }
    return Notification;
});
