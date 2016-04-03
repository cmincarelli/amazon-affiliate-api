(function() {
  'use strict';

  angular.module('affiliateApp', ['ui.router','ngCookies'])

  .config(function($stateProvider, $urlRouterProvider) {

      $urlRouterProvider.otherwise('/search');

      $stateProvider
          .state('app', {
            abstract: true,
            templateUrl: 'views/app.html',
            controller: 'AppCtrl'
          })
          .state('app.search', {
            url: '/search',
            templateUrl: 'views/search.html',
            controller: 'SearchCtrl'
          })
          .state('app.product', {
            url: '/product/:asin',
            templateUrl: 'views/product.html',
            controller: 'ProductCtrl'
          })
  })

  .controller('AppCtrl', function ($scope, $state, $cookies, $http) {
    $scope.cart =  {
      CartItems: {
        CartItem: []
      },
      SubTotal: {
        Amount: "0",
        CurrentcyCode: "USD",
        FormattedPrice: "$0.00"
      }
    };

    var cookieCartId = $cookies.get('cartId');
    if('undefined' !== typeof cookieCartId){
      $http({
        method: 'GET',
        url: '/api/cart/' + cookieCartId
      }).then(function(results){
        var data = results.data;
        $scope.cart = data.Cart;
      }).catch(function(err){
        $cookies.remove('cartId');
      });
    }

    $scope.buy = function(asin){
      var cookieCartId = $cookies.get('cartId');
      if('undefined' === typeof cookieCartId){
        $http({
          method: 'POST',
          url: '/api/cart',
          data: {
            ASIN: asin,
            Quantity: 1
          }
        }).then(function(results){
          var data = results.data;
          $cookies.put('cartId', data.Cart.CartId);
          $scope.cart = data.Cart;
        }).catch(function(err){

        });
      } else {
        $http({
          method: 'PUT',
          url: '/api/cart/' + cookieCartId,
          data: {
            ASIN: asin,
            Quantity: 1
          }
        }).then(function(results){
          var data = results.data;
          $scope.cart = data.Cart;
        }).catch(function(err){

        });
      }

    }
  })

  .controller('SearchCtrl', function ($scope, $state, $cookies, $http) {
    $scope.searchTerm = '';
    $scope.searchResults = [];

    $scope.go = function(asin){
      $state.go('app.product',{asin: asin});
    }

    $scope.search = function(event) {
      event.preventDefault();
      $http({
        method: 'GET',
        url: '/api/search',
        params: {
          q: $scope.searchTerm
        }
      }).then(function(results){
        var data = results.data;
        $scope.searchResults = _.chunk(data.Items.Item, 3);
      }).catch(function(err){

      });
    }
  })

  .controller('ProductCtrl', function ($scope, $state, $stateParams, $cookies, $http) {
    $scope.asin = $stateParams.asin;
    $scope.item = {};

    $http({
      method: 'GET',
      url: '/api/product/' + $scope.asin,
    }).then(function(results){
      var data = results.data;
      $scope.item = data.Items.Item[0];
    }).catch(function(err){

    });

  });

}).call(this);


