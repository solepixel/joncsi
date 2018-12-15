(function() {

  var date_prompt =
    "Enter Date (Format YYYY-MM-DD, eg 2013-02-29)";
  var workoutid_prompt =
    "Enter Numeric Workout Id for Leaderboard (eg 1 for Fran)";

  var wod_shortcode_adder = function(shortcode) {
    return function() {
      var date = new Date();
      var dateStr = ''.concat(date.getFullYear(), '-', date.getMonth()+1, '-', date.getDate()+1);
      var attrValue = ' '.concat('date', '="', dateStr, '"');
      var selected = tinyMCE.activeEditor.selection.getContent();
      content = selected.concat('[', shortcode, attrValue, ']');
      tinymce.execCommand('mceInsertContent', false, content);
    };
  }

  var shortcode_adder = function(shortcode, promptStr, attrName) {
    return function() {
      var attrValue = '';
      if(promptStr && attrName) {
        attrValue = ' '.concat(attrName, '="', prompt(promptStr), '"');
      }
      var selected = tinyMCE.activeEditor.selection.getContent();
      content = selected.concat('[', shortcode, attrValue, ']');
      tinymce.execCommand('mceInsertContent', false, content);
    };
  }

  tinymce.create('tinymce.plugins.BtwbTinyMceButtonsPlugin', {
    init : function(ed, url) {
      // Register commands for each short code
      ed.addCommand('btwb_insert_shortcode_wod',
        wod_shortcode_adder('wod'));
      ed.addCommand('btwb_insert_shortcode_activity',
        shortcode_adder('activity', null, null));
      ed.addCommand('btwb_insert_shortcode_leaderboard',
        shortcode_adder('leaderboard', workoutid_prompt, 'workout_id'));

      // Register buttons to trigger the above commands
      ed.addButton(
        'btwb_button_wod',
        {
          title: 'Insert WOD',
          cmd: 'btwb_insert_shortcode_wod',
          image: url + '/images/button_wod.png'
        });
      ed.addButton(
        'btwb_button_activity',
        {
          title: 'Insert Gym Activity',
          cmd: 'btwb_insert_shortcode_activity',
          image: url + '/images/button_activity.png'
        });
      ed.addButton(
        'btwb_button_leaderboard',
        {
          title: 'Insert Leaderboard',
          cmd: 'btwb_insert_shortcode_leaderboard',
          image: url + '/images/button_leaderboard.png'
        });
    },
  });

  tinymce.PluginManager.add(
      'btwb_tinymce_buttons',
      tinymce.plugins.BtwbTinyMceButtonsPlugin);
})();
