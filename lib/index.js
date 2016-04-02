var utils = require('./utils'),
  request = require('request'),
  parseXML = require('xml2js').parseString,
  Q = require('q');

var xmlOptions =  {
  explicitArray: false,
  explicitRoot: true,
  ignoreAttrs: true
};

var runQuery = function (credentials, method) {

  return function (query, cb) {
    var deferred,
      isPromiseResponse = ('undefined' === typeof cb),
      url = utils.generateQueryString(query, method, credentials),
      noInternetMessage = 'No response (check internet connection)';

    console.log('url', url);

    if (isPromiseResponse) deferred = Q.defer();

    request(url, function (err, response, body) {;

      if (err) {
        if (isPromiseResponse) deferred.reject(JSON.stringify(err)); else return cb(JSON.stringify(err));
      } else if (!response) {
        err = new Error(noInternetMessage);
        if (isPromiseResponse) deferred.reject(JSON.stringify(err)); else return cb(JSON.stringify(err));
      } else if (response.statusCode !== 200) {
        parseXML(body, function (err, resp) {
          if (err) {
            if (isPromiseResponse) deferred.reject(JSON.stringify(err)); else return cb(JSON.stringify(err));
          } else {
            if (isPromiseResponse) deferred.reject(resp[method + 'ErrorResponse']); else return cb(resp[method + 'ErrorResponse']);
          }
        });
      } else {
        parseXML(body, xmlOptions, function (err, resp) {
          if (err) {
            if (isPromiseResponse) deferred.reject(JSON.stringify(err)); else return cb(JSON.stringify(err));
          } else {
            var respObj = resp[method + 'Response'];
            delete respObj.OperationRequest;
            if (respObj.Cart && respObj.Cart.Request) {
              // Cart Response
              if (respObj.Cart.Request.Errors) {
                if (isPromiseResponse) deferred.reject(respObj); else return cb(respObj);
              } else if (respObj.Cart.CartItems){
                // Fix funky XML2JS formatting issues
                respObj.Cart.CartItems.CartItem instanceof Array ||
                  (respObj.Cart.CartItems.CartItem = [respObj.Cart.CartItems.CartItem]);
                if (isPromiseResponse) deferred.resolve(respObj); else return cb(null, respObj);
              } else if (respObj.Cart.CartId) {
                if (isPromiseResponse) deferred.resolve(respObj); else return cb(null, respObj);
              }
            } else if (respObj.Items && respObj.Items.Request) {
              // Request Error
              if (respObj.Items.Request.Errors) {
                if (isPromiseResponse) deferred.reject(respObj); else return cb(respObj);
              } else if (respObj.Items.Item) {
                if (isPromiseResponse) deferred.resolve(respObj); else return cb(null, respObj);
              }
            } else if (respObj.BrowseNodes && respObj.BrowseNodes.Request) {
              // Request Error
              if (respObj.BrowseNodes.Request.Errors) {
                if (isPromiseResponse) deferred.reject(respObj); else return cb(respObj);
              } else if (respObj.BrowseNodes.BrowseNode) {
                if (isPromiseResponse) deferred.resolve(respObj); else return cb(null, respObj);
              }
            }
          }
        });
      }
    });

    if (isPromiseResponse) return deferred.promise;
  };
};

var createClient = function (credentials) {
  return {
    cartCreate: runQuery(credentials, 'CartCreate'),
    cartClear: runQuery(credentials, 'CartClear'),
    cartAdd: runQuery(credentials, 'CartAdd'),
    cartGet: runQuery(credentials, 'CartGet'),
    cartModify: runQuery(credentials, 'CartModify'),
    itemSearch: runQuery(credentials, 'ItemSearch'),
    itemLookup: runQuery(credentials, 'ItemLookup'),
    browseNodeLookup: runQuery(credentials, 'BrowseNodeLookup')
  };
};

exports.createClient = createClient;