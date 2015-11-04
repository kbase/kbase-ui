define(['jquery'], function ($) {
   return Object.create({}, {

      init: {
         value: function (cfg) {
            if (cfg && cfg.container) {
               if (typeof cfg.container === 'string') {
                  this.container = $(cfg.container);
               } else {
                  this.container = cfg.container;
               }
            }
            this.messages = [];
            
            return this;
         }

      },

      setContainer: {
         value: function (container) {
             if (typeof container === 'string') {
               this.container = $(container);
            } else {
               this.container = container;
            }
            return this;
         }
      },

      renderMessages: {
         value: function () {
            if (this.container) {
               this.container.empty();
               for (var i = 0; i < this.messages.length; i++) {
                  var message = this.messages[i];
                  var alertClass = 'default';
                  switch (message.type) {
                  case 'success':
                     alertClass = 'success';
                     break;
                  case 'info':
                     alertClass = 'info';
                     break;
                  case 'warning':
                     alertClass = 'warning';
                     break;
                  case 'danger':
                  case 'error':
                     alertClass = 'danger';
                     break;
                  }
                  this.container.append(
                     '<div class="alert alert-dismissible alert-' + alertClass + '" role="alert">' +
                     '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>' +
                     '<strong>' + message.title + '</strong> ' + message.message + '</div>');
               }
            }
         }
      },

      clearMessages: {
         value: function () {
            this.messages = [];
            this.renderMessages();
         }
      },

      addSuccessMessage: {
         value: function (title, message) {
            if (message === undefined) {
               message = title;
               title = '';
            }
            this.messages.push({
               type: 'success',
               title: title,
               message: message
            });
            this.renderMessages();
         }
      },

      addWarningMessage: {
         value: function (title, message) {
            if (message === undefined) {
               message = title;
               title = '';
            }
            this.messages.push({
               type: 'warning',
               title: title,
               message: message
            });
            this.renderMessages();
         }
      },

      addErrorMessage: {
         value: function (title, message) {
            if (message === undefined) {
               message = title;
               title = '';
            }
            this.messages.push({
               type: 'error',
               title: title,
               message: message
            });
            this.renderMessages();
         }
      },
   });
});