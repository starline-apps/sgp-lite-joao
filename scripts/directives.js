/**
 * Created by jpsantos on 02/07/14.
 */
angular.module('sgpLight.directives', [])
    .directive('googleSignin', function() {
  return {
    restrict: 'A',
    template: '<span id="signinButton"></span>',
    replace: true,
    scope: {
      afterSignin: '&'
    },
    link: function(scope, ele, attrs) {
      // Set standard google class
      attrs.$set('class', 'g-signin');
      // Set the clientid
      attrs.$set('data-clientid',
          attrs.clientId+'.apps.googleusercontent.com');
      // build scope urls
      var scopes = attrs.scopes || [
        'auth/plus.login',
        'auth/userinfo.email'
      ];
      var scopeUrls = [];
      for (var i = 0; i < scopes.length; i++) {
        scopeUrls.push('https://www.googleapis.com/' + scopes[i]);
      };

      // Create a custom callback method
      var callbackId = "_googleSigninCallback",
          directiveScope = scope;
      window[callbackId] = function() {
        var oauth = arguments[0];
        directiveScope.afterSignin({oauth: oauth});
        window[callbackId] = null;
      };

      // Set standard google signin button settings
      attrs.$set('data-callback', callbackId);
      attrs.$set('data-cookiepolicy', 'single_host_origin');
      attrs.$set('data-requestvisibleactions', 'http://schemas.google.com/AddActivity')
      attrs.$set('data-scope', scopeUrls.join(' '));

      // Finally, reload the client library to
      // force the button to be painted in the browser
      (function() {
       var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
       po.src = 'https://apis.google.com/js/client:plusone.js';
       var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
      })();
    }
  }
})
.directive('klass', function(){
    return {
        restrict: 'A',
        templateUrl: 'templates/klass.html',
        scope: {
            klassid: '='
        },
        controller: function ($scope, UtilService, RepoService, UserService) {

            var initial_student = function() {
                return {
                    guid: null,
                    name: null,
                    code: null,
                    email: null
                }
            }

            var get_klass = function(klassID) {
                if(!klassID) {
                    $scope.klass = {
                        guid: null,
                        name: null,
                        students: [
                            initial_student()
                        ]
                    }
                } else {

                    RepoService.getKlass(klassID).then(function (klass) {
                        $scope.klass = klass;
                    });
                }
            }

            get_klass($scope.klassid);

            $scope.addStudent = function() {
                $scope.klass.students.push(initial_student());
            }

            $scope.delStudent = function(index) {
                $scope.klass.students.splice(index, 1);

                //Para não ficar vazio
                if($scope.klass.students.length<1) {
                    $scope.klass.students.push(initial_student());
                }
            }

            $scope.save = function() {
                if(!$scope.klass.guid) {
                    $scope.klass.guid = UtilService.genenerateUUID();
                }
                for(var i=0; i< $scope.klass.students.length; i++) {
                    if(!$scope.klass.students[i].guid) {
                        $scope.klass.students[i].guid = UtilService.genenerateUUID();
                    }
                }
                RepoService.saveKlassDetails($scope.klass);
            }

        }
    }
})
.directive('student', function(){
    return {
        restrict: 'A',
        templateUrl: 'templates/student.html',
        replace: true,
        scope: {
            student: '=',
            num: '=',
            remove: '&onDelete'
        },
        controller: function ($scope) {

        }
    }
})
.directive('questioneditor', function() {
    return {
        restrict: 'A',
        templateUrl: 'templates/question.html',
        scope: {
            number: '=',
            question: '=',
            points: '=',
            final: '='
        },
        controller: function($scope){

            $scope.editorOptions = {
                language: 'pt-br',
                toolbar: 'Full',
                height: '90px'
            };

            $scope.modelChange = function() {
                $scope.question.synced = false;

            }

            $scope.$watch('question.factor', function(newVal, oldVal){
                if($scope.points > 0) {
                    if((newVal == oldVal) && (newVal==1)) {
                        $scope.points += 1;
                    } else {
                        $scope.points = ($scope.points - oldVal) + newVal;
                    }
                } else {
                    $scope.points = newVal;
                }
            });

        },
        replace:true

    };
})
.directive('exameditor', function(){
    return {
        restrict: 'A',
        templateUrl: 'templates/exam.html',
        scope: {
            examid: "="
        },
        controller: function($scope, $location, $anchorScroll, UserService, RepoService, UtilService) {

            $scope.promise = null;

            var initial_question = function() {
                return {
                    guid: null,
                    url: null,
                    synced: false,
                    url: null,
                    command: null,
                    type: 'o',
                    factor: 1,
                    rational: null,
                    tags: [' '],
                    alternatives: [
                        {
                            guid: null,
                            order: 0,
                            is_correct: false,
                            text: null,
                            rational: null
                        },
                        {
                            guid: null,
                            order: 1,
                            is_correct: false,
                            text: null,
                            rational: null
                        },
                        {
                            guid: null,
                            order: 2,
                            is_correct: false,
                            text: null,
                            rational: null
                        },
                        {
                            guid: null,
                            order: 3,
                            is_correct: false,
                            text: null,
                            rational: null
                        },
                        {
                            guid: null,
                            order: 4,
                            is_correct: false,
                            text: null,
                            rational: null
                        }
                    ]
                }
            }

            var get_user_schools = function() {
                    RepoService.getUserSchools().then(function (schools){
                        $scope.schools = [];
                        for(var i=0;i<schools.length;i++) {
                            $scope.schools.push({name:schools[i]});
                        }
                    });
            }

            get_user_schools();

            var get_exam = function(examId) {
                if(examId) {

                    $scope.promise = RepoService.loadExam(examId);


                    $scope.promise.then(function(exam) {
                        $scope.exam = exam;
                    });

                } else {
                    $scope.exam = {
                        name: null,
                        school: null,
                        subject: null,
                        tags: null,
                        guid: null,
                        url: null,
                        points: 0,
                        published: false,
                        questions: [
                            initial_question()
                        ]
                    }
                }
                $scope.$emit('newQuestion');
            }



            var updateQuestionStorage = function() {

                for(var i = 0; i < $scope.exam.questions.length; i++) {

                    each_question = $scope.exam.questions[i];

                    if(!each_question.synced) {


                        //Setando identificadores unicos
                        if(!each_question.guid) {
                                each_question.guid = UtilService.genenerateUUID();
                        }
                        for(var alt_i = 0; alt_i < each_question.alternatives.length; alt_i++) {
                            if(!each_question.alternatives[alt_i].guid) {
                                each_question.alternatives[alt_i].guid = UtilService.genenerateUUID();
                            }
                        }

                        RepoService.storeItemAsFile(each_question).then(function(url) {
                            each_question.url = UtilService.getNotSignedUrl(url);
                            each_question.synced = true;
                        });

                    }
                }

                //TODO A geracao das URL eh assyncrona o save nao aguarda então ficam coisas sem url

            }

            $scope.addQuestion = function() {
                updateQuestionStorage();
                $scope.exam.questions.push(initial_question());
                $scope.$emit('newQuestion');
            }

            $scope.$on('newQuestion', function() {
                $location.hash('lastQuestion');
                $anchorScroll();
            });



            $scope.delQuestion = function(index) {
                //TODO vai precisar remover da persistencia tambem
                $scope.exam.questions.splice(index, 1);

                //Para não ficar vazio
                if($scope.exam.questions.length<1) {
                    $scope.exam.questions.push(initial_question());
                }
            }

            $scope.saveExam = function() {
                $scope.promise = RepoService.storeExam($scope.exam);
            }

            $scope.publish = function() {
                var keys = {
                    guid: $scope.exam.guid,
                    name: $scope.exam.name,
                    keys: []
                }

                for(var i=0; i<$scope.exam.questions.length;i++) {
                    var marks = [];
                    for(var j=0; j<$scope.exam.questions[i].alternatives.length;j++) {
                        marks.push($scope.exam.questions[i].alternatives[j].is_correct);
                    }
                    keys.keys.push(marks);
                }

                RepoService.storeKeys(keys);

            }

            get_exam($scope.examid);

        }
    };
});