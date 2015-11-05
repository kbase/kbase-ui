define(['postal.request-response', 'q'], function (postal, Q) {
  postal.configuration.promise.createDeferred = function () {
    return Q.defer();
  };
  postal.configuration.promise.getPromise = function (deferred) {
    return deferred.promise;
  };
});