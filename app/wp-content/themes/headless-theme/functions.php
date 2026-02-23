<?php
/**
 * Headless Theme — functions.php
 *
 * Registers menu locations, theme support, and image sizes
 * for the headless frontend. No templates are rendered by this theme.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Theme setup — runs after WordPress is loaded.
 */
function headless_theme_setup(): void {
    // Menu locations (classic menus for WPGraphQL compatibility)
    register_nav_menus( [
        'primary' => __( 'Primary Navigation', 'headless-theme' ),
        'footer'  => __( 'Footer Navigation', 'headless-theme' ),
    ] );

    // Theme support
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'custom-logo' );
    add_theme_support( 'html5', [
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ] );

    // Image sizes for the headless frontend
    add_image_size( 'card-thumbnail', 600, 400, true );
    add_image_size( 'hero', 1920, 800, true );
}
add_action( 'after_setup_theme', 'headless_theme_setup' );
