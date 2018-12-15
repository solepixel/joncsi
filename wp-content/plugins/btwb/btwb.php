<?php
/*
Plugin Name: Beyond the Whiteboard
Plugin URI: http://blog.beyondthewhiteboard.com/wordpress-plugin/
Version: 1.3
Author: Beyond the Whiteboard
Description: BTWB Integration for your Gym's Wordpress site.
License: GPLv2 or later
*/
/*  Copyright 2013-2014 BadPopcorn, Inc  (email: contact@badpopcorn.com)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License, version 2, as 
    published by the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

///////////////////////////////////////////////////////////////////////////////
// JAVASCRIPT SDK INTEGRATION PARAMETERS
//
define('BTWB_JAVASCRIPT_INIT_FILE', 'init.js');
define('BTWB_JAVASCRIPT_HOGAN_FILE', 'vendor/javascripts/hogan-2.0.0.js');
define('BTWB_JAVASCRIPT_API_FILE', 'api.js');
define('BTWB_JAVASCRIPT_CONFIG_OBJECT_NAME', 'BTWB_CONFIG');
define('BTWB_JAVASCRIPT_API_KEY_PROPERTY', 'apiKey');

define('BTWB_STYLESHEET_FILE', 'templates/style.css');

define('BTWB_TEMPLATE_ACTIVITY', 'templates/activity.php');
define('BTWB_TEMPLATE_WOD', 'templates/wod.php');
define('BTWB_TEMPLATE_WORKOUT_LEADERBOARD', 'templates/workout_leaderboard.php');


///////////////////////////////////////////////////////////////////////////////
// SETTINGS API AND WORDPRESS ADMIN PANEL
//

define('BTWB_OPTIONS', 'btwb_options');
define('BTWB', 'btwb');

// Hook in Btwb Plugin into the Admin settings menu.
add_action('admin_menu', 'btwb_admin_add_page');
function btwb_admin_add_page() {
  add_options_page(
    'Beyond the Whiteboard',
    'BTWB Options',
    'manage_options',
    BTWB,
    'btwb_plugin_options_page');
}

// Create the options page html.
function btwb_plugin_options_page() {
?>
<div>
<h2>Beyond the Whiteboard Options</h2>
<p>For Help: <a href="http://blog.beyondthewhiteboard.com/wordpress-plugin/">http://blog.beyondthewhiteboard.com/wordpress-plugin/</a></p>
<form action="options.php" method="post">
<?php settings_fields(BTWB_OPTIONS); ?>
<?php do_settings_sections(BTWB); ?> 
<input name="Submit" type="submit" value="<?php esc_attr_e('Save Changes'); ?>" />
</form>
</div>
<?php
}

// Settings Sections
define('BTWB_S_GENERAL', 'btwb_section_general');
define('BTWB_S_WOD', 'btwb_section_wod');
define('BTWB_S_ACTIVITY', 'btwb_section_activity');
define('BTWB_S_LEADERBOARD', 'btwb_section_leaderboard');

// Defines Settings Keys inside wordpress, NOT params to btwb webwidgets
define('BTWB_SF_API_KEY', 'btwb_api_key');

define('BTWB_SF_WOD_TRACKS', 'btwb_wod_tracks');
define('BTWB_SF_WOD_SECTIONS', 'btwb_wod_sections');
define('BTWB_SF_WOD_TYPES', 'btwb_wod_types');
define('BTWB_SF_WOD_LEADERBOARD_LENGTH', 'btwb_wod_leaderboard_length');
define('BTWB_SF_WOD_ACTIVITY_LENGTH', 'btwb_wod_activity_length');

define('BTWB_SF_ACTIVITY_LENGTH', 'btwb_activity_length');
define('BTWB_SF_LEADERBOARD_LENGTH', 'btwb_leaderboard_length');

// Settings Fields Value validation regular expressions.
$BTWB_SETTINGS_FIELD_VALIDATION_RULES = array(
  BTWB_SF_API_KEY => '/^[A-Za-z0-9]+$/i',

  BTWB_SF_WOD_TRACKS => '/^[A-Za-z0-9]+$/i',
  BTWB_SF_WOD_SECTIONS => '/^[A-Za-z0-9]+$/i',
  BTWB_SF_WOD_TYPES => '/^[A-Za-z_]+$/i',
  BTWB_SF_WOD_LEADERBOARD_LENGTH => '/^[0-9]+$/i',
  BTWB_SF_WOD_ACTIVITY_LENGTH => '/^[0-9]+$/i',

  BTWB_SF_ACTIVITY_LENGTH => '/^[0-9]+$/i',
  BTWB_SF_LEADERBOARD_LENGTH => '/^[0-9]+$/i'
);

$BTWB_SETTINGS_FIELD_DEFAULTS = array(
  BTWB_SF_API_KEY => '',
  BTWB_SF_WOD_TRACKS => '0',
  BTWB_SF_WOD_SECTIONS => 'main',
  BTWB_SF_WOD_TYPES => 'workout',
  BTWB_SF_WOD_LEADERBOARD_LENGTH => '3',
  BTWB_SF_WOD_ACTIVITY_LENGTH => '0',
  BTWB_SF_ACTIVITY_LENGTH => '10',
  BTWB_SF_LEADERBOARD_LENGTH => '10'
);

// Registers our Settings Fields into the system
add_action('admin_init', 'btwb_admin_init');
function btwb_admin_init(){
  register_setting(
    BTWB_OPTIONS,
    BTWB_OPTIONS,
    'btwb_validate_options');

  // Sections
  add_settings_section(
    BTWB_S_GENERAL,
    'General Settings',
    'btwb_html_s_general',
    BTWB);
  add_settings_section(
    BTWB_S_WOD,
    '[wod] Shortcode',
    'btwb_html_s_wod',
    BTWB);
  add_settings_section(
    BTWB_S_ACTIVITY,
    '[activity] Shortcode',
    'btwb_html_s_activity',
    BTWB);
  add_settings_section(
    BTWB_S_LEADERBOARD,
    '[leaderboard] Shortcode',
    'btwb_html_s_leaderboard',
    BTWB);

  // Settings Fields
  add_settings_field(
    BTWB_SF_API_KEY,
    'Public Api Key<br/>(Found in your Gym Admin Menu under Wordpress Integration)',
    'btwb_html_sf_api_key',
    BTWB,
    BTWB_S_GENERAL);
  add_settings_field(
    BTWB_SF_WOD_TRACKS,
    'Track',
    'btwb_html_sf_wod_tracks',
    BTWB,
    BTWB_S_WOD);
  add_settings_field(
    BTWB_SF_WOD_SECTIONS,
    'Section',
    'btwb_html_sf_wod_sections',
    BTWB,
    BTWB_S_WOD);
  add_settings_field(
    BTWB_SF_WOD_TYPES,
    'WOD Types',
    'btwb_html_sf_wod_types',
    BTWB,
    BTWB_S_WOD);
  add_settings_field(
    BTWB_SF_WOD_LEADERBOARD_LENGTH,
    'Leaderboard Display Length',
    'btwb_html_sf_wod_leaderboard_length',
    BTWB,
    BTWB_S_WOD);
  add_settings_field(
    BTWB_SF_WOD_ACTIVITY_LENGTH,
    'Results List Length',
    'btwb_html_sf_wod_activity_length',
    BTWB,
    BTWB_S_WOD);
  add_settings_field(
    BTWB_SF_ACTIVITY_LENGTH,
    'Activity List Length',
    'btwb_html_sf_activity_length',
    BTWB,
    BTWB_S_ACTIVITY);
  add_settings_field(
    BTWB_SF_LEADERBOARD_LENGTH,
    'Leaderboard Display Length',
    'btwb_html_sf_leaderboard_length',
    BTWB,
    BTWB_S_LEADERBOARD);
}


////
// Validates the entirety of the plugin's settings.
//
function btwb_validate_options($input) {
  global $BTWB_SETTINGS_FIELD_VALIDATION_RULES;
  global $BTWB_SETTINGS_FIELD_DEFAULTS;
  $newinput = $BTWB_SETTINGS_FIELD_DEFAULTS;
  foreach($BTWB_SETTINGS_FIELD_VALIDATION_RULES as $field => $regex) {
    $value = $input[$field];
    if(preg_match($regex, $value)) {
      $newinput[$field] = $value;
    }
  }
  return $newinput;
}


///////////////////////////////////////////////////////////////////////////////
// SETTINGS OPTIONS HELPER METHODS FOR REST OF PLUGIN
//

// Helper function to get the btwb options array.
function btwb_options() {
  return get_option(BTWB_OPTIONS);
}

// Gets the value of a specific settings option.
function btwb_get_option($key) {
  $options = btwb_options();
  return $options[$key];
}

// Gets the HTML Safe value of a specific settings option.
function btwb_get_htmlsafe_option($key) {
  $option = btwb_get_option($key);
  $value = htmlspecialchars($option, ENT_NOQUOTES | ENT_QUOTES);
  return $value;
}


///////////////////////////////////////////////////////////////////////////////
// SETTINGS OPTIONS HELPER METHODS FOR REST OF PLUGIN
//

function btwb_html_h_text_input_tag($key) {
  $value = btwb_get_htmlsafe_option($key);
?>
  <input
    id="<?php echo $key ?>"
    name="btwb_options[<?php echo $key ?>]"
    size="40"
    type="text"
    value="<?php echo $value ?>" />
<?php
}

///////////////////////////////////////////////////////////////////////////////
// HTML String Generation for Settings Panel.
//

function btwb_html_s_general() {
?><p>Main Beyond the Whiteboard plugin settings.</p><?php
}

function btwb_html_s_wod() {
?><p>Default Settings for the [wod] shortcode.</p><?php
}

function btwb_html_s_activity() {
?><p>Default Settings for the [activity] shortcode.</p><?php
}

function btwb_html_s_leaderboard() {
?><p>Default Settings for the [leaderboard] shortcode.</p><?php
}

function btwb_html_sf_api_key() {
  btwb_html_h_text_input_tag(BTWB_SF_API_KEY);
}

function btwb_html_sf_wod_tracks() {
	$options = get_option('btwb_options');
	$items = array("1", "2", "3", "4", "5", "6");
	echo "<select id='btwb_wod_tracks' name='btwb_options[btwb_wod_tracks]' style='width: 100px;padding: 5px; background-color: #f2f2f2;border: 1px solid #ccc;'>";
	foreach($items as $item) {
		$selected = ($options['btwb_wod_tracks']==$item) ? 'selected="selected"' : '';
		echo "<option value='$item' $selected>Track $item</option>";
	}
	echo "</select>";
}

function btwb_html_sf_wod_sections() {
	$options = get_option('btwb_options');
	$items = array("Main", "All", "Pre", "Post");
	echo "<select id='btwb_wod_sections' name='btwb_options[btwb_wod_sections]' style='width: 100px;padding: 5px; background-color: #f2f2f2;border: 1px solid #ccc;'>";
	foreach($items as $item) {
		$selected = ($options['btwb_wod_sections']==$item) ? 'selected="selected"' : '';
		echo "<option value='$item' $selected>$item</option>";
	}
	echo "</select>";
}

function btwb_html_sf_wod_types() {
	$options = get_option('btwb_options');
	$items = array("Workout", "All", "Note", "Rest_Day", "Weigh_In");
	echo "<select id='btwb_wod_types' name='btwb_options[btwb_wod_types]' style='width: 100px;padding: 5px; background-color: #f2f2f2;border: 1px solid #ccc;'>";
	foreach($items as $item) {
		$selected = ($options['btwb_wod_types']==$item) ? 'selected="selected"' : '';
		echo "<option value='$item' $selected>$item</option>";
	}
	echo "</select>";
}

function btwb_html_sf_wod_leaderboard_length() {
  btwb_html_h_text_input_tag(BTWB_SF_WOD_LEADERBOARD_LENGTH);
}

function btwb_html_sf_wod_activity_length() {
  btwb_html_h_text_input_tag(BTWB_SF_WOD_ACTIVITY_LENGTH);
}

function btwb_html_sf_activity_length() {
  btwb_html_h_text_input_tag(BTWB_SF_ACTIVITY_LENGTH);
}

function btwb_html_sf_leaderboard_length() {
  btwb_html_h_text_input_tag(BTWB_SF_LEADERBOARD_LENGTH);
}


///////////////////////////////////////////////////////////////////////////////
// WORDPRESS HTML Javascript Injection
//

add_action('init', 'btwb_javascript_register');
add_action('wp_footer', 'btwb_template_print');

function btwb_javascript_register() {
  // Get javascript for the client side html template
  wp_enqueue_script(
    'btwb-javascript-hogan',
    plugins_url(BTWB_JAVASCRIPT_HOGAN_FILE, __FILE__),
    array(),
    false,
    true);

  // Get the SDK script loaded
  wp_enqueue_script(
    'btwb-javascript-api',
    plugins_url(BTWB_JAVASCRIPT_API_FILE, __FILE__),
    array('jquery'),
    false,
    true);

  // Enqueue the our initialization script
  wp_enqueue_script(
    'btwb-javascript-init',
    plugins_url(BTWB_JAVASCRIPT_INIT_FILE, __FILE__),
    array('jquery', 'btwb-javascript-api'),
    false,
    true);

  // Make sure our config is in a javascript object for init.
  wp_localize_script(
    'btwb-javascript-init',
    BTWB_JAVASCRIPT_CONFIG_OBJECT_NAME,
    array(
      BTWB_JAVASCRIPT_API_KEY_PROPERTY => btwb_get_option(BTWB_SF_API_KEY)
    ));

  // Get our stylesheet into the page.
  wp_enqueue_style(
    'btwb-stylesheet',
    plugins_url(BTWB_STYLESHEET_FILE, __FILE__),
    array(),
    false,
    'all');
}

function btwb_template_print() {
  //wp_print_scripts('btwb-javascript');

  // Activity Template
  echo '<script type="text/template" id="btwb_gym_activity_template">';
  include_once(plugin_dir_path(__FILE__) . BTWB_TEMPLATE_ACTIVITY);
  echo '</script>';

  // Wod Template
  echo '<script type="text/template" id="btwb_gym_wod_template">';
  include_once(plugin_dir_path(__FILE__) . BTWB_TEMPLATE_WOD);
  echo '</script>';

  // Workout Leaderboard Template
  echo '<script type="text/template" id="btwb_gym_workout_leaderboard_template">';
  include_once(plugin_dir_path(__FILE__) . BTWB_TEMPLATE_WORKOUT_LEADERBOARD);
  echo '</script>';
}


///////////////////////////////////////////////////////////////////////////////
// Short Codes
//

add_shortcode('wod', 'btwb_shortcode_wod');
add_shortcode('activity', 'btwb_shortcode_activity');
add_shortcode('leaderboard', 'btwb_shortcode_leaderboard');

///////////////////////////////////////////////////////////////////////////////
// Short Codes, parameters to send to WebWidgets HTTP service.
//

$BTWB_SHORTCODE_WOD_PARAMS_LIST = array(
  'date' => false,
  'tracks' => BTWB_SF_WOD_TRACKS,
  'gym_id' => false,
  'sections' => BTWB_SF_WOD_SECTIONS,
  'wod_types' => BTWB_SF_WOD_TYPES,
  'days' => 1,
  'leaderboard_length' => BTWB_SF_WOD_LEADERBOARD_LENGTH,
  'activity_length' => BTWB_SF_WOD_ACTIVITY_LENGTH
);
$BTWB_SHORTCODE_ACTIVITY_PARAMS_LIST = array(
  'gym_id' => false,
  'length' => BTWB_SF_ACTIVITY_LENGTH
);
$BTWB_SHORTCODE_LEADERBOARD_PARAMS_LIST = array(
  'workout_id' => false,
  'gym_id' => false,
  'length' => BTWB_SF_LEADERBOARD_LENGTH
);


///////////////////////////////////////////////////////////////////////////////
// Short Codes HTML builders.
//

// Create the [wod] shortcode for displaying track events.
function btwb_shortcode_wod($atts) {
  global $BTWB_SHORTCODE_WOD_PARAMS_LIST;
  return btwb_sc_html_tag(
    'btwb_gym_wod',
    $BTWB_SHORTCODE_WOD_PARAMS_LIST,
    $atts,
    'Loading the WODs from Beyond the Whiteboard');
}

// Create the [activity] shortcode for displaying gym activity
function btwb_shortcode_activity($atts) {
  global $BTWB_SHORTCODE_ACTIVITY_PARAMS_LIST;
  return btwb_sc_html_tag(
    'btwb_gym_activity',
    $BTWB_SHORTCODE_ACTIVITY_PARAMS_LIST,
    $atts,
    "Loading Recent Gym Activity from Beyond the Whiteboard");
}

// Create the [leaderboard] shortcode for displaying the workout leaderboard
function btwb_shortcode_leaderboard($atts) {
  global $BTWB_SHORTCODE_LEADERBOARD_PARAMS_LIST;
  return btwb_sc_html_tag(
    'btwb_gym_workout_leaderboard',
    $BTWB_SHORTCODE_LEADERBOARD_PARAMS_LIST,
    $atts,
    'Loading the Workout Leaderboard from Beyond the Whiteboard');
}


///////////////////////////////////////////////////////////////////////////////
// HELPER METHODS FOR THE SHORTCODE METHODS
//

// Create an HTML tag that the Javscript SDK will read and interpret.
function btwb_sc_html_tag($tag_class, $params_list, $atts, $msg) {
  $params = btwb_sc_encode_params($params_list, $atts);
  return "<div class='{$tag_class}' data-params='{$params}'><a class='btwb_landing_page' href='http://www.beyondthewhiteboard.com/'>{$msg}</a></div>";
}

// Get the HTML safe string of the json encoded shortcode parameters
function btwb_sc_encode_params($params_list, $atts) {
  // Get the defaults from the settings api for the shortcode's params list.
  // Then override those values with attributes from the shortcode tag itself.
  // JSON encode the params, then html safe the string.
  $params_defaults = btwb_sc_default_params($params_list);
  $params = shortcode_atts($params_defaults, $atts);
  $params_json = json_encode($params);
  $params_htmlsafe = htmlspecialchars($params_json, ENT_NOQUOTES | ENT_QUOTES);
  return $params_htmlsafe;
}

// worker function since anonymous functions not avail until php 5.3+
function btwb_sc_default_params__inner($value) {
  if(is_string($value)) {
    return btwb_get_option($value);
  } else {
    return NULL;
  }
}

// This funtion takes the shortcode's params list, and grabs the
// default from the plugin saved settings and returns an associative
// array of the WebWidget's URL params to the default values.
function btwb_sc_default_params($params_list) {
  return array_map(btwb_sc_default_params__inner, $params_list);
}



///////////////////////////////////////////////////////////////////////////////
// TinyMCE Hooks
//

// Registers the our tinymce plugin
add_action('init', 'btwb_tinymce_buttons_init');
function btwb_tinymce_buttons_init() {
  // Permission check
  if(!current_user_can('edit_posts') &&
      !current_user_can('edit_pages') &&
      get_user_option('rich_editing') == 'true') {
  return;
  }

  // Registers the TinyMCE plugin
  add_filter('mce_external_plugins', 'btwb_tinymce_buttons_register_plugin'); 

  // Add callback to TinyMCE toolbar
  add_filter('mce_buttons', 'btwb_tinymce_add_buttons');
}

function btwb_tinymce_buttons_register_plugin($plugin_array) {
  $plugin_array['btwb_tinymce_buttons'] =
    plugins_url('tinymce-buttons.js', __FILE__);
  return $plugin_array;
}

function btwb_tinymce_add_buttons($buttons) {
  array_push(
    $buttons,
    '|',
    'btwb_button_wod',
    'btwb_button_activity',
    'btwb_button_leaderboard');
  return $buttons;
}
