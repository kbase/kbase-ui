/* 
    kbaseModal

    This is a helper widget for rendering modals using bootstrap v3.0.0

    API Example:
        var modal = $('<div>').kbaseModal({title: 'Model Details', 
                                           rightLabel: 'Super Workspace,
                                           subText: 'kb|g.super.genome '});
*/

(function( $, undefined ) {

$.KBWidget({
    name: "kbaseModal",
    version: "1.0.0",
    options: {
    },
    init: function(options) {
        this._super(options);
        var self = this;

        var title = options.title;
        var subtext = options.subText;
        var right_label = options.rightLabel;
        var body = options.body;
        var buttons = options.buttons;

        var modal = $('<div class="modal">\
                              <div class="modal-dialog">\
                                  <div class="modal-content">\
                                    <div class="modal-header">\
                                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\
                                        <h3 class="modal-title"></h3>\
                                        <span class="modal-subtext"></span>\
                                    </div>\
                                    <div class="modal-body"></div>\
                                    <div class="modal-footer">\
                                      <a href="#" class="btn btn-default" data-dismiss="modal">Close</a>\
                                    </div>\
                                  </div>\
                              </div>\
                           </div>');

        var modal_header = modal.find('.modal-header');
        var modal_title = modal.find('.modal-title');
        var modal_subtext = modal.find('.modal-subtext');
        var modal_body = modal.find('.modal-body');
        var modal_footer = modal.find('.modal-footer');        

        if (title) modal_title.append(title);
        if (subtext) modal_subtext.append(subtext);
        if (body) modal_body.append(body);       

        // destroy every time, unless specified otherwise
        if (!options.noDestroy) {
            modal.on('hidden.bs.modal', function(){
                $(this).remove();
            });
        }

        this.header = function(data) {
            if (data) modal_header.html(data);
            return modal_header;
        }

        this.title = function(data) {
            if (data) modal_title.html(data);
            return modal_title;
        }        

        this.body = function(data) {
            if (data) modal_body.html(data);          
            return modal_body;
        }

        this.footer = function(data) {
            if (data) modal_footer.html(data);
            return modal_footer;
        }

        this.buttons = function(buttons) {
            modal_footer.html('')
            for (var i in buttons) {
                var btn = buttons[i];
                var text = btn.text;

                // make modal dismiss by default
                if (!btn.dismiss) {
                    var ele = $('<a class="btn" data-name="'+text+'"'+
                                            ' data-dismiss="modal">'+text+'</a>')
                } else {
                    var ele = $('<a class="btn" data-name="'+text+'">'+text+'</a>')

                } 

                // set button colors
                if (btn.kind == 'primary') {
                    ele.addClass('btn-primary');
                } else {
                    ele.addClass('btn-default');                    
                }

                modal_footer.append(ele);
            }
        }

        this.button = function(name) {
            console.log('name', name)
            console.log(modal_footer.find('[data-name="'+name+'"]'))
            return modal_footer.find('[data-name="'+name+'"]');
        }

        this.show = function() {
            modal.modal('show');
        }

        this.hide = function() {
            modal.modal('hide');
        }


        // do any options
        if (buttons) this.buttons(buttons);
        if (options.show) this.show();

        return this;
    }  //end init
})
}( jQuery ) );
