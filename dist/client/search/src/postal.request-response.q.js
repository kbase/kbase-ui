define(["postal.request-response","q"],function(a,b){a.configuration.promise.createDeferred=function(){return b.defer()},a.configuration.promise.getPromise=function(a){return a.promise}});