<?php
/**
 * GraphQL Extensions — registers custom fields on the WPGraphQL schema.
 */

namespace Headless;

class GraphQL {

    private static ?GraphQL $instance = null;

    public static function instance(): GraphQL {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'graphql_register_types', [ $this, 'register_types' ] );
    }

    /**
     * Register headless-specific fields on the WPGraphQL schema.
     */
    public function register_types(): void {
        // Expose headless config to the frontend via GraphQL.
        register_graphql_object_type( 'HeadlessConfig', [
            'description' => __( 'Headless frontend configuration.', 'headless-core' ),
            'fields'      => [
                'frontendUrl' => [
                    'type'        => 'String',
                    'description' => __( 'The headless frontend URL.', 'headless-core' ),
                ],
                'version' => [
                    'type'        => 'String',
                    'description' => __( 'Plugin version.', 'headless-core' ),
                ],
                'enableComments' => [
                    'type'        => 'Boolean',
                    'description' => __( 'Whether comments are enabled on the frontend.', 'headless-core' ),
                ],
                'authTokenLifetime' => [
                    'type'        => 'Int',
                    'description' => __( 'Auth token lifetime in seconds.', 'headless-core' ),
                ],
                'refreshTokenLifetime' => [
                    'type'        => 'Int',
                    'description' => __( 'Refresh token lifetime in seconds.', 'headless-core' ),
                ],
            ],
        ] );

        register_graphql_field( 'RootQuery', 'headlessConfig', [
            'type'        => 'HeadlessConfig',
            'description' => __( 'Headless frontend configuration.', 'headless-core' ),
            'resolve'     => function () {
                return [
                    'frontendUrl'           => Settings::get( 'frontend_url' ),
                    'version'               => HEADLESS_CORE_VERSION,
                    'enableComments'        => (bool) Settings::get( 'enable_comments' ),
                    'authTokenLifetime'     => (int) ( Settings::get( 'auth_token_lifetime' ) ?: 3600 ),
                    'refreshTokenLifetime'  => (int) ( Settings::get( 'refresh_token_lifetime' ) ?: 2592000 ),
                ];
            },
        ] );

        // Expose max posts per page for hybrid pagination
        register_graphql_field( 'ReadingSettings', 'postsPerPageMax', [
            'type'        => 'Int',
            'description' => __( 'Maximum posts to load on a single blog page before numbered pagination. Null = infinite Load More.', 'headless-core' ),
            'resolve'     => function () {
                $value = Settings::get( 'posts_per_page_max' );
                return '' === $value || null === $value ? null : (int) $value;
            },
        ] );

        // Expose search engine visibility (Settings > Reading > "Discourage search engines")
        register_graphql_field( 'ReadingSettings', 'blogPublic', [
            'type'        => 'Boolean',
            'description' => __( 'Whether search engines are allowed to index the site.', 'headless-core' ),
            'resolve'     => function () {
                return (bool) get_option( 'blog_public', 1 );
            },
        ] );

        // ---------------------------------------------------------------
        // Discussion Settings (not natively exposed by WPGraphQL)
        // ---------------------------------------------------------------
        register_graphql_object_type( 'DiscussionConfig', [
            'description' => __( 'Extended discussion/comment settings.', 'headless-core' ),
            'fields'      => [
                'requireNameEmail'    => [
                    'type'        => 'Boolean',
                    'description' => __( 'Whether commenters must supply name and email.', 'headless-core' ),
                ],
                'commentRegistration' => [
                    'type'        => 'Boolean',
                    'description' => __( 'Whether users must be registered and logged in to comment.', 'headless-core' ),
                ],
                'threadComments'      => [
                    'type'        => 'Boolean',
                    'description' => __( 'Whether threaded (nested) comments are enabled.', 'headless-core' ),
                ],
                'threadCommentsDepth' => [
                    'type'        => 'Int',
                    'description' => __( 'Maximum nesting depth for threaded comments.', 'headless-core' ),
                ],
                'pageComments'        => [
                    'type'        => 'Boolean',
                    'description' => __( 'Whether comments are paginated.', 'headless-core' ),
                ],
                'commentsPerPage'     => [
                    'type'        => 'Int',
                    'description' => __( 'Number of top-level comments per page.', 'headless-core' ),
                ],
                'defaultCommentsPage' => [
                    'type'        => 'String',
                    'description' => __( 'Which page of comments to display first ("newest" or "oldest").', 'headless-core' ),
                ],
                'commentOrder'        => [
                    'type'        => 'String',
                    'description' => __( 'Comment display order ("asc" or "desc").', 'headless-core' ),
                ],
                'closeCommentsForOld' => [
                    'type'        => 'Boolean',
                    'description' => __( 'Whether to auto-close comments on old posts.', 'headless-core' ),
                ],
                'closeCommentsDaysOld' => [
                    'type'        => 'Int',
                    'description' => __( 'Days after publication to close comments.', 'headless-core' ),
                ],
                'showAvatars'         => [
                    'type'        => 'Boolean',
                    'description' => __( 'Whether to show commenter avatars.', 'headless-core' ),
                ],
            ],
        ] );

        register_graphql_field( 'RootQuery', 'discussionConfig', [
            'type'        => 'DiscussionConfig',
            'description' => __( 'Extended discussion settings for comments.', 'headless-core' ),
            'resolve'     => function () {
                return [
                    'requireNameEmail'     => (bool) get_option( 'require_name_email', 1 ),
                    'commentRegistration'  => (bool) get_option( 'comment_registration', 0 ),
                    'threadComments'       => (bool) get_option( 'thread_comments', 1 ),
                    'threadCommentsDepth'  => (int) get_option( 'thread_comments_depth', 5 ),
                    'pageComments'         => (bool) get_option( 'page_comments', 0 ),
                    'commentsPerPage'      => (int) get_option( 'comments_per_page', 50 ),
                    'defaultCommentsPage'  => get_option( 'default_comments_page', 'newest' ),
                    'commentOrder'         => get_option( 'comment_order', 'asc' ),
                    'closeCommentsForOld'  => (bool) get_option( 'close_comments_for_old_posts', 0 ),
                    'closeCommentsDaysOld' => (int) get_option( 'close_comments_days_old', 14 ),
                    'showAvatars'          => (bool) get_option( 'show_avatars', 1 ),
                ];
            },
        ] );

        // ---------------------------------------------------------------
        // Membership Settings (user registration)
        // ---------------------------------------------------------------
        register_graphql_object_type( 'MembershipConfig', [
            'description' => __( 'Membership/registration settings.', 'headless-core' ),
            'fields'      => [
                'usersCanRegister' => [
                    'type'        => 'Boolean',
                    'description' => __( 'Whether anyone can register as a user.', 'headless-core' ),
                ],
                'defaultRole' => [
                    'type'        => 'String',
                    'description' => __( 'The default role for new users.', 'headless-core' ),
                ],
            ],
        ] );

        register_graphql_field( 'RootQuery', 'membershipConfig', [
            'type'        => 'MembershipConfig',
            'description' => __( 'Membership/registration settings.', 'headless-core' ),
            'resolve'     => function () {
                return [
                    'usersCanRegister' => (bool) get_option( 'users_can_register', 0 ),
                    'defaultRole'      => get_option( 'default_role', 'subscriber' ),
                ];
            },
        ] );
    }
}
