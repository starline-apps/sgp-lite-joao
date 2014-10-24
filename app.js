/**
 * Created by jpsantos on 21/07/14.
 */
angular.module('testApp', ['auth0'])
    .config(function (authProvider){

        authProvider.init({
            domain: 'jps.auth0.com',
            clientID: 'qVHp4hHwzfUSUgj6HEwh55C9bQodpT5F',
            callbackURL: location.href,
            dict: 'pt-BR'
        })
    })
    .config(function (authProvider, $routeProvider, $httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
    })
    .run(function(auth){
        auth.hookEvents();
    })
    .controller('MyCtrl', function($scope, auth){

                $scope.login = function() {
                    auth.signin({popup:true}).then(function(){

                    })
                }

                $scope.logout = function() {
                    auth.signout();
                }
    })