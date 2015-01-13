Soud.controller('homeController', ['$scope', '$sce', function($scope, $sce) {
  $scope.activities_all = [];
  $scope.activities_uploaded = [];
  $scope.activities = $scope.activities_all;
  $scope.limit = 10;
  $scope.next_href;

  $scope.showUploaded = function() {
    $scope.activities = $scope.activities_uploaded;
  };

  $scope.showAll = function() {
    $scope.activities = $scope.activities_all;
  };

  $scope.nextPage = function() {
    $scope.getPage($scope.next_href);
  };

  $scope.getPage = function(url) {
    SC.get(url, { limit: $scope.limit, linked_partitioning: 1 }, function(activities) {
      $scope.next_href = activities.next_href;

      activities.collection.forEach(function(activity) {
        var options = {auto_play: false, maxheight: 166, iframe: true, color: 'ff5500'};

        if( activity.type.indexOf('playlist') > -1 )
          options.maxheight = 300;

        SC.oEmbed(activity.origin.uri, options, function(oEmbed) {
          activity.html = $sce.trustAsHtml(oEmbed.html.replace('visual=true&',''));
          $scope.activities_all.push(activity);
          $scope.$apply();

          if(activity.type.indexOf('repost') == -1) {
            $scope.activities_uploaded.push(activity);
          }
        });

        $scope.offset += $scope.limit;
      });
    });   
  };

  initialize();

  function initialize() {
    soud_token = localStorage.getItem('soud_token');

    if( soud_token ) {
      // initialize client with app credentials
      SC.initialize({
        client_id: '0077bed51718f820d539b0d39869faaf',
        redirect_uri: 'http://localhost/soud/callback.html',
        access_token: soud_token,
      });
   
      $scope.getPage('/me/activities');
    }
    else {
      // initialize client with app credentials
      SC.initialize({
        client_id: '0077bed51718f820d539b0d39869faaf',
        redirect_uri: 'http://localhost/soud/callback.html'
      });

      // initiate auth popup
      SC.connect(function() {
        SC.get('/me', function(me) {
          var sound_token = console.log(localStorage.getItem('soud_token'));
          var user = me.username;
        });
      });
    };
  };
}]);
