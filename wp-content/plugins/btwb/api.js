var BTWB_GYM_ACTIVITY_URL            = "//api.beyondthewhiteboard.com/api/webwidgets/gyms/activities";
var BTWB_GYM_WOD_URL                 = "//api.beyondthewhiteboard.com/api/webwidgets/gyms/wodsets";
var BTWB_GYM_WORKOUT_LEADERBOARD_URL = "//api.beyondthewhiteboard.com/api/webwidgets/gyms/workout_leaderboards";

var TID_BTWB_GYM_ACTIVITY            = "#btwb_gym_activity_template";
var TID_BTWB_GYM_WOD                 = "#btwb_gym_wod_template";
var TID_BTWB_GYM_WORKOUT_LEADERBOARD = "#btwb_gym_workout_leaderboard_template";

function btwbLoadHtml($, apiKey, element, url, params, templateId) {
  $.ajax({
    dataType: "json",
    url: url,
    data: params,
    success: function(data) {
      var tmpl = $.trim($(templateId).text());
      var template = Hogan.compile(tmpl);
      var output = template.render(data);
      $(element).html(output);
    },
    complete: function(jqxhr, textStatus) {
      console.log(textStatus);
    }
  });
}

function btwbLoadElement($, apiKey, selector, url, templateId) {
  $.each($(selector), function(i, e) {
    var element = $(e);
    var params = element.data("params");
    params.api_key = apiKey;

    // Trigger the load
    btwbLoadHtml($, apiKey, element, url, params, templateId);

    // Update the landing page anchor
    $.each(element.find('a.btwb_landing_page'), function(i, anchor) {
      $(anchor).attr('href', url.concat('?', $.param(params)));
    });
  });
}

// btwbInitialize starts our btwb loading process
function btwbInitialize($, config) {
  var apiKey = config.apiKey
  $(function() {
    btwbLoadElement($, apiKey, ".btwb_gym_activity", BTWB_GYM_ACTIVITY_URL, TID_BTWB_GYM_ACTIVITY);
    btwbLoadElement($, apiKey, ".btwb_gym_workout_leaderboard", BTWB_GYM_WORKOUT_LEADERBOARD_URL, TID_BTWB_GYM_WORKOUT_LEADERBOARD);
    btwbLoadElement($, apiKey, ".btwb_gym_wod", BTWB_GYM_WOD_URL, TID_BTWB_GYM_WOD);
  });
};
