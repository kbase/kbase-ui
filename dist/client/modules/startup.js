require(["require-config"],function(){"use strict";require(["app/main"],function(a){a.start().then(function(){console.log("app has started!")})["catch"](function(a){document.getElementById("root").innerHTML="My gosh, I am not a happy camper. Please check the browser console.",console.log("app is unhappy :("),console.log(a)})})});