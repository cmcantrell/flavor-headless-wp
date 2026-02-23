<?php
/**
 * Plugin Name: Headless WooCommerce
 * Description: WooCommerce integration for headless WordPress — theme support and ISR revalidation for products.
 * Version: 0.1.0
 * Author: InsightDesigns
 * Requires at least: 6.5
 * Requires PHP: 8.0
 * Requires Plugins: headless-core, woocommerce, wp-graphql-woocommerce-develop
 * Text Domain: headless-woo
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'HEADLESS_WOO_VERSION', '0.1.0' );
define( 'HEADLESS_WOO_PATH', plugin_dir_path( __FILE__ ) );

require_once HEADLESS_WOO_PATH . 'includes/class-woo-theme-support.php';
require_once HEADLESS_WOO_PATH . 'includes/class-woo-revalidate.php';

/**
 * Initialize plugin.
 */
function headless_woo_init(): void {
    Headless\WooThemeSupport::instance();
    Headless\WooRevalidate::instance();
}
add_action( 'plugins_loaded', 'headless_woo_init' );
