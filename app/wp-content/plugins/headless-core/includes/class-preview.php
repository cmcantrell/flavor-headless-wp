<?php
/**
 * Preview Support — redirects WP preview links to the headless frontend.
 */

namespace Headless;

class Preview {

    private static ?Preview $instance = null;

    public static function instance(): Preview {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_filter( 'preview_post_link', [ $this, 'rewrite_preview_link' ], 10, 2 );
    }

    /**
     * Rewrite WP preview links to point at the headless frontend.
     */
    public function rewrite_preview_link( string $link, \WP_Post $post ): string {
        $frontend_url = Settings::get( 'frontend_url' );

        if ( empty( $frontend_url ) ) {
            return $link;
        }

        // Build a preview URL the Next.js app can handle.
        // The frontend will use this to fetch a draft via authenticated GraphQL.
        return sprintf(
            '%s/api/preview?post_id=%d&post_type=%s&token=%s',
            untrailingslashit( $frontend_url ),
            $post->ID,
            $post->post_type,
            wp_create_nonce( 'headless_preview_' . $post->ID )
        );
    }
}
