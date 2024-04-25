define([
    './notification',
    '../util'
], (Notification,
    Utils) => {
    'use strict';
    class Feed {
        /**
             *
             * @param {object} config
             * - runtime - the runtime object
             * - refreshFn - gets invoked when the feed wants to be refreshed
             * - feedName - the feed name, shown in the header
             * - showControls - boolean, if true, shows controls.
             * - showSeen - boolean, if true, gives the option to dismiss (mark as seen) notifications
             */
        constructor(config) {
            this.runtime = config.runtime;
            this.refreshFn = config.refreshFn;
            this.userName = config.feedName || '';
            this.showControls = config.showControls || false;
            this.showSeen = (config.showSeen === undefined || config.showSeen === null) ? true : config.showSeen;

            this.element = document.createElement('div');
            this.element.classList.add('panel', 'panel-default');
            // xss safe
            this.element.innerHTML = `
                <div class="panel-heading">
                    <span class="panel-title">
                        <span id="user-feed-name">${Utils.cleanText(this.userName)}</span> notifications
                    </span>
                    ${this.showControls ? this.renderFilters() : ''}
                </div>
                <div class="panel-body"></div>
            `;
            this.ctrlState = {
                includeSeen: false,
                reverseSort: false,
                level: null,
                verb: null,
                source: null
            };
            if (this.showControls) {
                this.bindEvents();
            }
        }

        bindEvents() {
            const ctrls = this.element.querySelector('.panel-heading div#feed-inputs');
            // toggle eye
            ctrls.querySelector('#seen-btn').onclick = () => {
                const btnIcon = ctrls.querySelector('#seen-btn .fa');
                if (btnIcon.classList.contains('fa-eye-slash')) {
                    btnIcon.classList.replace('fa-eye-slash', 'fa-eye');
                    this.ctrlState.includeSeen = true;
                }
                else {
                    btnIcon.classList.replace('fa-eye', 'fa-eye-slash');
                    this.ctrlState.includeSeen = false;
                }
                this.refresh();
            };

            // toggle order
            ctrls.querySelector('#sort-btn').onclick = () => {
                const btnIcon = ctrls.querySelector('#sort-btn .fa');
                if (btnIcon.classList.contains('fa-sort-numeric-desc')) {
                    btnIcon.classList.replace('fa-sort-numeric-desc', 'fa-sort-numeric-asc');
                    this.ctrlState.reverseSort = false;
                }
                else {
                    btnIcon.classList.replace('fa-sort-numeric-asc', 'fa-sort-numeric-desc');
                    this.ctrlState.reverseSort = true;
                }
                this.refresh();
            };

            // level filter
            ctrls.querySelector('#level-filter').onchange = (e) => {
                if (e.target.selectedIndex === 0) {
                    this.ctrlState.level = null;
                }
                else {
                    this.ctrlState.level = e.target.value;
                }
                this.refresh();
            };

            // source filter
            ctrls.querySelector('#source-filter').onchange = (e) => {
                if (e.target.selectedIndex === 0) {
                    this.ctrlState.source = null;
                }
                else {
                    this.ctrlState.source = e.target.value;
                }
                this.refresh();
            };
        }

        refresh() {
            // get filter info from controls
            // run the refresh function
            // update this feed with the results
            this.refreshFn(this.ctrlState);
        }

        renderFilters() {
            const levels = ['alert', 'warning', 'error', 'request'], services = ['groups', 'workspace', 'jobs', 'narrative'], filterHtml = `
                    <div id="feed-inputs" class="form-inline pull-right" style="margin-top: -6px">
                        <button class="btn btn-md btn-default" type="button" id="seen-btn">
                            <i class="fa fa-eye-slash"></i>
                        </button>
                        <button class="btn btn-md btn-default" type="button" id="sort-btn">
                            <i class="fa fa-sort-numeric-asc"></i>
                        </button>
                        <select class="form-control" id="level-filter">
                            <option selected>Filter Level</option>
                            ${levels.map(level => `<option value="${level}">${level}</option>`)}
                        </select>
                        <select class="form-control" id="source-filter">
                            <option selected>Filter Source</option>
                            ${services.map(service => `<option value="${service}">${service}</option>`)}
                        </select>
                    </div>
                `;

            return filterHtml;
        }

        remove() {
            this.element.querySelector('.panel-body').innerHTML = '';
        }

        updateFeed(feed, token) {
            this.remove();
            const userFeed = this.element.querySelector('.panel-body');
            feed.feed.forEach(note => {
                const noteObj = new Notification(note, {
                    runtime: this.runtime,
                    token: token,
                    refreshFn: this.refresh.bind(this),
                    showSeen: this.showSeen
                });
                userFeed.appendChild(noteObj.element);
            });
        }

        setUserName(userName) {
            this.userName = userName;
            // xss safe
            this.element.querySelector('#user-feed-name').innerHTML = Utils.cleanText(userName);
        }
    }
    return Feed;
});
