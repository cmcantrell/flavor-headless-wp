<?php
/**
 * Plugin Name: Headless Core
 * Description: Core functionality for headless WordPress — settings, GraphQL extensions, and preview support.
 * Version: 0.1.0
 * Author: InsightDesigns
 * Requires at least: 6.5
 * Requires PHP: 8.0
 * Requires Plugins: wp-graphql, headless-login-for-wpgraphql
 * Text Domain: headless-core
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'HEADLESS_CORE_VERSION', '0.1.0' );
define( 'HEADLESS_CORE_PATH', plugin_dir_path( __FILE__ ) );

require_once HEADLESS_CORE_PATH . 'includes/class-settings.php';
require_once HEADLESS_CORE_PATH . 'includes/class-graphql.php';
require_once HEADLESS_CORE_PATH . 'includes/class-preview.php';
require_once HEADLESS_CORE_PATH . 'includes/class-revalidate.php';

/**
 * Initialize plugin.
 */
function headless_core_init(): void {
    Headless\Settings::instance();
    Headless\GraphQL::instance();
    Headless\Preview::instance();
    Headless\Revalidate::instance();
}
add_action( 'plugins_loaded', 'headless_core_init' );
