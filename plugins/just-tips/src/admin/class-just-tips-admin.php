<?php

/**
* The admin-specific functionality of the plugin.
*
* @link       https://www.nativecode.com
* @since      1.0.0
*
* @package    Just_Tips
* @subpackage Just_Tips/admin
*/

/**
* The admin-specific functionality of the plugin.
*
* Defines the plugin name, version, and two examples hooks for how to
* enqueue the admin-specific stylesheet and JavaScript.
*
* @package    Just_Tips
* @subpackage Just_Tips/admin
* @author     NativeCode <support@nativecode.com>
*/
class Just_Tips_Admin {

    /**
    * The ID of this plugin.
    *
    * @since    1.0.0
    * @access   private
    * @var      string    $plugin_name    The ID of this plugin.
    */
    private $plugin_name;

    /**
    * The version of this plugin.
    *
    * @since    1.0.0
    * @access   private
    * @var      string    $version    The current version of this plugin.
    */
    private $version;

    /**
    * Initialize the class and set its properties.
    *
    * @since    1.0.0
    * @param      string    $plugin_name       The name of this plugin.
    * @param      string    $version    The version of this plugin.
    */
    public function __construct( $plugin_name, $version ) {

        $this->plugin_name = $plugin_name;
        $this->version = $version;

    }

    /**
    * Register the stylesheets for the admin area.
    *
    * @since    1.0.0
    */
    public function enqueue_styles() {

        /* bower:css */
        /* endbower */
        wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/just-tips-admin.css', array(), $this->version, 'all' );

    }

    /**
    * Register the JavaScript for the admin area.
    *
    * @since    1.0.0
    */
    public function enqueue_scripts() {

        /* bower:js */
        /* endbower */
        wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/just-tips-admin.js', array( 'jquery' ), $this->version, false );

    }

}