function watchForWidgetMaxWidthCorrection(componentId) {
    var cmp = $('#' + componentId);
    var card = cmp.parent().parent();
    if ($.inArray("ui-resizable", card.attr('class').split(/\s+/))) {
    	card.on( "resize", function( event, ui ) {
    		var w = card.width();
    		var h = card.height();
    		cmp.css({'max-width': (w - 25) + 'px', 'max-height': (h - 83) + 'px'});
    	});
		//$(window).resize(windowResizeListener);
    } else {
    	console.log("widgetMaxWidthCorrection: component with id=" + componentId + 
    			" is not grandchild of landing page card (having 'ui-resizable' class), please check DOM tree");
	}
}