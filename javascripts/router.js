Soud = angular.module('Soud', ['ui.router'] );  

Soud.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/home");

  // Now set up the states
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: 'templates/home.html',
      controller: 'homeController as home_controller'
    })
}]);
