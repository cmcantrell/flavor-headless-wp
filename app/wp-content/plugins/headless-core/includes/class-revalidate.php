<?php
/**
 * Revalidate — fires webhooks to the Next.js frontend when content changes.
 *
 * Hooks into WordPress actions for posts, pages, comments, menus, and settings
 * to trigger on-demand ISR revalidation.
 */

namespace Headless;

class Revalidate {

    private static ?Revalidate $instance = null;

    public static function instance(): Revalidate {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Posts and pages
        add_action( 'transition_post_status', [ $this, 'on_post_change' ], 10, 3 );
        add_action( 'delete_post', [ $this, 'on_post_delete' ], 10, 1 );

        // Comments
        add_action( 'comment_post', [ $this, 'on_comment_post' ], 10, 3 );
        add_action( 'wp_set_comment_status', [ $this, 'on_comment_status' ], 10, 2 );
        add_action( 'edit_comment', [ $this, 'on_comment_edit' ], 10, 2 );

        // Menus
        add_action( 'wp_update_nav_menu', [ $this, 'on_menu_change' ], 10, 0 );

        // Settings (reading, discussion, general, headless)
        add_action( 'update_option_show_on_front', [ $this, 'on_settings_change' ], 10, 0 );
        add_action( 'update_option_page_on_front', [ $this, 'on_settings_change' ], 10, 0 );
        add_action( 'update_option_blogname', [ $this, 'on_settings_change' ], 10, 0 );
        add_action( 'update_option_blogdescription', [ $this, 'on_settings_change' ], 10, 0 );
        add_action( 'update_option_' . Settings::OPTION_NAME, [ $this, 'on_settings_change' ], 10, 0 );
    }

    /**
     * Post published, updated, or unpublished.
     */
    public function on_post_change( string $new_status, string $old_status, \WP_Post $post ): void {
        // Only care about public post types
        if ( ! in_array( $post->post_type, [ 'post', 'page' ], true ) ) {
            return;
        }

        // Only fire if transitioning to/from publish
        if ( 'publish' !== $new_status && 'publish' !== $old_status ) {
            return;
        }

        $paths = $this->get_post_paths( $post );

        // Also revalidate listings
        if ( 'post' === $post->post_type ) {
            $paths[] = '/blog';
        }
        $paths[] = '/';

        $this->send( $paths );
    }

    /**
     * Post deleted.
     */
    public function on_post_delete( int $post_id ): void {
        $post = get_post( $post_id );
        if ( ! $post || ! in_array( $post->post_type, [ 'post', 'page' ], true ) ) {
            return;
        }

        $paths = [ '/' ];
        if ( 'post' === $post->post_type ) {
            $paths[] = '/blog';
        }

        $this->send( $paths );
    }

    /**
     * New comment posted.
     */
    public function on_comment_post( int $comment_id, $approved, array $commentdata ): void {
        $post_id = $commentdata['comment_post_ID'] ?? 0;
        if ( ! $post_id ) {
            return;
        }
        $this->revalidate_post_by_id( (int) $post_id );
    }

    /**
     * Comment approved, unapproved, trashed, etc.
     */
    public function on_comment_status( int $comment_id, string $status ): void {
        $comment = get_comment( $comment_id );
        if ( ! $comment || ! $comment->comment_post_ID ) {
            return;
        }
        $this->revalidate_post_by_id( (int) $comment->comment_post_ID );
    }

    /**
     * Comment edited.
     */
    public function on_comment_edit( int $comment_id, array $data ): void {
        $comment = get_comment( $comment_id );
        if ( ! $comment || ! $comment->comment_post_ID ) {
            return;
        }
        $this->revalidate_post_by_id( (int) $comment->comment_post_ID );
    }

    /**
     * Menu updated — revalidate the entire layout.
     */
    public function on_menu_change(): void {
        $this->send_all();
    }

    /**
     * Core settings changed — revalidate everything.
     */
    public function on_settings_change(): void {
        $this->send_all();
    }

    /**
     * Helper: revalidate paths for a post by ID.
     */
    private function revalidate_post_by_id( int $post_id ): void {
        $post = get_post( $post_id );
        if ( ! $post ) {
            return;
        }
        $this->send( $this->get_post_paths( $post ) );
    }

    /**
     * Build Next.js paths for a post/page.
     */
    private function get_post_paths( \WP_Post $post ): array {
        $paths = [];

        if ( 'post' === $post->post_type ) {
            $paths[] = '/blog/' . $post->post_name;
        } elseif ( 'page' === $post->post_type ) {
            // Check if this is the front page
            $front_page_id = (int) get_option( 'page_on_front', 0 );
            if ( $post->ID === $front_page_id ) {
                $paths[] = '/';
            } else {
                $paths[] = '/' . $post->post_name;
            }
        }

        return $paths;
    }

    /**
     * Revalidate the entire site (layout-level).
     */
    private function send_all(): void {
        $this->fire_webhook( [ 'all' => true ] );
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
                'Content-Type'       => 'application/json',
                'x-revalidate-secret' => $secret,
            ],
            'body'     => wp_json_encode( $body ),
        ] );
    }
}
