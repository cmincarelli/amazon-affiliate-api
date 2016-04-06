
# NodeJS Amazon Affiliate API Client

[![Build Status](https://travis-ci.org/cmincarelli/amazon-affiliate-api.svg?branch=master)](https://travis-ci.org/cmincarelli/amazon-affiliate-api)
[![Dependency Status](https://gemnasium.com/cmincarelli/amazon-affiliate-api.svg)](https://gemnasium.com/cmincarelli/amazon-affiliate-api)

[![Amazon Product API](http://i.imgur.com/MwfPRfB.gif)](http://docs.aws.amazon.com/AWSECommerceService/latest/DG/Welcome.html)

"amazon-affiliate-api" is just a thin wrapper around Amazon's API.

The intent is to simplify the request process by automatically handling request signatures, performing the HTTP requests, processing the responses and parsing the XML.

The result is that you feel like you're working directly with the API, but you don't have to worry about some of the more tedious tasks.

This library impliments Q promises, and supports callbacks.

## Installation

### Install using npm:

```javascript
npm install amazon-affiliate-api
```

## Usage

### Require library

```javascript
amazon = require('amazon-affiliate-api');
```

### Create client

```javascript
var client = amazon.createClient({
  awsId: "aws ID",
  awsSecret: "aws Secret",
  awsTag: "aws Tag"
});
```

### Now you can search for items on amazon:

#### Search Items

using promises:

```javascript
client.itemSearch({
  director: 'Quentin Tarantino',
  actor: 'Samuel L. Jackson',
  searchIndex: 'DVD',
  audienceRating: 'R',
  responseGroup: 'ItemAttributes,Offers,Images'
}).then(function(results){
  console.log(results);
}).catch(function(err){
  console.log(err);
});
```

using a callback:

```javascript
client.itemSearch({
  director: 'Quentin Tarantino',
  actor: 'Samuel L. Jackson',
  searchIndex: 'DVD',
  audienceRating: 'R',
  responseGroup: 'ItemAttributes,Offers,Images'
}, function(err, results) {
  if (err) {
    console.log(err);
  } else {
    console.log(results);
  }
});
```

##### Search query options:

You can add any available params for the itemSearch method.

**condition**: availiable options - 'All', 'New', 'Used', 'Refurbished', 'Collectible'. Defaults to 'All'.

**keywords**: Defaults to ''.

**responseGroup**: You can use multiple values by separating them with comma (e.g `responseGroup: 'ItemAttributes,Offers,Images`'). Defaults to'ItemAttributes'

**searchIndex**: Defaults to 'All'.

**itemPage**: Defaults to '1'.

**sort**: Valid values include 'salesrank','psrank','titlerank','-price','price'.

**domain**: Defaults to 'webservices.amazon.com'.



#### Lookup Item

using promises:

```javascript
client.itemLookup({
  idType: 'UPC',
  itemId: '884392579524'
}).then(function(results) {
  console.log(results);
}).catch(function(err) {
  console.log(err);
});
```

using a callback:

```javascript
client.itemLookup({
  idType: 'UPC',
  itemId: '635753490879',
  responseGroup: 'ItemAttributes,Offers,Images'
}, function(err, results) {
  if (err) {
    console.log(err);
  } else {
    console.log(results);
  }
});
```
##### LookupItem query options:

You can add any available params for the ItemLookup method.

**condition**: options - 'All', 'New', 'Used', 'Refurbished', 'Collectible'. Defaults to 'All'

**idType**: Type of item identifier used to look up an item. options - 'ASIN', 'SKU', 'UPC', 'EAN', 'ISBN'. Defaults to 'ASIN'.

**includeReviewsSummary**: options - 'True','False'. Defaults to 'True'.

**itemId**: One or more (up to ten) positive integers that uniquely identify an item.

**responseGroup**: You can use multiple values by separating them with comma (e.g `responseGroup: 'ItemAttributes,Offers,Images`'). Defaults to 'ItemAttributes'

**searchIndex**: Defaults to 'All'.

**truncateReviewsAt**: Defaults to '1000'. To return complete reviews, specify '0'.

**variationPage**: Defaults to 'All'.

**domain**: Defaults to 'webservices.amazon.com'.

#### Browse Node Lookup

using promises:

```javascript
client.browseNodeLookup({
  browseNodeId: '549726',
  responseGroup: 'NewReleases'
}).then(function(results) {
  console.log(results);
}).catch(function(err) {
  console.log(err);
});
```

using a callback:

```javascript
client.browseNodeLookup({
  browseNodeId: '549726',
  responseGroup: 'NewReleases'
}, function(err, results) {
  if (err) {
    console.log(err);
  } else {
    console.log(results);
  }
});
```

##### BrowseNodeLookup query options:

You can add any available params for the BrowseNodeLookup method.

**browseNodeId**: A positive integer assigned by Amazon that uniquely identifies a product category.

**responseGroup**: You can use multiple values by separating them with comma (e.g `responseGroup: 'MostGifted,NewReleases,MostWishedFor,TopSellers'`). Defaults to 'BrowseNodeInfo'

### Now you can manipulate amazon remote shopping-cart:

**PLEASE NOTE**

*Most methods for Cart require both CartId and HMAC, which are returned by `CartCreate`.*

#### Cart Create

You must include at least one item on cart creation. `cartCreate` returns "CartId" and "HMAC", which are required by all subsiquent requests to this cart.

using promises

```javascript
client.cartCreate({
  items:[{
    ASIN: "B00LZTHUH6",
    Quantity: 1
  }, {
    ASIN: "B00OZTLE8Y",
    Quantity: 1
  }]
}).then(function(results){
  console.log(results);
}).fail(
  console.log(results);
});
```

using callbacks

```javascript
client.cartCreate({
  items:[{
    ASIN: "B00LZTHUH6",
    Quantity: 1
  }, {
    ASIN: "B00OZTLE8Y",
    Quantity: 1
  }]
}, function (err, results ){
	console.log(err, results);
});
```

##### cartCreate query options:

You can add any available params for the CartCreate method.

**items**: an array of items to add to the cart; must include Quantity and one of ASIN or OfferListingId.

**responseGroup**: You can use multiple values by separating them with comma (e.g `responseGroup: 'MostGifted,NewReleases,MostWishedFor,TopSellers'`). Defaults to 'Cart'

#### Cart Clear

using promises

```javascript
client.cartClear({
  'CartId': <results.Cart.CartId>,
  'HMAC': <results.Cart.HMAC>
}).then(function(results){
  console.log(results);
}).fail(
  console.log(results);
});
```

using callbacks

```javascript
client.cartCreate({
  'CartId': <results.Cart.CartId>,
  'HMAC': <results.Cart.HMAC>
}, function (err, results ){
	console.log(err, results);
});
```

##### cartClear query options:

You must supply the CartId and HMAC returned from the `cartCreate` method.

You can add any available params for the CartClear method.

**responseGroup**: You can use multiple values by separating them with comma (e.g `responseGroup: 'MostGifted,NewReleases,MostWishedFor,TopSellers'`). Defaults to 'Cart'

#### Cart Add Item

using promises

```javascript
client.cartAdd({
  'CartId': <results.Cart.CartId>,
  'HMAC': <results.Cart.HMAC>,
  items:[{
    ASIN: "B00LZTHUH6",
    Quantity: 1
  }, {
    ASIN: "B00OZTLE8Y",
    Quantity: 1
  }]
}).then(function(results){
  console.log(results);
}).fail(
  console.log(results);
});
```

using callbacks

```javascript
client.cartAdd({
  'CartId': <results.Cart.CartId>,
  'HMAC': <results.Cart.HMAC>,
  items:[{
    ASIN: "B00LZTHUH6",
    Quantity: 1
  }, {
    ASIN: "B00OZTLE8Y",
    Quantity: 1
  }]
}, function (err, results ){
	console.log(err, results);
});
```

##### cartAdd query options:

You must supply the CartId and HMAC returned from the `cartCreate` method.

You can add any available params for the CartAdd method.

**items**: an array of items to add to the cart; must include Quantity and one of ASIN or OfferListingId.

**responseGroup**: You can use multiple values by separating them with comma (e.g `responseGroup: 'MostGifted,NewReleases,MostWishedFor,TopSellers'`). Defaults to 'Cart'

#### Get Cart

using promises

```javascript
client.cartGet({
  'CartId': <results.Cart.CartId>,
  'HMAC': <results.Cart.HMAC>
}).then(function(results){
  console.log(results);
}).fail(
  console.log(results);
});
```

using callbacks

```javascript
client.cartAdd({
  'CartId': <results.Cart.CartId>,
  'HMAC': <results.Cart.HMAC>,
}, function (err, results ){
	console.log(err, results);
});
```

##### cartGet query options:

You must supply the CartId and HMAC returned from the `cartCreate` method.

You can add any available params for the CartGet method.

**responseGroup**: You can use multiple values by separating them with comma (e.g `responseGroup: 'MostGifted,NewReleases,MostWishedFor,TopSellers'`). Defaults to 'Cart'

#### Modify Cart

using promises

```javascript
client.cartModify({
  'CartId': <results.Cart.CartId>,
  'HMAC': <results.Cart.HMAC>,
  items:[{
      CartItemId: <results.Cart.CartItems.CartItem[0].CartItemId>,
      Quantity: 0
  }, {
      CartItemId: <results.Cart.CartItems.CartItem[0].CartItemId>,
      Quantity: 0
  }]
}).then(function(results){
  console.log(results);
}).fail(
  console.log(results);
});
```

using callbacks

```javascript
client.cartModify({
  'CartId': <results.Cart.CartId>,
  'HMAC': <results.Cart.HMAC>,
  items:[{
      CartItemId: <results.Cart.CartItems.CartItem[0].CartItemId>,
      Quantity: 0
  }, {
      CartItemId: <results.Cart.CartItems.CartItem[0].CartItemId>,
      Quantity: 0
  }]
}, function (err, results ){
	console.log(err, results);
});
```
##### cartModify query options:

You must supply the CartId and HMAC returned from the `cartCreate` method.

You can add any available params for the CartModify method.

**items**: an array of items to modify in the cart; must include Quantity and one of CartItemId (which cab be found in `cartGet` responses).

**responseGroup**: You can use multiple values by separating them with comma (e.g `responseGroup: 'MostGifted,NewReleases,MostWishedFor,TopSellers'`). Defaults to 'Cart'

Credits: (amazon-affiliate-api is a shameless ripoff of t3chnoboys's original work [amazon-product-api](github.com/t3chnoboy/amazon-product-api))
