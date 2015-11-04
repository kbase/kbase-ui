define(['jquery'],
   function ($) {
      "use strict";
      return Object.create({}, {
         init: {
            value: function (cfg) {
               if (typeof cfg.container === 'string') {
                  this.container = $(cfg.container);
               } else {
                  this.container = cfg.container;
               }
               return this;
            }
         },
         version: {
            value: "0.0.1"
         },
         getVersion: {
            value: function () {
               return this.version;
            }
         },
         loadCSS: {
            value: function () {
               // TODO: this shold only load once.
               $('<link>')
                  .appendTo('head')
                  .attr({
                     type: 'text/css',
                     rel: 'stylesheet'
                  })
                  .attr('href', '/src/widgets/Buttonbar/style.css');
               return this;
            }
         },
       
         clear: {
            value: function () {
               this.container.empty();
               return this;
            }
         },
         makeButton: {
            value: function (cfg) {
               var iconStyle = 'margin-right: 5px;';
               var label = '';
               if (cfg.label) {
                  label = '<span class="kb-nav-btn-txt" style="vertical-align: middle;">' + cfg.label + '</span>';
               } else {
                  // iconStyle += 'font-size: 150%;';
               }
               //if (cfg.color) {
               //   iconStyle += 'color: ' + cfg.color + ';';
               //}

               if (cfg.url) {
                  // a link style button
                  if (cfg.external) {
                     cfg.target = '_blank';
                  }
                  if (cfg.target) {
                     var target = 'target="' + cfg.target + '"';
                  } else {
                     var target = '';
                  }
                  var button = $('<a data-button="' + cfg.name + '" id="kb-' + cfg.name + '-btn" class="btn btn-' + (cfg.style || 'default') + (cfg.class?' '+cfg.class:'')+' xnavbar-btn xkb-nav-btn" role="button" href="' + cfg.url + '" ' + target + '>' +
                     '  <span class="fa fa-' + cfg.icon + '" style="' + iconStyle + '"></span>' + label + '</a>')

               } else {
                  var button = $('<button data-button="' + cfg.name + '" id="kb-' + cfg.name + '-btn" class="btn btn-' + (cfg.style || 'default') + ' xnavbar-btn xkb-nav-btn">' +
                        '  <span class="fa fa-' + cfg.icon + '" style="' + iconStyle + '"></span>' + label + '</button>')
                     .on('click', function (e) {
                        e.preventDefault();
                        cfg.callback();
                     });
               }
               if (cfg.disabled) {
                  button.prop('disabled', true);
               }
               return button;
            }
         },
         addButton: {
            value: function (cfg) {
               var button = this.makeButton(cfg);
               if (cfg.place === 'end') {
                  this.container.append(button);
               } else {
                  this.container.prepend(button);
               }
               return this;
            }
         },
         findButton: {
            value: function (name) {
               return this.container.find('[data-button="' + name + '"]');
            }
         },
         
         addRadioToggle: {
            value: function (cfg) {
               var group = $('<div class="btn-group" data-toggle="buttons"></div>');
               for (var i=0; i<cfg.buttons.length; i++) {
                  var button = cfg.buttons[i];
                  
                  var toggle = $('<label class="btn btn-primary'+(button.active?' active':'')+ (button.class?' '+button.class:'')+'"><input type="radio" name="temp" autocomplete="off">' + button.label  + '</label>')
                  .on('click', (function (cb) {
                     return function (e) {
                        e.preventDefault();
                        cb();
                     }
                  })(button.callback));
                  group.append(toggle);
               }
              if (cfg.place === 'end') {
                  this.container.append(group);
               } else {
                  this.container.prepend(group);
               }
               return this;
            }
         },
         
         addDropdown: {
            value: function (cfg) {
               var iconStyle = '';
               var label = '';
               if (cfg.label) {
                  label = '<div class="kb-nav-btn-txt">' + cfg.label + ' <span class="caret"></span></div>';
               } else {
                  label = cfg.label + ' <span class="caret"></span>';
                  // iconStyle += 'font-size: 150%;';
               }
               var button = $('<button  class="btn btn-' + (cfg.style || 'default') + ' navbar-btn kb-nav-btn dropdown-toggle" data-toggle="dropdown" aria-expanded="false">' +
                     '  <div class="fa fa-' + cfg.icon + '" style="' + iconStyle + '"></div>' + label + '</button>');
               if (cfg.disabled) {
                  button.prop('disabled', true);
               } 

               var menu = $('<ul class="dropdown-menu" role="menu"></ul>');
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

               var dropdown = $('<div class="dropdown" style="display: inline-block;"></div>').append(button).append(menu);

               if (cfg.place === 'end') {
                  this.container.append(dropdown);
               } else {
                  this.container.prepend(dropdown);
               }
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
                  if (item.external) {
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
         
         addInput: {
            value: function (cfg) {
               // i made up navbar group to have the form be inline-block
               var form = $('<form class="navbar-form navbar-group" role="form"></form>');
               form.append('<div class="form-group"><input type="text" class="form-control" placeholder="'+(cfg.placeholder?cfg.placeholder:'')+'"</div>');
               if (cfg.onkeyup) {
                  form.on('keyup', (function (cb) {
                     return function (e) {
                        cb(e);
                     }
                  })(cfg.onkeyup));
               }
                if (cfg.place === 'end') {
                  this.container.append(form);
               } else {
                  this.container.prepend(form);
               }             
               return this;
            }
         }

        
      });
      
   });