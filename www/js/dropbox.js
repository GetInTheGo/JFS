'use strict';


angular.module('dropbox', [])


  .provider('Dropbox', function DropboxProvider () {


    var clientId, redirectUri;


    this.config = function (id, uri) {
      this.clientId = clientId    = id;
      this.redirectUri = redirectUri = uri;
    };


    this.$get = [
      '$q',
      '$http',
      '$window',
      function ($q, $http, $window) {


        /**
         * Credentials
         */

        var oauth = {access_token:"Q97s2PcThkMAAAAAAAB12r6Z6FAIKdLFxUy8uTSFqAv2VnRRG6QxtK80OukeGzBh"};


        /**
         * Dropbox API Servers
         */

        var authServer = 'https://www.dropbox.com'
          , apiServer  = 'https://api.dropbox.com'
          , fileServer = 'https://api-content.dropbox.com';


        /**
         * API Method URLs
         */

        var urls = {
          // Authentication.
          authorize:           authServer + '/1/oauth2/authorize',
          token:               apiServer  + '/1/oauth2/token',
          signOut:             apiServer  + '/1/unlink_access_token',

          // Accounts.
          accountInfo:         apiServer  + '/1/account/info',

          // Files and metadata.
          getFile:             fileServer + '/1/files/auto/',
          postFile:            fileServer + '/1/files/auto/',
          putFile:             fileServer + '/1/files_put/auto/',
          preview:             fileServer  + '/1/previews/auto/',
          metadata:            apiServer  + '/1/metadata/auto/',
          delta:               apiServer  + '/1/delta',
          revisions:           apiServer  + '/1/revisions/auto/',
          restore:             apiServer  + '/1/restore/auto/',
          search:              apiServer  + '/1/search/auto/',
          shares:              apiServer  + '/1/shares/auto',
          media:               apiServer  + '/1/media/auto',
          copyRef:             apiServer  + '/1/copy_ref/auto',
          thumbnails:          fileServer + '/1/thumbnails/auto',
          chunkedUpload:       fileServer + '/1/chunked_upload',
          commitChunkedUpload: fileServer + '/1/commit_chunked_upload/auto',

          // File operations.
          fileopsCopy:         apiServer  + '/1/fileops/copy',
          fileopsCreateFolder: apiServer  + '/1/fileops/create_folder',
          fileopsDelete:       apiServer  + '/1/fileops/delete',
          fileopsMove:         apiServer  + '/1/fileops/move'
        };


        /**
         * OAuth 2.0 Signatures
         */

        function oauthHeader(options) {
          if (!options.headers) { options.headers = {}; }
          options.headers['Authorization'] = 'Bearer ' + oauth.access_token;
        }

        function oauthParams(options) {
          if (!options.params) { options.params = {}; }
          options.params.access_token = oauth.access_token;
        }


        /**
         * HTTP Request Helper
         */

        function request(config) {
          var deferred = $q.defer();

          oauthHeader(config);

          function success(response) {
            console.log(response);
            deferred.resolve(response);
          }

          function failure(fault) {
            console.log(config, fault);
            deferred.reject(fault);
          }

          $http(config).then(success, failure);
          return deferred.promise;
        }


        /**
         * HTTP GET Helper
         */

        function GET(url, params) {
          var responseType = 'text';
          if (params) {
            if (params.arrayBuffer) {
              responseType = 'arraybuffer';
              params={};
            } else if (params.blob) {
              responseType = 'blob';
              params={};
            } else if (params.buffer) {
              responseType = 'buffer';
            } else if (params.binary) {
              responseType = 'b'; // See the Dropbox.Util.Xhr.setResponseType docs
            }
          }

          return request({
            responseType: responseType,
            method: 'GET',
            url: url,
            params: params
          });
        }


        /**
         * HTTP POST Helper
         */

        function POST(url, data, params) {
          return request({
            method: 'POST',
            url: url,
            data: data,
            params: params
          });
        }


        /**
         * Configure the authorize popup window
         * Adapted from dropbox-js
         */

        function popupSize(popupWidth, popupHeight) {
          var x0, y0, width, height, popupLeft, popupTop;

          // Metrics for the current browser window.
          x0 = $window.screenX || $window.screenLeft
          y0 = $window.screenY || $window.screenTop
          width = $window.outerWidth || $document.documentElement.clientWidth
          height = $window.outerHeight || $document.documentElement.clientHeight

          // Computed popup window metrics.
          popupLeft = Math.round(x0) + (width - popupWidth) / 2
          popupTop = Math.round(y0) + (height - popupHeight) / 2.5
          if (popupLeft < x0) { popupLeft = x0 }
          if (popupTop < y0) { popupTop = y0 }

          return 'width=' + popupWidth + ',height=' + popupHeight + ',' +
                 'left=' + popupLeft + ',top=' + popupTop + ',' +
                 'dialog=yes,dependent=yes,scrollbars=yes,location=yes';
        }


        /**
         * Parse credentials from Dropbox authorize callback
         * Adapted from dropbox-js
         */

        function queryParamsFromUrl(url) {
          var match = /^[^?#]+(\?([^\#]*))?(\#(.*))?$/.exec(url);
          if (!match) { return {}; }

          var query = match[2] || ''
            , fragment = match[4] || ''
            , fragmentOffset = fragment.indexOf('?')
            , params = {}
            ;

          if (fragmentOffset !== -1) {
            fragment = fragment.substring(fragmentOffset + 1);
          }

          var kvp = query.split('&').concat(fragment.split('&'));
          kvp.forEach(function (kv) {
            var offset = kv.indexOf('=');
            if (offset === -1) { return; }
            params[decodeURIComponent(kv.substring(0, offset))] =
                   decodeURIComponent(kv.substring(offset + 1));
          });

          return params;
        }


        /**
         * Dropbox Service
         */

        return {


          urls: urls,                       // exposed for testing


          credentials: function () {
            return oauth;
          },


          authenticate: function () {
            var self = this
              , deferred = $q.defer()
              , authUrl = urls.authorize
                        + '?client_id=' + clientId
                     // + '&state=' +
                        + '&response_type=token'
                        + '&redirect_uri=' + redirectUri

            function listener(event) {
              var response = queryParamsFromUrl(event.data);

              if (response.access_denied) {
                deferred.reject(response);
              }

              else if (response.access_token) {
                oauth = self.oauth = response;
                deferred.resolve(oauth);
              }

              $window.removeEventListener('message', listener, false);
            }

            $window.addEventListener('message', listener, false);
            $window.open(authUrl,'_dropboxOauthSigninWindow', popupSize(700, 500));

            return deferred.promise;
          },


          isAuthenticated: function () {
            return (oauth.access_token) ? true : false
          },


          // signOut


          // signOff


          accountInfo: function () {
            return GET(urls.accountInfo);
          },


          userInfo: function () {
            return this.accountInfo();
          },


          readFile: function (path, params) {
            return GET(urls.getFile + path, params);
          },


          writeFile: function (path, content, params) {
            return request({
              method: 'POST',
              url: urls.putFile + path,
              data: content,
              headers: { 'Content-Type': undefined },
              transformRequest: angular.identity,
              params: params
            });
          },


          stat: function (path, params) {
            return GET(urls.metadata + path, params);
          },


          readdir: function (path, params) {
            var deferred = $q.defer();

            function success(stat) {
              var entries = stat.contents.map(function (entry) {
                return entry;
              });

              console.log('readdir of ' + path, entries);
              deferred.resolve(entries);
            }

            function failure(fault) { deferred.reject(fault); }

            this.stat(path, params).then(success, failure);
            return deferred.promise;
          },


          metadata: function (path, params) {
            return this.stat(path, params);
          },


          // makeUrl


          history: function (path, params) {
            return GET(urls.revisions + path, params);
          },


          revisions: function (path, params) {
            return this.history(path, params);
          },


          thumbnailUrl: function (path, params,size) {
            return GET(urls.thumbnails
                 + path
                 + '?format=jpeg&size='+size//+'&access_token='
                 //+ oauth.access_token,params
                      ,params);
          },


          // readThumbnail


          revertFile: function (path, rev) {
            return POST(urls.restore + path, null, { rev: rev });
          },
          preview: function (path, params) {
            return GET(urls.preview + path, params);
          },
          restore: function (path, rev) {
            return this.revertFile(path, rev);
          },


          findByName: function (path, pattern, params) {
            var params = params || {};
            params.query = pattern;

            return GET(urls.search + path, params);
          },


          search: function (path, pattern, params) {
            return this.findByName(path, pattern, params);
          },


          // makeCopyReference


          // copyRef


          // pullChanges


          // delta


          mkdir: function (path) {
            return POST(urls.fileopsCreateFolder, null, {
              root: 'auto',
              path: path
            });
          },


          remove: function (path) {
            return POST(urls.fileopsDelete, null, {
              root: 'auto',
              path: path
            });
          },


          unlink: function (path) {
            return this.remove(path);
          },


          delete: function (path) {
            return this.remove(path);
          },


          copy: function (from, to) {
            return POST(urls.fileopsCopy, null, {
              root: 'auto',
              to_path: to,
              from_path: from
            });
          },


          move: function (from, to) {
            return POST(urls.fileopsMove, null, {
              root: 'auto',
              to_path: to,
              from_path: from
            });
          },


          reset: function () {
            oauth = {};
          },


          setCredentials: function (credentials) {
            oauth = credentials;
          },


          // appHash


        };


      }];


  })
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.ngFileSaver=e():t.ngFileSaver=e()}(this,function(){return function(t){function e(o){if(n[o])return n[o].exports;var r=n[o]={exports:{},id:o,loaded:!1};return t[o].call(r.exports,r,r.exports,e),r.loaded=!0,r.exports}var n={};return e.m=t,e.c=n,e.p="",e(0)}([function(t,e,n){"use strict";t.exports="ngFileSaver",angular.module("ngFileSaver",[]).factory("FileSaver",["Blob","SaveAs","FileSaverUtils",n(1)]).factory("FileSaverUtils",[n(2)]).factory("Blob",["$window",n(3)]).factory("SaveAs",[n(5)])},function(t,e){"use strict";t.exports=function(t,e,n){function o(t,o,r){try{e(t,o,r)}catch(i){n.handleErrors(i.message)}}return{saveAs:function(t,e,r){return n.isBlobInstance(t)||n.handleErrors("Data argument should be a blob instance"),n.isString(e)||n.handleErrors("Filename argument should be a string"),o(t,e,r)}}}},function(t,e){"use strict";t.exports=function(){return{handleErrors:function(t){throw new Error(t)},isString:function(t){return"string"==typeof t||t instanceof String},isUndefined:function(t){return"undefined"==typeof t},isBlobInstance:function(t){return t instanceof Blob}}}},function(t,e,n){"use strict";n(4),t.exports=function(t){return t.Blob}},function(t,e){!function(t){"use strict";if(t.URL=t.URL||t.webkitURL,t.Blob&&t.URL)try{return void new Blob}catch(e){}var n=t.BlobBuilder||t.WebKitBlobBuilder||t.MozBlobBuilder||function(t){var e=function(t){return Object.prototype.toString.call(t).match(/^\[object\s(.*)\]$/)[1]},n=function(){this.data=[]},o=function(t,e,n){this.data=t,this.size=t.length,this.type=e,this.encoding=n},r=n.prototype,i=o.prototype,a=t.FileReaderSync,c=function(t){this.code=this[this.name=t]},s="NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR".split(" "),u=s.length,f=t.URL||t.webkitURL||t,l=f.createObjectURL,d=f.revokeObjectURL,p=f,h=t.btoa,b=t.atob,v=t.ArrayBuffer,w=t.Uint8Array,g=/^[\w-]+:\/*\[?[\w\.:-]+\]?(?::[0-9]+)?/;for(o.fake=i.fake=!0;u--;)c.prototype[s[u]]=u+1;return f.createObjectURL||(p=t.URL=function(t){var e,n=document.createElementNS("http://www.w3.org/1999/xhtml","a");return n.href=t,"origin"in n||("data:"===n.protocol.toLowerCase()?n.origin=null:(e=t.match(g),n.origin=e&&e[1])),n}),p.createObjectURL=function(t){var e,n=t.type;return null===n&&(n="application/octet-stream"),t instanceof o?(e="data:"+n,"base64"===t.encoding?e+";base64,"+t.data:"URI"===t.encoding?e+","+decodeURIComponent(t.data):h?e+";base64,"+h(t.data):e+","+encodeURIComponent(t.data)):l?l.call(f,t):void 0},p.revokeObjectURL=function(t){"data:"!==t.substring(0,5)&&d&&d.call(f,t)},r.append=function(t){var n=this.data;if(w&&(t instanceof v||t instanceof w)){for(var r="",i=new w(t),s=0,u=i.length;u>s;s++)r+=String.fromCharCode(i[s]);n.push(r)}else if("Blob"===e(t)||"File"===e(t)){if(!a)throw new c("NOT_READABLE_ERR");var f=new a;n.push(f.readAsBinaryString(t))}else t instanceof o?"base64"===t.encoding&&b?n.push(b(t.data)):"URI"===t.encoding?n.push(decodeURIComponent(t.data)):"raw"===t.encoding&&n.push(t.data):("string"!=typeof t&&(t+=""),n.push(unescape(encodeURIComponent(t))))},r.getBlob=function(t){return arguments.length||(t=null),new o(this.data.join(""),t,"raw")},r.toString=function(){return"[object BlobBuilder]"},i.slice=function(t,e,n){var r=arguments.length;return 3>r&&(n=null),new o(this.data.slice(t,r>1?e:this.data.length),n,this.encoding)},i.toString=function(){return"[object Blob]"},i.close=function(){this.size=0,delete this.data},n}(t);t.Blob=function(t,e){var o=e?e.type||"":"",r=new n;if(t)for(var i=0,a=t.length;a>i;i++)Uint8Array&&t[i]instanceof Uint8Array?r.append(t[i].buffer):r.append(t[i]);var c=r.getBlob(o);return!c.slice&&c.webkitSlice&&(c.slice=c.webkitSlice),c};var o=Object.getPrototypeOf||function(t){return t.__proto__};t.Blob.prototype=o(new t.Blob)}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this.content||this)},function(t,e,n){"use strict";t.exports=function(){return n(6).saveAs||function(){}}},function(t,e,n){var o,r,i=i||function(t){"use strict";if("undefined"==typeof navigator||!/MSIE [1-9]\./.test(navigator.userAgent)){var e=t.document,n=function(){return t.URL||t.webkitURL||t},o=e.createElementNS("http://www.w3.org/1999/xhtml","a"),r="download"in o,i=function(t){var e=new MouseEvent("click");t.dispatchEvent(e)},a=/Version\/[\d\.]+.*Safari/.test(navigator.userAgent),c=t.webkitRequestFileSystem,s=t.requestFileSystem||c||t.mozRequestFileSystem,u=function(e){(t.setImmediate||t.setTimeout)(function(){throw e},0)},f="application/octet-stream",l=0,d=4e4,p=function(t){var e=function(){"string"==typeof t?n().revokeObjectURL(t):t.remove()};setTimeout(e,d)},h=function(t,e,n){e=[].concat(e);for(var o=e.length;o--;){var r=t["on"+e[o]];if("function"==typeof r)try{r.call(t,n||t)}catch(i){u(i)}}},b=function(t){return/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(t.type)?new Blob(["\ufeff",t],{type:t.type}):t},v=function(e,u,d){d||(e=b(e));var v,w,g,y=this,R=e.type,S=!1,m=function(){h(y,"writestart progress write writeend".split(" "))},E=function(){if(w&&a&&"undefined"!=typeof FileReader){var o=new FileReader;return o.onloadend=function(){var t=o.result;w.location.href="data:attachment/file"+t.slice(t.search(/[,;]/)),y.readyState=y.DONE,m()},o.readAsDataURL(e),void(y.readyState=y.INIT)}if((S||!v)&&(v=n().createObjectURL(e)),w)w.location.href=v;else{var r=t.open(v,"_blank");void 0===r&&a&&(t.location.href=v)}y.readyState=y.DONE,m(),p(v)},O=function(t){return function(){return y.readyState!==y.DONE?t.apply(this,arguments):void 0}},U={create:!0,exclusive:!1};return y.readyState=y.INIT,u||(u="download"),r?(v=n().createObjectURL(e),void setTimeout(function(){o.href=v,o.download=u,i(o),m(),p(v),y.readyState=y.DONE})):(t.chrome&&R&&R!==f&&(g=e.slice||e.webkitSlice,e=g.call(e,0,e.size,f),S=!0),c&&"download"!==u&&(u+=".download"),(R===f||c)&&(w=t),s?(l+=e.size,void s(t.TEMPORARY,l,O(function(t){t.root.getDirectory("saved",U,O(function(t){var n=function(){t.getFile(u,U,O(function(t){t.createWriter(O(function(n){n.onwriteend=function(e){w.location.href=t.toURL(),y.readyState=y.DONE,h(y,"writeend",e),p(t)},n.onerror=function(){var t=n.error;t.code!==t.ABORT_ERR&&E()},"writestart progress write abort".split(" ").forEach(function(t){n["on"+t]=y["on"+t]}),n.write(e),y.abort=function(){n.abort(),y.readyState=y.DONE},y.readyState=y.WRITING}),E)}),E)};t.getFile(u,{create:!1},O(function(t){t.remove(),n()}),O(function(t){t.code===t.NOT_FOUND_ERR?n():E()}))}),E)}),E)):void E())},w=v.prototype,g=function(t,e,n){return new v(t,e,n)};return"undefined"!=typeof navigator&&navigator.msSaveOrOpenBlob?function(t,e,n){return n||(t=b(t)),navigator.msSaveOrOpenBlob(t,e||"download")}:(w.abort=function(){var t=this;t.readyState=t.DONE,h(t,"abort")},w.readyState=w.INIT=0,w.WRITING=1,w.DONE=2,w.error=w.onwritestart=w.onprogress=w.onwrite=w.onabort=w.onerror=w.onwriteend=null,g)}}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this.content);"undefined"!=typeof t&&t.exports?t.exports.saveAs=i:null!==n(7)&&null!==n(8)&&(o=[],r=function(){return i}.apply(e,o),!(void 0!==r&&(t.exports=r)))},function(t,e){t.exports=function(){throw new Error("define cannot be used indirect")}},function(t,e){(function(e){t.exports=e}).call(e,{})}])});
