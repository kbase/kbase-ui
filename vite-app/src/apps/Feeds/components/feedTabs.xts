/**
 *
 */
define(['./notification', '../util', '../api/feeds'], function (Notification, Util, FeedsAPI) {
    'use strict';
    const SEEN_TIMEOUT = 10000;

    class FeedTabs {
        /**
         *
         * @param {Object} config
         * feeds = list of feeds in order they should appear (key and full name)
         *  - [[global, KBase], [user, Some User], [group1, My Special Group], ...]
         * element = target DOM node to render in
         *
         */
        constructor(config) {
            this.userId = config.userId;
            this.isAdmin = config.isAdmin;
            this.runtime = config.runtime;
            this.feedUpdateFn = config.feedUpdateFn;
            const feeds = config.feeds;
            this.feeds = {};
            this.order = [];
            this.element = document.createElement('div');
            this.element.classList.add('feeds-tabs-container');
            feeds.forEach((f) => {
                this.feeds[f[0]] = f[1];
                this.order.push(f[0]);
            });
            this.notes = config.globalFeed;
            this.render();
            this.setUnseenCounts(config.unseen);
            this.renderFeed();
        }

        render() {
            // Make the general structure
            // run addFeed on each element
            // select the first one and refresh it
            this.mainElem = document.createElement('div');
            this.element.appendChild(this.mainElem);
            const structure = `
                <div class="feed-tabs" data-k-b-testhook-element="tabs"></div>
                <div class="feed-content"></div>
            `;
            // xss safe
            this.element.innerHTML = structure;
            this.order.forEach((f) => this.addFeed(f, this.feeds[f]));
            this.element.querySelector('.feed-tabs div:first-child').classList.add('feed-selected');
        }

        addFeed(feedKey, feedName) {
            const tab = document.createElement('div');
            tab.classList.add('feed-tab-btn');
            // xss safe
            tab.innerHTML = `
                <span>${Util.cleanText(feedName)}</span>
                <span class="badge unseen-badge pull-right" style="display: none"><span>
            `;
            tab.setAttribute('data-name', feedKey);
            tab.onclick = () => {
                this.selectFeed(feedKey);
            };
            this.element.querySelector('.feed-tabs').appendChild(tab);
        }

        selectFeed(feedKey) {
            if (feedKey === this.getCurrentFeedId()) {
                return;
            }
            this.element.querySelectorAll('.feed-tabs div').forEach((n) => n.classList.remove('feed-selected'));
            this.element.querySelector(`.feed-tabs div[data-name="${feedKey}"]`).classList.add('feed-selected');
            const contentPane = this.element.querySelector('.feed-content');
            contentPane.innerHTML = '';
            contentPane.appendChild(Util.loadingElement('3x'));
            this.feedUpdateFn(feedKey).then((feed) => this.refresh(feed));
        }

        renderFeed() {
            const contentPane = this.element.querySelector('.feed-content'),
                curFeed = this.getCurrentFeedId(),
                toggleSeenFn = curFeed !== 'global' ? this.toggleSeen.bind(this) : null,
                expireNoteFn = null;
            if (curFeed === 'global' && this.isAdmin) {
                this.expireNote.bind(this);
            }
            contentPane.innerHTML = '';
            if (!this.notes || this.notes.length === 0) {
                // xss safe
                contentPane.innerHTML = this.emptyNotification();
            }
            this.notes.forEach((note) => {
                const noteObj = new Notification(note, this.userId, toggleSeenFn, expireNoteFn, this.runtime);
                noteObj.render().then((element) => {
                    contentPane.appendChild(element);
                });
            });
        }

        emptyNotification() {
            return `<div class="feed-note alert-info">
                <div class="feed-note-icon">
                    <span style="font-size: 1.5em">
                        <i class="fa fa-check"></i>
                    </span>
                </div>
                <div class="feed-note-body">
                    You have no notifications to view!
                </div>
            </div>`;
        }

        expireNote(note) {
            if (
                confirm(
                    'This will expire the notification for all users.\nIt will be removed from all feeds. Continue?'
                )
            ) {
                const feedsApi = new FeedsAPI(
                    this.runtime.getConfig('services.feeds.url'),
                    this.runtime.service('session').getAuthToken()
                );
                feedsApi
                    .expireGlobalNotification(note.id)
                    .then(() => {
                        return this.feedUpdateFn(this.getCurrentFeedId());
                    })
                    .then((feed) => this.refresh(feed))
                    .catch((err) => {
                        alert(
                            'Sorry, an error happened while trying to expire a notification.\nSee console for details.'
                        );
                        console.error(err);
                    });
            }
        }

        toggleSeen(note) {
            const feedsApi = new FeedsAPI(
                this.runtime.getConfig('services.feeds.url'),
                this.runtime.service('session').getAuthToken()
            );
            let prom = null;
            if (note.seen) {
                prom = feedsApi.markUnseen([note.id]);
            } else {
                prom = feedsApi.markSeen([note.id]);
            }
            prom.then((res) => {
                if (
                    (res.unseen_notes && res.unseen_notes[0] === note.id) ||
                    (res.seen_notes && res.seen_notes[0] === note.id)
                ) {
                    const noteElem = this.notes.find((n) => n.id === note.id);
                    noteElem.seen = !noteElem.seen;
                    const unseenCount = this.notes.filter((n) => !n.seen).length;
                    this.renderFeed();
                    const counts = {};
                    counts[this.getCurrentFeedId()] = unseenCount;
                    this.setUnseenCounts(counts);
                }
            });
        }

        getCurrentFeedId() {
            return this.element.querySelector('.feed-tabs div.feed-selected').getAttribute('data-name');
        }

        /**
         *
         * @param {Object} unseen
         * KVP - keys = key name of feeds, values = number of unseen
         */
        setUnseenCounts(unseen) {
            for (const feedKey in unseen) {
                const count = unseen[feedKey];
                const badge = this.element.querySelector(`.feed-tabs div[data-name=${feedKey}] span.badge`);
                if (count > 0) {
                    // xss safe
                    badge.innerHTML = unseen[feedKey];
                    badge.style.display = null;
                } else {
                    badge.style.display = 'none';
                }
            }
        }

        refresh(feed) {
            const curFeed = this.getCurrentFeedId();
            if (!feed) {
                return;
            }
            if (!feed.feed) {
                if (feed[curFeed]) {
                    feed = feed[curFeed];
                }
            }
            this.notes = feed.feed;
            this.renderFeed();
            const unseenCount = this.notes.filter((n) => !n.seen).length;
            const unseen = {};
            unseen[curFeed] = unseenCount;
            this.setUnseenCounts(unseen);
        }

        removeSeenTimeout() {
            if (this.seenTimeout) {
                clearTimeout(this.seenTimeout);
            }
        }

        initSeenTimeout() {
            this.seenTimeout = setTimeout(() => {
                const noteIds = this.notes.map((note) => note.id),
                    feedsApi = new FeedsAPI(
                        this.runtime.getConfig('services.feeds.url'),
                        this.runtime.service('session').getAuthToken()
                    );
                feedsApi
                    .markSeen(noteIds)
                    .then((seenResult) => {
                        const idNotes = {};
                        this.notes.forEach((n) => (idNotes[n.id] = n));
                        seenResult.seen_notes.forEach((id) => (idNotes[id].seen = true));
                        this.renderFeed();
                    })
                    .catch((err) => {
                        console.error(err);
                        alert('error while marking seen');
                    });
            }, SEEN_TIMEOUT);
        }
    }

    return FeedTabs;
});
