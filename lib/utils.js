var crypto = require('crypto');
var _ = require('lodash');

var generateSignature = function (stringToSign, awsSecret) {
  var hmac = crypto.createHmac('sha256', awsSecret);
  var signature = hmac.update(stringToSign).digest('base64');

  return signature;
};

var sort = function (object) {
  var sortedObject = {};
  var keys = Object.keys(object).sort();
  for (var i = 0; i < keys.length; i++) {
    sortedObject[keys[i]] = object[keys[i]];
  };
  return sortedObject;
}

var capitalize = function (string) {
  return string[0].toUpperCase() + string.slice(1)
}

var setDefaultParams = function (params, defaultParams) {
  for (var param in defaultParams) {
    if (typeof params[param] === 'undefined') {
      params[param] = defaultParams[param];
    }
  }
  return params;
}

var formatItemParams = function(items) {
  var params = {};
  items.forEach(function(item, idx) {
    var itemIdKey, itemQtyKey, itemId;
    item.ASIN ?
      (itemIdKey = ["Item", idx, "ASIN"].join("."), itemId = item.ASIN) :
    item.OfferListingId &&
      (itemIdKey = ["Item", idx, "OfferListingId"].join("."), itemId = item.OfferListingId);
    item.Quantity && (itemQtyKey = ["Item", idx, "Quantity"].join("."));
    itemIdKey && itemQtyKey && (params[itemIdKey] = itemId, params[itemQtyKey] = item.Quantity);
  });
  return params;
};

var formatQueryParams = function (query, method, credentials) {
  var params = {},
    items = _.clone(query.items);

  delete query.items;

  // format query keys
  for (var param in query) {
    var capitalized = capitalize(param);
    params[capitalized] = query[param];
  }

  if (method.match(/^Cart/)) {
    // format cart items
    if('object' === typeof items && items.length) {
      _.extend(params, formatItemParams(items));
    }
    // Default
    params = setDefaultParams(params, {
      ResponseGroup: 'Cart',
    });

  } else if (method.match(/^Browse/)) {
    // Default
    params = setDefaultParams(params, {
      BrowseNodeId: '',
      ResponseGroup: 'BrowseNodeInfo'
    });

  } else if (method.match(/^ItemSearch/)) {
    // Default
    params = setDefaultParams(params, {
      SearchIndex: 'All',
      Condition: 'All',
      ResponseGroup: 'ItemAttributes',
      Keywords: '',
      ItemPage: '1'
    });

  } else if (method.match(/^ItemLookup/)) {
    // Default
    params = setDefaultParams(params, {
      SearchIndex: 'All',
      Condition: 'All',
      ResponseGroup: 'ItemAttributes',
      IdType: 'ASIN',
      IncludeReviewsSummary: 'True',
      TruncateReviewsAt: '1000',
      VariationPage: 'All'
    });
    // Constraints
    // If ItemId is an ASIN (specified by IdType), a search index cannot be specified in the request.
    if (params['IdType'] === 'ASIN') {
      delete params['SearchIndex'];
    }
  }

  // Common params
  params['AWSAccessKeyId'] = credentials.awsId;
  params['AssociateTag'] = credentials.awsTag;
  params['Timestamp'] = new Date().toISOString();
  params['Service'] = 'AWSECommerceService';
  params['Operation'] = method;

  // sort
  params = sort(params);
  return params;
}

var generateQueryString = function (query, method, credentials) {
  var unsignedString = '';
  var domain = query.domain || 'webservices.amazon.com';
  var params = formatQueryParams(query, method, credentials);

  // generate query
  unsignedString = Object.keys(params).map(function (key) {
    return key + "=" + encodeURIComponent(params[key]);
  }).join("&")

  var signature = encodeURIComponent(generateSignature('GET\n' + domain + '\n/onca/xml\n' + unsignedString, credentials.awsSecret)).replace(/\+/g, '%2B');
  var queryString = 'http://' + domain + '/onca/xml?' + unsignedString + '&Signature=' + signature;

  return queryString;
};

var deXMLize = function(object, ignores) {
  ignores = ('undefined' === typeof ignores) ? [] : ignores;
  function recursivelyIterateProperties(jsonObject) {
    if (jsonObject instanceof Array) {
      for (var i = 0; i < jsonObject.length; ++i) {
          recursivelyIterateProperties(jsonObject[i])
      }
    } else if (typeof(jsonObject) === 'object') {
      Object.keys(jsonObject).forEach(function(prop) {
        if(jsonObject[prop] instanceof Array) {
          if((1 === jsonObject[prop].length) && (-1 === ignores.indexOf(prop))) {
            jsonObject[prop] = jsonObject[prop][0];
          }
          if(typeof(jsonObject[prop]) === 'object') {
            recursivelyIterateProperties(jsonObject[prop]);
          }
        } else if ('_' === prop) {
          jsonObject.Value = jsonObject[prop]
          delete jsonObject._;
        } else if ('$' === prop) {
          var clone = _.clone(jsonObject[prop]);
          _.extend(jsonObject, clone);
          delete jsonObject[prop];
        } else if (!(typeof(jsonObject[prop]) === 'string')) {
            recursivelyIterateProperties(jsonObject[prop]);
        }
      });
    }
  }
  recursivelyIterateProperties(object);
  return object;
};

exports.deXMLize = deXMLize;
exports.generateQueryString = generateQueryString;
exports.formatQueryParams = formatQueryParams;