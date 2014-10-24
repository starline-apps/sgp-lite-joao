/**
 * Created by jpsantos on 02/07/14.
 */
angular.module('sgpLight.services', [])
.factory('UtilService', function($q) {
    var service = {
        genenerateUUID: function() {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c=='x' ? r : (r&0x7|0x8)).toString(16);
            });
            return uuid;
        },
        getNotSignedUrl: function(url) {
            var p = document.createElement('a');
            p.href = url;
            var ret_url = p.protocol+'//'+ p.hostname+ p.pathname;

            return ret_url;
        },
        getKeyFromUrl: function(url) {
            var p = document.createElement('a');
            p.href = url;
            var ret = p.pathname;
            return ret;
        }
    }
    return service;
})
.factory('RepoService', function($q, $http, UserService, AWSService, UtilService) {
  var service = {
    _user: null,
    UsersTable: "Users",
    UserItemsTable: "UsersItems",
    UserExamsTable: "UserExams",
    UserKlassTable: "UserClasses",
    UserShollsTable: "UserSchools",
    UserKeysTable: "UserKeys",
    getUser: function() {
      var d = $q.defer();
      if (service._user) {
        d.resolve(service._user);
      } else {
        // After we've loaded the credentials
        AWSService.credentials().then(function() {
            var email = UserService.currentUser();
            // Get the dynamo instance for the
            // UsersTable
            AWSService.dynamo({
              params: {TableName: service.UsersTable}
            })
            .then(function(table) {
              // find the user by email
              table.getItem({
                Key: {'User email': {S: email}}
              }, function(err, data) {
                if (!err) {

                  if (Object.keys(data).length == 0) {
                      // User didn't previously exist
                      // so create an entry
                      var itemParams = {
                          Item: {
                              'User email': {S: email},
                              data: { S: JSON.stringify(e) }
                          }
                      };
                      table.putItem(itemParams,
                          function (err, data) {
                              service._user = e;
                              d.resolve(e);
                          });
                  } else {
                      // The user already exists
                      service._user =
                          JSON.parse(data.Item.data.S);
                      d.resolve(service._user);
                  }
                } else {
                    d.reject(err);
                }
              });
            });
          });
        }

      return d.promise;
    },
      Bucket: 'sgpapp.users',
      storeItemAsFile: function(itemObject) {
        var d = $q.defer();
        UserService.currentUser().then(function(user){
            AWSService.s3({params: {Bucket: service.Bucket }}).then(function(s3){
                var params = {
                    Key: itemObject.guid+'.json',
                    Body: angular.toJson(itemObject),
                    ContentType: 'application/json'
                };
                s3.putObject(params, function(err, data){
                    if(!err) {
                        var params = {
                          Bucket: service.Bucket,
                          Key: itemObject.guid+'.json',
                          Expires: 900*4
                        };
                        s3.getSignedUrl('getObject', params, function(err, url){
                            if(!err) {
                                d.resolve(url);
                            } else {
                                d.reject(err);
                            }
                        });
                    } else {
                        d.reject(err);
                    }
                });
            });
        });
        return d.promise;
      },
      saveUserSchools: function(schools) {
          var d = $q.defer();
          UserService.currentUser().then(function(user) {
              AWSService.dynamo({params: {TableName: service.UserShollsTable}
              }).then(function (table) {
                  var itemParams =  {
                    Item: {
                        'User email': {S: user.email},
                        data: {
                            S: angular.toJson(schools)
                        }
                    }
                  }

                  table.putItem(itemParams, function(err, data) {
                    d.resolve(data);
                  });
              });
          });

      },
      getUserSchools: function() {
        var d = $q.defer();
        UserService.currentUser().then(function(user){
            AWSService.dynamo({params: {TableName: service.UserShollsTable}}).then(function(table){
                table.query({TableName: service.UserShollsTable,
                             KeyConditions: {
                                 "User email": {
                                     "ComparisonOperator": "EQ",
                                     "AttributeValueList": [{S: user.email}]
                                 }
                             }
                }, function(err, data) {
                    var items = [];
                    if(data) {
                        angular.forEach(data.Items, function(item) {
                            var objs = JSON.parse(item.data.S);
                            for(var i=0;i<objs.length;i++) {
                                items.push(objs[i]);
                            }
                        });
                        d.resolve(items);
                    } else {
                        d.reject(err);
                    }

                });
            });
        });
        return d.promise;
    },
      saveKlassDetails: function(klass) {
        var d = $q.defer();
        UserService.currentUser().then(function(user) {
            AWSService.dynamo({params: {TableName: service.UserKlassTable}
            }).then(function(table){
                var itemParams = {
                    Item: {
                        'guid': {S: klass.guid},
                        'User email': {S: user.email},
                        data: {
                            S: angular.toJson(klass)
                        }
                    }
                }
                table.putItem(itemParams, function(err, data) {
                    d.resolve(data);
                });
            });
        });
        return d.promise;
      },
      saveExamDetais: function(exam) {
        var d = $q.defer();
        UserService.currentUser().then(function(user) {
            AWSService.dynamo({
                params: {TableName: service.UserExamsTable}
            }).then(function(table) {
                var itemParams = {
                    Item: {
                        'guid': {S: exam.guid},
                        'User email': {S: user.email},
                        data: {
                           S: JSON.stringify({
                              url: exam.url,
                              name: exam.name,
                              published: exam.published,
                              points: exam.points,
                              questions: exam.questions.length
                           })
                        }
                    }
                };

                table.putItem(itemParams, function(err, data) {
                    d.resolve(data);
                });
            });
        });
      return d.promise;
    },
    storeKeys: function(keys) {
        var d = $q.defer();

        UserService.currentUser().then(function(user){
            AWSService.dynamo({
                params: {TableName: service.UserKeysTable}
            }).then(function(table){
                var itemParams = {
                     Item: {
                        'guid': {S: keys.guid},
                        'User email': {S: user.email},
                        data: {
                           S: JSON.stringify(keys)
                        }
                    }
                }

                table.putItem(itemParams, function(err, data){
                    d.resolve(data);
                });

            });
        });

        return d.promise;
    },
    storeExam: function(exam) {
        var d = $q.defer();

        var store_question = function (index, questions) {

            each_question = questions[index];

            if (!each_question.synced) {
                //Setando identificadores unicos
                if (!each_question.guid) {
                    each_question.guid = UtilService.genenerateUUID();
                }
                for (var alt_i = 0; alt_i < each_question.alternatives.length; alt_i++) {
                    if (!each_question.alternatives[alt_i].guid) {
                        each_question.alternatives[alt_i].guid = UtilService.genenerateUUID();
                    }
                }

                index++;

                service.storeItemAsFile(each_question).then(function (url) {
                    each_question.url = UtilService.getNotSignedUrl(url);
                    each_question.synced = true;


                    if(index < questions.length) {
                        store_question(index, questions);
                    } else {
                        if (!exam.guid) {
                            exam.guid = UtilService.genenerateUUID();
                        }

                        var simple_exam = angular.copy(exam);
                        for (var i = 0; i < simple_exam.questions.length; i++) {
                            alt = simple_exam.questions[i];
                            simple_exam.questions[i] = alt.url;
                        }

                        service.storeItemAsFile(simple_exam).then(function (url) {
                            exam.url = UtilService.getNotSignedUrl(url);
                            service.saveExamDetais(exam).then(function (data) {
                                d.resolve(data);
                            });
                        });
                    }
                });


            } else {
              index++;
              if(index < questions.length) {
                 store_question(index, questions);
              } else {
                  if (!exam.guid) {
                      exam.guid = UtilService.genenerateUUID();
                  }

                  var simple_exam = angular.copy(exam);
                  for (var i = 0; i < simple_exam.questions.length; i++) {
                      alt = simple_exam.questions[i];
                      simple_exam.questions[i] = alt.url;
                  }

                  service.storeItemAsFile(simple_exam).then(function (url) {
                      exam.url = UtilService.getNotSignedUrl(url);
                      service.saveExamDetais(exam).then(function (data) {
                          d.resolve(data);
                      });
                  });

              }
            }
        }

        store_question(0, exam.questions);

        return d.promise;
    },
    loadExam: function(examID) {

        var clean_object_key = function (key, bucket) {
            var key_arrary = null;
            key_arrary = key.split('/');

            if(key_arrary[0]=="") {
              key_arrary.splice(0,1);
            }

            if(key_arrary[0] == bucket) {
                key_arrary.splice(0,1);
            }

            return key_arrary.join('/');


        }


        var d = $q.defer();
        UserService.currentUser().then(function(user) {
            AWSService.s3({params: {Bucket: service.Bucket }}).then(function (s3) {



                var params = {
                    Bucket: service.Bucket,
                    Key: clean_object_key(examID, service.Bucket),
                    ResponseContentType: 'application/json'
                }
                s3.getObject(params, function (err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else {
                        var str = data.Body.toString();
                        var object = angular.fromJson(str);

                        var load_questions = function (index, questions) {
                            if (index < questions.length) {
                                AWSService.s3({params: {Bucket: service.Bucket}}).then(function (s3) {
                                    var key_value = UtilService.getKeyFromUrl(questions[index]);
                                    key_value = key_value.substring(1);
                                    var params = {
                                        Bucket: service.Bucket,
                                        Key: clean_object_key(key_value, service.Bucket)
                                    }
                                    s3.getObject(params, function (err, data) {
                                        if (err) console.log(err, err.stack);
                                        else {
                                            questions[index] = angular.fromJson(data.Body.toString());
                                            index++;
                                            load_questions(index, questions);
                                        }
                                    });
                                });
                            } else {
                                d.resolve(object);
                            }
                        }

                        load_questions(0, object.questions);

                    }
                    ;
                });
            });
        });

        return d.promise;
    },
    getKlasses: function() {
        var d = $q.defer();
        UserService.currentUser().then(function(user){
            AWSService.dynamo({params: {TableName: service.UserKlassTable}}).then(function(table){
                table.query({TableName: service.UserKlassTable,
                             KeyConditions: {
                                 "User email": {
                                     "ComparisonOperator": "EQ",
                                     "AttributeValueList": [{S: user.email}]
                                 }
                             }
                }, function(err, data) {
                    var items = [];
                    if(data) {
                        angular.forEach(data.Items, function(item) {
                            items.push(JSON.parse(item.data.S));
                        });
                        d.resolve(items);
                    } else {
                        d.reject(err);
                    }

                });
            });
        });
        return d.promise;
    },
    getKlass: function(klassId) {
        var d = $q.defer();
        UserService.currentUser().then(function(user){
            AWSService.dynamo({params: {TableName: service.UserKlassTable}}).then(function(table){
                table.query({TableName: service.UserKlassTable,
                             KeyConditions: {
                                 "User email": {
                                     "ComparisonOperator": "EQ",
                                     "AttributeValueList": [{S: user.email}]
                                 },
                                 "guid": {
                                     "ComparisonOperator": "EQ",
                                     "AttributeValueList": [{S: klassId}]
                                 }
                             }
                }, function(err, data) {
                    var ret = null;
                    if(data) {
                        angular.forEach(data.Items, function(item) {
                            ret = angular.fromJson(item.data.S);
                        });
                        d.resolve(ret);
                    } else {
                        d.reject(err);
                    }

                });
            });
        });
        return d.promise;
    },
    getExams: function() {
        var d = $q.defer();
        UserService.currentUser().then(function(user) {
            AWSService.dynamo({
                params: {TableName: service.UserExamsTable}
            }).then(function(table) {
                table.query({
                    TableName: service.UserExamsTable,
                    KeyConditions: {
                        "User email": {
                            "ComparisonOperator": "EQ",
                            "AttributeValueList": [
                                {S: user.email}
                            ]
                        }
                    }
                }, function(err, data) {
                    var items = [];
                    if (data) {
                        angular.forEach(data.Items, function(item) {
                            items.push(JSON.parse(item.data.S));
                        });
                        d.resolve(items);
                    } else {
                        d.reject(err);
                    }
                })
            });
        });
    return d.promise;
}


  };
  return service;
})