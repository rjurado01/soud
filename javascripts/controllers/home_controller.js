Soud.controller('homeController', ['$scope', '$sce', function($scope, $sce) {
  $scope.activities = [];
  $scope.widgets = [];
  $scope.limit = 10;
  $scope.next_href;
  $scope.filter = 'uploaded';

  /*
   * Reset activities list and show new selected activities
   */
  $scope.showActivities = function(filter) {
    if( filter != $scope.filter ) {
      $scope.filter = filter;

      // reset all
      $scope.activities = [];
      $scope.widgets = [];

      // get first page
      getPage('/me/activities');
    }
  };

  /*
   * Get next page of activities
   */
  $scope.nextPage = function() {
    getPage($scope.next_href);
  };

  /*
   * Request the API page for this url and add activities to list
   */
  function getPage(url) {
    SC.get(url, { limit: $scope.limit, linked_partitioning: 1 }, function(activities) {
      $scope.next_href = activities.next_href;
      addActivities( filterActivities(activities.collection) );
    });
  };

  /*
   * Remove first activity from array, add it to page and create widget for it.
   * If array isn't empty, call this function with it again
   */
  function addActivities(activities) {
    var activity = activities.shift();
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
      activity.widget = SC.Widget(iframe);

      // add auto play when previous track end
      addNextAutoPlay(activity);

      if( activities.length > 0 ) {
        // proccess next activity
        addActivities(activities);
      }
      else {
        // get next page
        activity.widget.bind(SC.Widget.Events.PLAY, function(){
          $scope.nextPage();
        });
      }
    });
  };

  /*
   * Filter and return activities
   */
  function filterActivities(activities) {
    switch($scope.filter) {
      case 'uploaded':
        return activities.filter(function(activity){
          return activity.type.indexOf('repost') == -1 && activity.type.indexOf('playlist') == -1
        });
      case 'repost':
        return activities.filter(function(activity){
          return activity.type.indexOf('repost') > -1 && activity.type.indexOf('playlist') == -1
        });
    };

    return activities;
  };

  /*
   * Add event to previout activity when it ends for play next track
   */
  function addNextAutoPlay(activity) {
    var index = $scope.activities.indexOf(activity);

    // Check if this is the first activity
    if( index > 0 ) {
      var previous_activity = $scope.activities[index - 1];

      if( previous_activity ) {
        previous_activity.widget.bind(SC.Widget.Events.FINISH, function(){
          setTimeout(function(){
            // reload previous activity to remove "recommended tracks"
            previous_activity.widget.load(previous_activity.origin.uri);

            // play previous activity
            activity.widget.play();
          }, 500);
        });
      }
    }
  };

  initialize();

  function initialize() {
    // get soud_token (remember previous login)
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
        getPage('/me/activities');
      });
    };
  };
}]);
