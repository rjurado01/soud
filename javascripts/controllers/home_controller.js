Soud.controller('homeController', ['$scope', '$sce', function($scope, $sce) {
  $scope.activities = [];
  $scope.widgets = [];
  $scope.limit = 10;
  $scope.next_href;
  $scope.filter = 'uploaded';
  $scope.play = false;

  $scope.showUploaded = function() {
    $scope.activities = $scope.activities_uploaded;
    $scope.filter = 'uploaded';

    // reset all
    $scope.activities = [];
    $scope.widgets = [];

    // get first page
    getPage('/me/activities');
  };

  $scope.showAll = function() {
    $scope.activities = $scope.activities;
    $scope.filter = 'all';

    // reset all
    $scope.filter = 'all';
    $scope.activities = [];

    // get first page
    getPage('/me/activities');
  };

  $scope.nextPage = function() {
    getPage($scope.next_href);
  };

  function getPage(url) {
    SC.get(url, { limit: $scope.limit, linked_partitioning: 1 }, function(activities) {
      $scope.next_href = activities.next_href;
      addActivities(activities.collection);
    });
  };

  function addActivities(activities) {
    var activity = activities.shift();

    if( $scope.filter == 'all' || activity.type.indexOf('repost') == -1 ) {
      var options = {auto_play: false, maxheight: 166, iframe: true, color: 'ff5500'};

      if( activity.type.indexOf('playlist') > -1 )
        options.maxheight = 300;

      // get embeded code
      SC.oEmbed(activity.origin.uri, options, function(oEmbed) {
        // add html to page
        activity.html = $sce.trustAsHtml(oEmbed.html.replace('visual=true&',''));
        $scope.activities.push(activity);
        $scope.$apply();

        // create widget
        var iframe = document.getElementById(activity.origin.id).querySelector('iframe');
        var widget = SC.Widget(iframe);
        var previous_width = $scope.widgets[$scope.widgets.length-1];

        if( previous_width ) {
          previous_width.bind(SC.Widget.Events.FINISH, function(){
            widget.play();
          });
        }

        if( $scope.play ) {
          $scope.play = false;

          setTimeout(function() {
            widget.play();
          }, 1000);
        }

        activity.widget = widget;
        $scope.widgets.push(widget);

        // proccess next activity
        if( activities.length > 0 ) {
          addActivities(activities);
        }
        else {
          widget.bind(SC.Widget.Events.FINISH, function(){
            $scope.nextPage();
            $scope.play = true;
          });
        }
      });
    }
    else if( activities.length > 0 ) {
      addActivities(activities);
    };
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

      getPage('/me/activities');
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
          var sound_token = localStorage.getItem('soud_token');
          var user = me.username;
        });
      });
    };
  };
}]);
