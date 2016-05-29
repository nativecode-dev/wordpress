<?php

/**
* Define the internationalization functionality
*
* Loads and defines the internationalization files for this plugin
* so that it is ready for translation.
*
* @link       https://www.nativecode.com
* @since      1.0.0
*
* @package    Just_Tips
* @subpackage Just_Tips/includes
*/

/**
* Define the internationalization functionality.
*
* Loads and defines the internationalization files for this plugin
* so that it is ready for translation.
*
* @since      1.0.0
* @package    Just_Tips
* @subpackage Just_Tips/includes
* @author     NativeCode <support@nativecode.com>
*/
class Just_Tips_i18n {


    /**
    * Load the plugin text domain for translation.
    *
    * @since    1.0.0
    */
    public function load_plugin_textdomain() {

        load_plugin_textdomain(
        'just-tips',
        false,
        dirname( dirname( plugin_basename( __FILE__ ) ) ) . '/languages/'
        );

    }



}