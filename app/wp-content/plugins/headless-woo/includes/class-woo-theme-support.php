<?php
/**
 * WooCommerce Theme Support — adds add_theme_support('woocommerce') so WooCommerce
 * doesn't show "your theme does not support WooCommerce" notices.
 *
 * Done in the plugin (not the theme) because WooCommerce is optional.
 */

namespace Headless;

class WooThemeSupport {

    private static ?WooThemeSupport $instance = null;

    public static function instance(): WooThemeSupport {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'after_setup_theme', [ $this, 'add_support' ] );
    }

    public function add_support(): void {
        add_theme_support( 'woocommerce' );
    }
}
