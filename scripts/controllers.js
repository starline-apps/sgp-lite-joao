/**
 * Created by jpsantos on 02/07/14.
 */
angular.module('sgpLight')
.controller('LoginCtrl', function($scope, $location, auth){

        $scope.login = function() {
            auth.signin({
                popup: true
            }).then(function() {
                $location.path('/exam');
            }, function() {
                // Error callback
            });
        }

})
.controller('MainCtrl', function($scope, UserService, $route, $routeParams, auth) {

    $scope.route = $route;
    $scope.params = $routeParams;
    $scope.menu_url = 'templates/side_menu.html';
    $scope.top_url = 'templates/top_menu.html';
    $scope.signedIn = function(oauth) {
      UserService.setCurrentUser(oauth)
      .then(function(user) {
        $scope.user = user;
      });
    }

    $scope.logout = function() {
        auth.signout();
    }

    UserService.currentUser().then(function (user){
        $scope.user = user;
    });
})
.controller('PrintCtrl', function($scope, UserService, RepoService, $route, $routeParams, $sanitize, $sce, auth) {
    $scope.menu_url = 'templates/side_menu.html';
    $scope.top_url = 'templates/top_menu.html';
    $scope.route = $route;
    $scope.params = $routeParams;

    UserService.currentUser().then(function (user){
        $scope.user = user;
    });
    $scope.logout = function() {
        auth.signout();
    }
    $scope.printDiv = function(divName) {
        var printContents = document.getElementById(divName).innerHTML;
        var originalContents = document.body.innerHTML;
        var popupWin = window.open('', '_blank', 'width=300,height=300');
        popupWin.document.open()
        popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + printContents + '</html>');
        popupWin.document.close();
    }


    var getExam = function() {
        if($scope.params.examId) {
            var examId = $scope.params.examId;
            RepoService.loadExam(examId).then(function(exam) {
                $scope.exam = exam;
                for(var i=0;i<$scope.exam.questions.length;i++) {
                    $scope.exam.questions[i].command = $sce.trustAsHtml($scope.exam.questions[i].command);
                }
            });
        }
    }

    getExam();

})
.controller('UserExamsCtrl', function($scope, UserService, RepoService, UtilService, auth){

    $scope.menu_url = 'templates/side_menu.html';
    $scope.top_url = 'templates/top_menu.html';
    UserService.currentUser().then(function (user){
        $scope.user = user;
    });
    $scope.logout = function() {
        auth.signout();
    }
    var getUserExams = function() {

        RepoService.getExams().then(function (exams) {
            $scope.exams = exams;
        });

    }

    getUserExams();

    $scope.getExamId = function(index) {
        var exam = $scope.exams[index];
        var examUrl =  UtilService.getKeyFromUrl(exam.url);

        return examUrl;


    }


})
.controller('KlassPageCtrl', function($scope, $route, $routeParams, UserService, auth){
    $scope.route = $route;
    $scope.params = $routeParams;
    $scope.menu_url = 'templates/side_menu.html';
    $scope.top_url = 'templates/top_menu.html';
        UserService.currentUser().then(function (user){
        $scope.user = user;
    });
    $scope.logout = function() {
        auth.signout();
    }
    $scope.getKlassId = function () {
        if($scope.params.klassId) {
            return $scope.params.klassId;
        }
        return null;
    }



})
.controller('UserKlassesCtrl', function($scope, RepoService, UserService, auth){

     $scope.menu_url = 'templates/side_menu.html';
     $scope.top_url = 'templates/top_menu.html';
     UserService.currentUser().then(function (user){
        $scope.user = user;
    });
    $scope.logout = function() {
        auth.signout();
    }
     var getKlasses = function() {
         RepoService.getKlasses().then(function (klasses){
             $scope.klasses = klasses;
         });
     }

     getKlasses();


})
.controller('ExamModalCtrl', function($scope, ngDialog){


})
.controller('UserProfileCtrl', function($scope, RepoService, UserService, auth){
     $scope.menu_url = 'templates/side_menu.html';
     $scope.top_url = 'templates/top_menu.html';
     UserService.currentUser().then(function (user){
        $scope.user = user;
    });
    $scope.logout = function() {
        auth.signout();
    }
    $scope.schools = [];
    $scope.newSchools = null;

    var loadSchools = function() {
        RepoService.getUserSchools().then(function (schools){
            $scope.schools = schools;
        });
    }

    $scope.addSchool = function addSchool() {

        $scope.schools.push($scope.newSchools);
        $scope.newSchools = null;
        RepoService.saveUserSchools($scope.schools);
    }

    $scope.delSchools = function delSchool(index) {

        $scope.schools.splice(index,1);
        RepoService.saveUserSchools($scope.schools);

    }

    loadSchools();

})
.controller('TypeaheadController', function($scope, JSTagsCollection){

    $scope.tags = new JSTagsCollection();

    $scope.jsTagOptions = {
        'tags': $scope.tags
    };

    var suggestions = ['fácil', 'média', 'difíciul'];

    suggestions = suggestions.map(function(item) { return { "suggestion": item } });

    var suggestions = new Bloodhound({
        datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.suggestion); },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: suggestions
    });

    suggestions.initialize();

    $scope.exampleData = {
        displayKey: 'suggestion',
        source: suggestions.ttAdapter()
    };

    $scope.exampleOptions = {
        hint: false,
        highlight: true
    };

});