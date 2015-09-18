/* based on https://developer.mozilla.org/en-US/docs/Web/API/document.cookie?redirectlocale=en-US&redirectslug=DOM%2Fdocument.cookie */
define([], function() {
  "use strict";
  var Cookie = Object.create({}, {
    init: {
      value: function() {
        return this;
      }
    },
    getItem: {
      value: function(sKey) {
        if (!sKey) {
          return null; 
        }
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
      }
    },
    setItem: {
      value: function(sKey, sValue, vEnd, sPath, sDomain, bSecure, bNoEncode) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
          return false;
        }
        var sExpires = "";
        if (vEnd) {
          switch (vEnd.constructor) {
            case Number:
              sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
              break;
            case String:
              sExpires = "; expires=" + vEnd;
              break;
            case Date:
              sExpires = "; expires=" + vEnd.toUTCString();
              break;
          }
        }
        if (bNoEncode) {
          // For compatability with services which do not decode cookies yet create cookies
          // save for not encoding. Aka - Globus.
          document.cookie = sKey + "=" + sValue + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        } else {
          document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        }
 
        return true;
      }
    },
    removeItem: {
      value: function(sKey, sPath, sDomain) {
        if (!this.hasItem(sKey)) {
          return false;
        }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
        return true;
      }
    },
    hasItem: {
      value: function(sKey) {
        if (!sKey) {
          return false;
        }
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
      }
    },
    keys: {
      value: function() {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
          aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
        }
        return aKeys;
      }
    }
  });
  return Cookie.init();
});
