/**
 * Created by jpsantos on 21/07/14.
 */
angular.module('auth0.UserService', [])
    .factory('UserService', function ($q, $http, auth) {
        var service = {
            _user: null,
            _targetClientId: 'vzlgoiuJkmXHW8pPcd4DOeR45BQPSo9I',
            _role: 'arn:aws:iam::331375578265:role/sgpapp-user-role',
            _principal: 'arn:aws:iam::331375578265:saml-provider/auth0-provider',
            currentUser: function () {
                var d = $q.defer();
                if (!service._user) {
                    service._user = auth.profile;
                }

                d.resolve(service._user);

                return d.promise;
            },
            awsCredentials: function() {
                var d = $q.defer();
                service.currentUser().then(function (user_profile){

                    auth.getToken(service._targetClientId,{role: service._role, principal: service._principal }).then(
                        function (delegationResult){
                            d.resolve(delegationResult.Credentials);
                        });



                });

                return d.promise;

            }
        }
        return service;
    });