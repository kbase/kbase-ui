/*global define: true */
/*jslint browser:true  vars: true */
define(['jquery', 'nunjucks', 'kb.session', 'kb.config'],
   function ($, nunjucks, Session, Config) {
      "use strict";
      var Navbar = Object.create({}, {
        version: {
            value: '0.0.2',
            writable: false
        },
         init: {
            value: function (cfg) {
                if (typeof cfg.container === 'string') {
                    this.container = $(cfg.container);
                } else {
                    this.container = cfg.container;
                }

                // Looks like a widget ... acts like a widget ...
                this.widgetTitle = 'Navbar Widget';
                this.widgetName = 'Navbar';

                this.templates = {};
                this.templates.env = new nunjucks.Environment(new nunjucks.WebLoader('/src/widgets/' + this.widgetName + '/templates'), {
                    'autoescape': false
                });
                this.templates.env.addFilter('kbmarkup', function (s) {
                    if (s) {
                        s = s.replace(/\n/g, '<br>');
                    }
                    return s;
                });
                // This is the cache of templates.
                this.templates.cache = {};

                // The context object is what is given to templates.
                this.context = {};
                this.context.env = {
                    widgetTitle: this.widgetTitle,
                    widgetName: this.widgetName
                };


                // Don't load css dynamically for now. There are parts of the functional
                // site which don't know about this widget yet. And perhaps it will be
                // best practice to load the css for core ui components statically so that
                // the layout doesn't jump around as components load.
                // this.loadCSS();
                return this;
            }
        },
        getVersion: {
            value: function () {
                return this.version;
            }
        },
        loadCSS: {
            value: function () {
                $('<link>').appendTo('head')
                    .attr({
                        type: 'text/css',
                        rel: 'stylesheet'
                    })
                    .attr('href', '/src/widgets/' + this.widgetName + '/style.css');
                return this;
            }
        },
        setTitle: {
            value: function (title) {
                // okay, we are punning on a class set on this element.
                this.container.find('.navbar-title').html(title);
                return this;
            }
        },
        clear: {
            value: function () {
                this.clearMenu();
                this.clearTitle();
                this.clearButtons();
                return this;
            }
        },
        clearTitle: {
            value: function () {
                this.container.find('.navbar-title').empty();
                return this;
            }
        },
        clearButtons: {
            value: function () {
                this.container.find('.navbar-buttons').empty();
                return this;
            }
        },
        addButton: {
            value: function (cfg) {
                var iconStyle = '';
                var label = '';
                if (cfg.label) {
                    label = '<div class="kb-nav-btn-txt">' + cfg.label + '</div>';
                } else {
                    iconStyle += 'font-size: 150%;';
                }
                //if (cfg.color) {
                //   iconStyle += 'color: ' + cfg.color + ';';
                //}

               var button;
               if (cfg.url) {
                  // a link style button
                  if (cfg.external) {
                     cfg.target = '_blank';
                  }
                  var target;
                  if (cfg.target) {
                     target = 'target="' + cfg.target + '"';
                  } else {
                     target = '';
                  }
                  button = $('<a data-button="' + cfg.name + '" id="kb-' + cfg.name + '-btn" class="btn btn-' + (cfg.style || 'default') + ' navbar-btn kb-nav-btn" role="button" href="' + cfg.url + '" ' + target + '>' +
                     '  <div class="fa fa-' + cfg.icon + '" style="' + iconStyle + '"></div>' + label + '</a>');

               } else {
                  button = $('<button data-button="' + cfg.name + '" id="kb-' + cfg.name + '-btn" class="btn btn-' + (cfg.style || 'default') + ' navbar-btn kb-nav-btn">' +
                        '  <div class="fa fa-' + cfg.icon + '" style="' + iconStyle + '"></div>' + label + '</button>')
                     .on('click', function (e) {
                        e.preventDefault();
                        cfg.callback();
                     });
               }
               if (cfg.disabled) {
                  button.prop('disabled', true);
               }
               if (cfg.place === 'end') {
                  this.container.find('.navbar-buttons').append(button);
               } else {
                  this.container.find('.navbar-buttons').prepend(button);
               }
               return this;
            }
        },
        findButton: {
            value: function (name) {
                return this.container.find('.navbar-buttons [data-button="' + name + '"]');
            }
        },
        addDropdown: {
            value: function (cfg) {
               // var button = $('<button type="button" class="btn btn-' + cfg.style + ' dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' + cfg.label + ' <span class="caret"></span></button>');
               var iconStyle = '';
               var label = '';
               if (cfg.label) {
                  label = '<div class="kb-nav-btn-txt">' + cfg.label + ' <span class="caret"></span></div>';
               } else {
                  label = cfg.label + ' <span class="caret"></span>';
                  iconStyle += 'font-size: 150%;';
               }
               var button = $('<button  class="btn btn-' + (cfg.style || 'default') + ' navbar-btn kb-nav-btn dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                     '  <div class="fa fa-' + cfg.icon + '" style="' + iconStyle + '"></div>' + label + '</button>');
               if (cfg.disabled) {
                  button.prop('disabled', true);
               }

               var menu = $('<ul class="dropdown-menu" role="menu"></ul>');
               if (cfg.items) {
                  for (var i = 0; i < cfg.items.length; i++) {
                     var item = cfg.items[i];
                     if (item.type === 'divider') {
                        menu.append('<li class="divider"></li>');
                     } else {
                        var menuItem = $('<li></li>');

                        if (item.url) {
                           var link = $('<a></a>')
                              .attr('href', item.url)
                              .attr('data-menu-item', item.name);
                        } else if (item.callback) {
                           var link = $('<a></a>')
                              .attr('href', '#')
                              .attr('data-menu-item', item.name)
                              .on('click', item.callback);
                        }
                        if (item.external) {
                           link.attr('target', '_blank');
                        }

                        var icon = $('<div class="navbar-icon" style=""></div>');
                        if (item.icon) {
                           icon.append($('<span class="fa fa-' + item.icon + '"  class="navbar-icon"></span>'));
                        }

                        menu.append(menuItem.append(link.append(icon).append(item.label)));
                     }
                  }
               }
               var dropdown = $('<div class="dropdown" style="display: inline-block;"></div>').append(button).append(menu);
               if (cfg.place === 'end') {
                  this.container.find('.navbar-buttons').append(dropdown);
               } else {
                  this.container.find('.navbar-buttons').prepend(dropdown);
               }
               if (cfg.widget) {
            	   var widgetName = cfg.widget;
            	   var panel = $('<div>');
            	   menu.append($('<li></li>').append(panel));
            	   var widget = panel[widgetName]({dropdown: dropdown, navbar: this, params: cfg.params});
               }
               return this;
            }
        },
        /* TODO: This should not be here, rather in some top level module, like the app */
        addDefaultMenu: {
            value: function (cfg) {
               cfg = cfg || {};
               var hasRegularMenuItems = false;
               if (cfg.search !== false) {
                  this.addMenuItem({
                     name: 'search',
                     icon: 'search',
                     label: 'Search Data',
                     url: '/search/#/search/?q=*',
                     place: 'end'
                  });
                  hasRegularMenuItems = true;
               }
               if (cfg.narrative !== false) {
                  this.addMenuItem({
                     name: 'narrative',
                     label: 'Narrative',
                     icon: 'file',
                     url: '/#narrativemanager/start',
                     external: true,
                     place: 'end'
                  });
                  hasRegularMenuItems = true;

               }
               if (cfg.dashboard !== false) {
                  this.addMenuItem({
                     name: 'dashboard',
                     label: 'Dashboard',
                     icon: 'dashboard',
                     url: '/#dashboard',
                     place: 'end'
                  });
                  hasRegularMenuItems = true;

               }
               if (hasRegularMenuItems) {
                  this.addMenuItem({
                     type: 'divider',
                     name: 'help',
                     place: 'end'
                  });
               }

                this.addHelpMenuItem({
                    name: 'contactus',
                    label: 'Contact Us',
                    icon: 'envelope-o',
                    url: Config.getConfig('docsite.baseUrl') + Config.getConfig('docsite.paths.contact'),
                    place: 'end'
                });
                this.addHelpMenuItem({
                    name: 'about',
                    label: 'About KBase',
                    icon: 'info-circle',
                    url: Config.getConfig('docsite.baseUrl') + Config.getConfig('docsite.paths.about'),
                });
                return this;
            }
        },
        makeMenuItem: {
            value: function (cfg) {
                if (cfg.type === 'divider') {
                    var item = $('<li  role="presentation" class="divider"></li>').attr('data-menu-item', cfg.name);
                } else {
                    var item = $('<li></li>');
                    if (cfg.url) {
                        var link = $('<a></a>')
                                .attr('href', cfg.url)
                                .attr('data-menu-item', cfg.name);
                    } else if (cfg.callback) {
                        var link = $('<a></a>')
                                .attr('href', '#')
                                .attr('data-menu-item', cfg.name)
                                .on('click', cfg.callback);
                    }
                    if (cfg.external) {
                        link.attr('target', '_blank');
                    }
                    var icon = $('<div class="navbar-icon" style=""></div>');
                    if (cfg.icon) {
                        icon.append($('<span class="fa fa-' + cfg.icon + '"  class="navbar-icon"></span>'));
                    }
                    item.append(link.append(icon).append(cfg.label));
                }
                return item;
            }
        },
        addMenuItem: {
            value: function (cfg) {
                var menu = this.container.find('.navbar-menu .dropdown-menu');
                if (menu) {
                    var item = this.makeMenuItem(cfg);
                    if (item) {
                        if (cfg.place === 'end') {
                            menu.append(item);
                        } else {
                            menu.prepend(item);
                        }
                    }
                }
                return this;
            }
        },
        removeMenuItem: {
            value: function (cfg) {

            }
        },
        setAboutURL: {
            value: function (cfg) {

            }
        },
        addHelpMenuItem: {
            value: function (cfg) {
               var item = this.makeMenuItem(cfg);
               if (item) {
                  var menu = this.container.find('.navbar-menu .dropdown-menu');
                  if (menu) {
                     if (cfg.place === 'end') {
                        menu.append(item);
                     } else {
                        var helpDivider = menu.find('[data-menu-item="help"]');
                        if (helpDivider.length === 1) {
                           helpDivider.after(item);
                        } else {
                           menu.prepend(item);
                        }
                     }
                  }
               }
               return this;
            }
        },
        removeHelpMenuItem: {
            value: function (cfg) {

            }
        },
        clearMenu: {
            value: function (cfg) {
                this.container.find('.navbar-menu .dropdown-menu').empty();
                return this;
            }
        },
        // TEMPLATES
        getTemplate: {
            value: function (name) {
                if (this.templates.cache[name] === undefined) {
                    this.templates.cache[name] = this.templates.env.getTemplate(name + '.html');
                }
                return this.templates.cache[name];
            }
        },
        createTemplateContext: {
            value: function (additionalContext) {
                /*
                 var context = this.merge({}, this.context);
                 return this.merge(context, {
                 state: this.state, 
                 params: this.params
                 })
                 */

                // We need to ensure that the context reflects the current auth state.
                this.context.env.loggedIn = this.isLoggedIn();
                if (this.isLoggedIn()) {
                    this.context.env.loggedInUser = this.auth.username;
                    this.context.env.loggedInUserRealName = this.auth.realname;
                } else {
                    delete this.context.env.loggedInUser;
                    delete this.context.env.loggedInUserRealName;
                }

                this.context.env.isOwner = this.isOwner();

                if (additionalContext) {
                    var temp = this.merge({}, this.context);
                    return this.merge(temp, additionalContext);
                } else {
                    return this.context;
                }
            }
        },
        renderTemplate: {
            value: function (name, context) {
                var template = this.getTemplate(name);
                if (!template) {
                    throw 'Template ' + name + ' not found';
                }
                var context = context ? context : this.createTemplateContext();
                return template.render(context);
            }
         }
      });
      var TheNavbar = Object.create(Navbar).init({
         container: '#kbase-navbar'
      });
      return TheNavbar;
   });
