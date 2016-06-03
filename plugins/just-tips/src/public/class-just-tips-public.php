<?php

/**
* The public-facing functionality of the plugin.
*
* @link       https://www.nativecode.com
* @since      1.0.0
*
* @package    Just_Tips
* @subpackage Just_Tips/public
*/

/**
* The public-facing functionality of the plugin.
*
* Defines the plugin name, version, and two examples hooks for how to
* enqueue the admin-specific stylesheet and JavaScript.
*
* @package    Just_Tips
* @subpackage Just_Tips/public
* @author     NativeCode <support@nativecode.com>
*/
class Just_Tips_Public {

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
    * @param      string    $plugin_name       The name of the plugin.
    * @param      string    $version    The version of this plugin.
    */
    public function __construct( $plugin_name, $version ) {

        $this->plugin_name = $plugin_name;
        $this->version = $version;

    }

    /**
    * Register the JavaScript for the public-facing side of the site.
    *
    * @since    1.0.0
    */
    public function enqueue_scripts() {

        /* bower:js */
        /* endbower */
        wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/just-tips-public.js', array( 'jquery' ), $this->version, false );

    }


    /**
    * Register the stylesheets for the public-facing side of the site.
    *
    * @since    1.0.0
    */
    public function enqueue_styles() {

        /* bower:css */
        /* endbower */
        wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/just-tips-public.css', array(), $this->version, 'all' );

    }
}