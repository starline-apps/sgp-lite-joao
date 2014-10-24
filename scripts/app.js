/**
 * Created by jpsantos on 02/07/14.
 */
angular.module('sgpLight', [
    'ngRoute',
    'ngSanitize',
    'ngCkeditor',
    'auth0',
    'auth0.UserService',
    'auth0.AWSService',
    'sgpLight.services',
    'sgpLight.directives',
    'ngTagsInput',
    'cgBusy',
    'ngDialog'
])
.config(function(authProvider, $routeProvider, $httpProvider) {

  authProvider.init({
        domain: 'starline.auth0.com',
        clientID: 'vzlgoiuJkmXHW8pPcd4DOeR45BQPSo9I',
        callbackURL: location.href,
        loginUrl: '/login'
  });

  $httpProvider.interceptors.push('authInterceptor');


  $routeProvider.when('/login', {
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
  .when('/', {
    controller: 'UserProfileCtrl',
    templateUrl: 'templates/profile.html',
    requiresLogin: true
  }).when('/user', {
    controller: 'UserProfileCtrl',
    templateUrl: 'templates/profile.html',
    requiresLogin: true
  })
  .when('/class/:klassId?', {
    controller: 'KlassPageCtrl',
    templateUrl: 'templates/klass_page.html',
    requiresLogin: true
  })
  .when('/exam/:examId/print', {
    controller: 'PrintCtrl',
    templateUrl: 'templates/print.html',
    requiresLogin: true
  })
  .when('/exam/:bucket?/:examId?', {
    controller: 'MainCtrl',
    templateUrl: 'templates/exam_page.html',
    requiresLogin: true
  })
  .when('/userexams', {
    controller: 'UserExamsCtrl',
    templateUrl: 'templates/userexams.html',
    requiresLogin: true
  })
  .when('/userclasses', {
    controller: 'UserKlassesCtrl',
    templateUrl: 'templates/userklasses.html',
    requiresLogin: true
  })
  .otherwise({
    redirectTo: '/'
  });
})
.run(function(auth) {
  auth.hookEvents();
});;
