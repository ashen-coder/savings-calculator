<?php
/*
Plugin Name: Savings Calculator
Plugin URI: https://ashen-coder.github.io/savings-calculator/
Description: This free savings calculator considers the initial and ending balances, interest rate, and investment time when evaluating various investment circumstances.
Version: 1.0.0
Author: Ashen Coder
Author URI: https://github.com/ashen-coder
License: GPLv2 or later
Update URI: https://github.com/ashen-coder/savings-calculator
*/

if (!defined('ABSPATH')) exit;

if (!function_exists('add_shortcode')) return "No direct call for Savings Calculator";

function display_ac_savings_calculator(){
    $plugin_dir_path = plugin_dir_path(__FILE__);
    $scripts_and_styles = array(
        'assets/css/main.css',
        'assets/css/input.css',
        'assets/css/result.css',
        'assets/js/app.js',
    );

    $html_content = file_get_contents($plugin_dir_path . 'index.html');

    foreach ($scripts_and_styles as $filename) {
        $link = plugins_url($filename, __FILE__);
        $html_content = str_replace('./' . $filename, $link, $html_content);
    }

    return $html_content;
}

add_shortcode( 'ac_savings_calculator', 'display_ac_savings_calculator' );