<?php
/**
 * Headless Settings — admin page for configuring the frontend URL and options.
 */

namespace Headless;

class Settings {

    private static ?Settings $instance = null;
    const OPTION_GROUP = 'headless_settings';
    const OPTION_NAME  = 'headless_options';

    public static function instance(): Settings {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'admin_menu', [ $this, 'add_menu' ] );
        add_action( 'admin_init', [ $this, 'register_settings' ] );
    }

    public function add_menu(): void {
        add_options_page(
            __( 'Headless Settings', 'headless-core' ),
            __( 'Headless', 'headless-core' ),
            'manage_options',
            'headless-settings',
            [ $this, 'render_page' ]
        );
    }

    public function register_settings(): void {
        register_setting( self::OPTION_GROUP, self::OPTION_NAME, [
            'type'              => 'array',
            'sanitize_callback' => [ $this, 'sanitize' ],
            'default'           => self::defaults(),
        ] );

        add_settings_section(
            'headless_general',
            __( 'General', 'headless-core' ),
            null,
            'headless-settings'
        );

        add_settings_field(
            'frontend_url',
            __( 'Frontend URL', 'headless-core' ),
            [ $this, 'render_field_frontend_url' ],
            'headless-settings',
            'headless_general'
        );

        add_settings_field(
            'revalidate_secret',
            __( 'Revalidation Secret', 'headless-core' ),
            [ $this, 'render_field_revalidate_secret' ],
            'headless-settings',
            'headless_general'
        );

        add_settings_field(
            'posts_per_page_max',
            __( 'Max Posts Per Page', 'headless-core' ),
            [ $this, 'render_field_posts_per_page_max' ],
            'headless-settings',
            'headless_general'
        );

        add_settings_field(
            'enable_comments',
            __( 'Enable Comments', 'headless-core' ),
            [ $this, 'render_field_enable_comments' ],
            'headless-settings',
            'headless_general'
        );

        add_settings_field(
            'auth_token_lifetime',
            __( 'Auth Token Lifetime', 'headless-core' ),
            [ $this, 'render_field_auth_token_lifetime' ],
            'headless-settings',
            'headless_general'
        );

        add_settings_field(
            'refresh_token_lifetime',
            __( 'Refresh Token Lifetime', 'headless-core' ),
            [ $this, 'render_field_refresh_token_lifetime' ],
            'headless-settings',
            'headless_general'
        );
    }

    public static function defaults(): array {
        return [
            'frontend_url'        => 'http://localhost:3000',
            'revalidate_secret'   => '',
            'posts_per_page_max'  => '',
            'enable_comments'     => 1,
            'auth_token_lifetime' => 3600,
            'refresh_token_lifetime' => 2592000,
        ];
    }

    public static function get( string $key ): mixed {
        $options = get_option( self::OPTION_NAME, self::defaults() );
        return $options[ $key ] ?? self::defaults()[ $key ] ?? null;
    }

    public function sanitize( array $input ): array {
        $output = [];
        $output['frontend_url']       = untrailingslashit( esc_url_raw( $input['frontend_url'] ?? '' ) );
        $output['revalidate_secret']  = sanitize_text_field( $input['revalidate_secret'] ?? '' );

        $max_raw = $input['posts_per_page_max'] ?? '';
        $output['posts_per_page_max'] = '' === $max_raw ? '' : absint( $max_raw );

        $output['enable_comments'] = ! empty( $input['enable_comments'] ) ? 1 : 0;

        $auth_options    = self::auth_token_options();
        $refresh_options = self::refresh_token_options();
        $auth_val        = absint( $input['auth_token_lifetime'] ?? 3600 );
        $refresh_val     = absint( $input['refresh_token_lifetime'] ?? 2592000 );
        $output['auth_token_lifetime']    = isset( $auth_options[ $auth_val ] ) ? $auth_val : 3600;
        $output['refresh_token_lifetime'] = isset( $refresh_options[ $refresh_val ] ) ? $refresh_val : 2592000;

        return $output;
    }

    public static function auth_token_options(): array {
        return [
            900   => __( '15 minutes', 'headless-core' ),
            1800  => __( '30 minutes', 'headless-core' ),
            3600  => __( '1 hour', 'headless-core' ),
            7200  => __( '2 hours', 'headless-core' ),
            14400 => __( '4 hours', 'headless-core' ),
        ];
    }

    public static function refresh_token_options(): array {
        return [
            604800   => __( '7 days', 'headless-core' ),
            1209600  => __( '14 days', 'headless-core' ),
            2592000  => __( '30 days', 'headless-core' ),
            5184000  => __( '60 days', 'headless-core' ),
            7776000  => __( '90 days', 'headless-core' ),
        ];
    }

    public function render_field_frontend_url(): void {
        $value = self::get( 'frontend_url' );
        printf(
            '<input type="url" name="%s[frontend_url]" value="%s" class="regular-text" placeholder="http://localhost:3000" />',
            esc_attr( self::OPTION_NAME ),
            esc_attr( $value )
        );
        echo '<p class="description">' . esc_html__( 'The URL of the headless Next.js frontend.', 'headless-core' ) . '</p>';
    }

    public function render_field_revalidate_secret(): void {
        $value = self::get( 'revalidate_secret' );
        printf(
            '<input type="text" name="%s[revalidate_secret]" value="%s" class="regular-text" placeholder="your-secret-key" />',
            esc_attr( self::OPTION_NAME ),
            esc_attr( $value )
        );
        echo '<p class="description">' . esc_html__( 'Shared secret for cache revalidation. Must match REVALIDATE_SECRET in the Next.js environment.', 'headless-core' ) . '</p>';
    }

    public function render_field_posts_per_page_max(): void {
        $value = self::get( 'posts_per_page_max' );
        printf(
            '<input type="number" name="%s[posts_per_page_max]" value="%s" class="small-text" min="1" step="1" placeholder="" />',
            esc_attr( self::OPTION_NAME ),
            esc_attr( $value )
        );
        echo '<p class="description">' . esc_html__( 'Maximum total posts to load on a single blog page before showing numbered page links. Leave empty for infinite "Load More" with no page breaks.', 'headless-core' ) . '</p>';
    }

    public function render_field_enable_comments(): void {
        $value = self::get( 'enable_comments' );
        printf(
            '<label><input type="checkbox" name="%s[enable_comments]" value="1" %s /> %s</label>',
            esc_attr( self::OPTION_NAME ),
            checked( $value, 1, false ),
            esc_html__( 'Show comment sections on the frontend', 'headless-core' )
        );
        echo '<p class="description">' . esc_html__( 'Uncheck to completely hide comments across the entire site.', 'headless-core' ) . '</p>';
    }

    public function render_field_auth_token_lifetime(): void {
        $value   = (int) self::get( 'auth_token_lifetime' );
        $options = self::auth_token_options();
        printf( '<select name="%s[auth_token_lifetime]">', esc_attr( self::OPTION_NAME ) );
        foreach ( $options as $seconds => $label ) {
            printf(
                '<option value="%d" %s>%s</option>',
                $seconds,
                selected( $value, $seconds, false ),
                esc_html( $label )
            );
        }
        echo '</select>';
        echo '<p class="description">' . esc_html__( 'How long the authentication token stays valid. Shorter = more secure, longer = fewer re-logins.', 'headless-core' ) . '</p>';
    }

    public function render_field_refresh_token_lifetime(): void {
        $value   = (int) self::get( 'refresh_token_lifetime' );
        $options = self::refresh_token_options();
        printf( '<select name="%s[refresh_token_lifetime]">', esc_attr( self::OPTION_NAME ) );
        foreach ( $options as $seconds => $label ) {
            printf(
                '<option value="%d" %s>%s</option>',
                $seconds,
                selected( $value, $seconds, false ),
                esc_html( $label )
            );
        }
        echo '</select>';
        echo '<p class="description">' . esc_html__( 'How long users stay logged in between visits. After this period they must sign in again.', 'headless-core' ) . '</p>';
    }

    public function render_page(): void {
        ?>
        <div class="wrap">
            <h1><?php esc_html_e( 'Headless Settings', 'headless-core' ); ?></h1>
            <form method="post" action="options.php">
                <?php
                settings_fields( self::OPTION_GROUP );
                do_settings_sections( 'headless-settings' );
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }
}
