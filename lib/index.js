var utils = require('./utils'),
  request = require('request'),
  parseXML = require('xml2js').parseString,
  Q = require('q');

var runQuery = function (credentials, method) {

  return function (query, cb) {
    var deferred,
      isPromiseResponse = ('undefined' === typeof cb),
      url = utils.generateQueryString(query, method, credentials),
      noInternetMessage = 'No response (check internet connection)';

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
            var respObj = utils.deXMLize(resp[method + 'ErrorResponse']);
            if (isPromiseResponse) deferred.reject(respObj); else return cb(respObj);
          }
        });
      } else {
        parseXML(body, function (err, resp) {
          if (err) {
            if (isPromiseResponse) deferred.reject(JSON.stringify(err)); else return cb(JSON.stringify(err));
          } else {
            var respObj = utils.deXMLize(resp[method + 'Response'], ['Feature', 'EditorialReview', 'VariationAttribute', 'VariationDimension', 'ImageSet', 'Offer', 'Item']);
            delete respObj.OperationRequest;
            if (respObj.Cart && respObj.Cart.Request) {
              // Cart Response
              if (respObj.Cart.Request.Errors) {
                // Fix funky XML2JS formatting issues
                respObj.Cart.Request.Errors.Error instanceof Array ||
                  (respObj.Cart.Request.Errors.Error = [respObj.Cart.Request.Errors.Error]);
                try {
                  respObj.Cart.CartItems.CartItem instanceof Array ||
                    (respObj.Cart.CartItems.CartItem = [respObj.Cart.CartItems.CartItem]);
                } catch (e) { /* 'sokay */}
                respObj.Cart.Request.Errors = respObj.Cart.Request.Errors.Error;
                if (isPromiseResponse) deferred.reject(respObj); else return cb(respObj);
              }
              // Non Error Response
              if (respObj.Cart.CartItems){
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
                // Fix funky XML2JS formatting issues
                respObj.Items.Request.Errors.Error instanceof Array ||
                  (respObj.Items.Request.Errors.Error = [respObj.Items.Request.Errors.Error]);
                try {
                  respObj.Items.Item instanceof Array ||
                  (respObj.Items.Item = [respObj.Items.Item]);
                } catch (e) { /* 'sokay */ }
                respObj.Items.Request.Errors = respObj.Items.Request.Errors.Error;
                if (isPromiseResponse) deferred.reject(respObj); else return cb(respObj);
              }
              // Non Error Response
              if (respObj.Items.Item) {
                // Fix funky XML2JS formatting issues
                respObj.Items.Item instanceof Array ||
                  (respObj.Items.Item = [respObj.Items.Item]);
                if (isPromiseResponse) deferred.resolve(respObj); else return cb(null, respObj);
              }
            } else if (respObj.BrowseNodes && respObj.BrowseNodes.Request) {
              // Request Error
              if (respObj.BrowseNodes.Request.Errors) {
                // Fix funky XML2JS formatting issues
                respObj.BrowseNodes.Request.Errors.Error instanceof Array ||
                  (respObj.BrowseNodes.Request.Errors.Error = [respObj.BrowseNodes.Request.Errors.Error]);
                try {
                  respObj.BrowseNodes.BrowseNode instanceof Array ||
                  (respObj.BrowseNodes.BrowseNode = [respObj.BrowseNodes.BrowseNode]);
                } catch (e) { /* 'sokay */ }
                respObj.BrowseNodes.Request.Errors = respObj.BrowseNodes.Request.Errors.Error;
                if (isPromiseResponse) deferred.reject(respObj); else return cb(respObj);
              }
              // Non Error Response
              if (respObj.BrowseNodes.BrowseNode) {
                // Fix funky XML2JS formatting issues
                respObj.BrowseNodes.BrowseNode instanceof Array ||
                  (respObj.BrowseNodes.BrowseNode = [respObj.BrowseNodes.BrowseNode]);
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
    similarityLookup: runQuery(credentials, 'SimilarityLookup'),
    browseNodeLookup: runQuery(credentials, 'BrowseNodeLookup')
  };
};

exports.createClient = createClient;