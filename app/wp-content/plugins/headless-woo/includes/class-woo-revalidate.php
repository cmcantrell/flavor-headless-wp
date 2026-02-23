<?php
/**
 * WooCommerce Revalidation — fires webhooks to the Next.js frontend
 * when products or product categories change.
 *
 * Mirrors the pattern from headless-core's class-revalidate.php.
 */

namespace Headless;

class WooRevalidate {

    private static ?WooRevalidate $instance = null;

    public static function instance(): WooRevalidate {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Product publish/update/unpublish
        add_action( 'transition_post_status', [ $this, 'on_product_change' ], 10, 3 );

        // WooCommerce-specific product hooks
        add_action( 'woocommerce_update_product', [ $this, 'on_product_update' ], 10, 1 );
        add_action( 'woocommerce_new_product', [ $this, 'on_product_update' ], 10, 1 );

        // Product category changes
        add_action( 'edited_product_cat', [ $this, 'on_category_change' ], 10, 2 );
        add_action( 'created_product_cat', [ $this, 'on_category_change' ], 10, 2 );
        add_action( 'delete_product_cat', [ $this, 'on_category_delete' ], 10, 4 );
    }

    /**
     * Product published, updated, or unpublished via post status transition.
     */
    public function on_product_change( string $new_status, string $old_status, \WP_Post $post ): void {
        if ( 'product' !== $post->post_type ) {
            return;
        }

        if ( 'publish' !== $new_status && 'publish' !== $old_status ) {
            return;
        }

        $paths = [
            '/shop',
            '/shop/' . $post->post_name,
        ];

        // Include category paths
        $categories = wp_get_post_terms( $post->ID, 'product_cat', [ 'fields' => 'slugs' ] );
        if ( ! is_wp_error( $categories ) ) {
            foreach ( $categories as $slug ) {
                $paths[] = '/shop/category/' . $slug;
            }
        }

        $this->send( $paths );
    }

    /**
     * Product created or updated via WooCommerce hooks.
     */
    public function on_product_update( int $product_id ): void {
        $post = get_post( $product_id );
        if ( ! $post || 'publish' !== $post->post_status ) {
            return;
        }

        $paths = [
            '/shop',
            '/shop/' . $post->post_name,
        ];

        $categories = wp_get_post_terms( $product_id, 'product_cat', [ 'fields' => 'slugs' ] );
        if ( ! is_wp_error( $categories ) ) {
            foreach ( $categories as $slug ) {
                $paths[] = '/shop/category/' . $slug;
            }
        }

        $this->send( $paths );
    }

    /**
     * Product category created or edited.
     */
    public function on_category_change( int $term_id, int $tt_id ): void {
        $term = get_term( $term_id, 'product_cat' );
        if ( ! $term || is_wp_error( $term ) ) {
            return;
        }

        $this->send( [
            '/shop',
            '/shop/category/' . $term->slug,
        ] );
    }

    /**
     * Product category deleted.
     */
    public function on_category_delete( int $term_id, int $tt_id, mixed $deleted_term, array $object_ids ): void {
        $paths = [ '/shop' ];

        // Revalidate all products that were in this category
        foreach ( $object_ids as $product_id ) {
            $post = get_post( $product_id );
            if ( $post && 'publish' === $post->post_status ) {
                $paths[] = '/shop/' . $post->post_name;
            }
        }

        $this->send( $paths );
    }

    /**
     * Revalidate specific paths.
     */
    private function send( array $paths ): void {
        $paths = array_unique( array_filter( $paths ) );
        if ( empty( $paths ) ) {
            return;
        }
        $this->fire_webhook( [ 'paths' => array_values( $paths ) ] );
    }

    /**
     * Send the revalidation request to Next.js.
     */
    private function fire_webhook( array $body ): void {
        $frontend_url = Settings::get( 'frontend_url' );
        $secret       = Settings::get( 'revalidate_secret' );

        if ( ! $frontend_url || ! $secret ) {
            return;
        }

        $url = trailingslashit( $frontend_url ) . 'api/revalidate';

        wp_remote_post( $url, [
            'timeout'  => 5,
            'blocking' => false,
            'headers'  => [
                'Content-Type'        => 'application/json',
                'x-revalidate-secret' => $secret,
            ],
            'body'     => wp_json_encode( $body ),
        ] );
    }
}
