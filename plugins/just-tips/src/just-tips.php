<?php

/**
* The plugin bootstrap file
*
* This file is read by WordPress to generate the plugin information in the plugin
* admin area. This file also includes all of the dependencies used by the plugin,
* registers the activation and deactivation functions, and defines a function
* that starts the plugin.
*
* @link              {{plugin.homepage}}
* @since             1.0.0
* @package           {{plugin.title.package}}
*
* @wordpress-plugin
* Plugin Name:       {{plugin.title.display}}
* Plugin URI:        {{plugin.homepage}}
* Description:       {{npm.description}}
* Version:           {{npm.version}}
* Author:            {{npm.author}}
* Author URI:        {{plugin.authorpage}}
* License:           GPL-2.0+
* License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
* Text Domain:       {{plugin.title.name}}
* Domain Path:       /languages
*/

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
    die;
}

/**
* The code that runs during plugin activation.
* This action is documented in includes/class-just-tips-activator.php
*/
function activate_just_tips() {
    require_once plugin_dir_path( __FILE__ ) . 'includes/class-just-tips-activator.php';
    Just_Tips_Activator::activate();
}

/**
* The code that runs during plugin deactivation.
* This action is documented in includes/class-just-tips-deactivator.php
*/
function deactivate_just_tips() {
    require_once plugin_dir_path( __FILE__ ) . 'includes/class-just-tips-deactivator.php';
    Just_Tips_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_just_tips' );
register_deactivation_hook( __FILE__, 'deactivate_just_tips' );

/**
* The core plugin class that is used to define internationalization,
* admin-specific hooks, and public-facing site hooks.
*/
require plugin_dir_path( __FILE__ ) . 'includes/class-just-tips.php';

/**
* Begins execution of the plugin.
*
* Since everything within the plugin is registered via hooks,
* then kicking off the plugin from this point in the file does
* not affect the page life cycle.
*
* @since    1.0.0
*/
function run_just_tips() {

    $plugin = new Just_Tips();
    $plugin->run();

}

run_just_tips();