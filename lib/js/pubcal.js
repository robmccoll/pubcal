var pubcal = angular.module('pubcal', ['firebase']);

function PubCalController($scope, angularFire) {
  $scope.events = [];
  var ref = new Firebase(firebase_url);
  angularFire(ref, $scope, "events");

  var monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  var monthAbrevs = [
    "Jan", "Feb", "Mar", "Apr", "May", "June",
    "July", "Aug", "Sept", "Oct", "Nov", "Dec",
  ];

  var tierNames = ["error", "success", "info", "", "error"];
  
  $scope.edit = {
    start: {month:"January", day: 0},
    end: {month:"January", day: 0},
    replaces: -1,
    short_name: "",
    name: "",
    description: "",
    categories: "",
    tier:1
  };

  $scope.updateView = function() {
    var months = $("#months");
    var table = $("#maintable");

    months.empty();
    table.empty();

    for(m in monthNames) {
      months.append("<div id='" + monthNames[m] + (m > 11 ? "next" : "") + "' class='nomarg alert alert-" + ((m % 2) ? "success" : "info") + "'>" + monthNames[m] + "</div>");
    }

    events = _.sortBy($scope.events, function(e) { return e.start.month * 100 + e.start.day; });

    var columns = [];
    var datelist = _.map(monthNames, function(v, k) { return (1+k) * 100; });
    datelist = _.union(datelist, _.map(events, function(v) { return v.start.month * 100 + v.start.day; }));
    datelist = _.union(datelist, _.map(events, function(v) { return ((v.end.month < v.start.month ? 12 : 0) + v.end.month) * 100 + v.end.day; }));
    datelist.sort(function(a,b) { return a-b; });

    for(e in events) {
      var cur = events[e];
      var found = false;

      for(c in columns) {
	var last = _.last(columns[c]);
	if((((last.start.month > last.end.month ? 12 : 0) + last.end.month) * 100 + last.end.day) < (cur.start.month * 100 + cur.start.day)) {
	  columns[c].push(cur);
	  found = true;
	  break;
	}
      }

      if(!found) {
	columns.push([cur]);
      }
    }

    for(d in datelist) {
      var curday = datelist[d] % 100;
      var curmonth = (datelist[d] / 100) | 0;
      if(curday != 0) {
	$("#" + monthNames[curmonth-1] + (curmonth > 11 ? "next" : "")).append("<br>&nbsp;&nbsp;&nbsp;" + curday);
      }
    }

    table.append("<tr id='mainrow'></tr>");
    var tablerow = $("#mainrow");
    var text_height = 20;
    for(c in columns) {
      var column = columns[c];
      tablerow.append("<td id='column" + c + "' valign='top'></td>");
      var tablecol = $("#column" + c);
      var last_end = 0;
      for(e in column) {
	var cur = column[e];
	var start_height = text_height * _.indexOf(datelist, cur.start.month * 100 + cur.start.day) + cur.start.month * 2 - 1 - (e * 2 + 1);
	var end_height = text_height * (1 + _.indexOf(datelist, ((cur.end.month < cur.start.month ? 12 : 0) + cur.end.month) * 100 + cur.end.day)) + ((cur.end.month < cur.start.month ? 12 : 0) + cur.end.month) * 2 - 1;
	tablecol.append("<div href='#editmodal' role='button' data-toggle='modal' id='event" + c + "x" + e + "' class='nomarg alert alert-" + tierNames[cur.tier] + "' style='margin-top:" + (start_height - last_end) + 
	  "px; padding-bottom:" + (end_height - start_height - text_height) + "px'>" + cur.short_name + "<br>" + (cur.start.day > 0 ? monthAbrevs[cur.start.month-1] + " " + cur.start.day : "") + "</div>");
	$("#event" + c + "x" + e).popover({title:cur.name + "(" + cur.short_name + ")", html:true, placement:'bottom',
	  content:
	    "<strong>Submission</strong><br>" + monthNames[cur.start.month-1] + " " + (cur.start.day > 0 ? cur.start.day : "") + "<br>" +
	    "<strong>Conference</strong><br>" + monthNames[cur.end.month-1] + " " + (cur.end.day > 0 ? cur.end.day : "") + "<br>" +
	    "<strong>Description</strong><br>" + cur.description + "<br>" +
	    "<strong>Categories</strong><br>" + cur.categories + "<br>" +
	    "<strong>Tier</strong><br>" + cur.tier
	  , trigger:'hover'});
	$("#event" + c + "x" + e).click((function(cur) { return function() {
          $scope.edit = jQuery.extend(true, {}, cur);
	  $scope.edit.start.month = monthNames[cur.start.month-1];
	  $scope.edit.end.month = monthNames[cur.end.month-1];
	  $scope.edit.replaces = cur;
	  $("#editmodal").on('shown', (function(cur) { return function() {
	    $scope.$apply();
	  };})(cur));
	};})(cur));
	last_end = end_height;
      }
    }
  }

  $scope.getEdit = function() {
    return $scope.edit;
  }

  $scope.createNew = function() {
    $scope.edit = {
      start: {month:"January", day: 0},
      end: {month:"January", day: 0},
      replaces: -1,
      short_name: "",
      name: "",
      description: "",
      categories: "",
      tier:1
    };
  }

  $scope.createOrUpdate = function() {
    var cur = $scope.edit.replaces;
    $scope.edit.replaces = -1;
    if(cur == -1) {
      var newpub = jQuery.extend(true, {}, $scope.edit);
      newpub.start.month = _.indexOf(monthNames, $scope.edit.start.month)+1;
      newpub.end.month = _.indexOf(monthNames, $scope.edit.end.month)+1;
      newpub.start.day = parseInt($scope.edit.start.day);
      newpub.end.day = parseInt($scope.edit.end.day);
      $scope.events.push(newpub);
    } else {
      var index = _.indexOf($scope.events, cur);
      $scope.events[index] = jQuery.extend(true, {}, $scope.edit);
      cur = $scope.events[index];
      cur.start.month = _.indexOf(monthNames, $scope.edit.start.month)+1;
      cur.end.month = _.indexOf(monthNames, $scope.edit.end.month)+1;
      cur.start.day = parseInt($scope.edit.start.day);
      cur.end.day = parseInt($scope.edit.end.day);
    }
  }

  $scope.removeCurrent = function() {
    var cur = $scope.edit.replaces;
    $scope.edit.replaces = -1;
    if(cur != -1) {
      $scope.evenets = $scope.events.splice(_.indexOf(events, cur),1);
    }
  }
}
