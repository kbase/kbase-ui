'use strict';
define(['jquery', 'underscore'], function($, _) {

    describe('required stuff?', function() {
        it('got jquery', function() {
            var el = $('<div>text</div>');
            expect(el.text()).toEqual('text');
        });
        it('got underscore', function() {
            expect(_.size([1,2,3])).toEqual(3);
        });
    });
    
});
