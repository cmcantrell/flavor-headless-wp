/**
 * WordPress / WPGraphQL Types
 *
 * Matches the WPGraphQL schema for core WordPress content.
 * WooCommerce types will be added in Phase 2.
 */

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

export interface WPImage {
  sourceUrl: string;
  altText: string;
  mediaDetails?: {
    width: number;
    height: number;
  };
}

export interface SEO {
  title: string;
  metaDesc: string;
  opengraphTitle?: string;
  opengraphDescription?: string;
  opengraphImage?: WPImage;
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

export interface Page {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  uri: string;
  content: string;
  date: string;
  modified: string;
  featuredImage?: {
    node: WPImage;
  };
  seo?: SEO;
}

export interface PagesResponse {
  pages: {
    nodes: Page[];
  };
}

export interface PageByUriResponse {
  pageBy: Page | null;
}

export interface FrontPageResponse {
  nodeByUri: Page | null;
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export interface Post {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  uri: string;
  date: string;
  modified: string;
  excerpt: string;
  content: string;
  featuredImage?: {
    node: WPImage;
  };
  author?: {
    node: {
      name: string;
      slug?: string;
      avatar?: {
        url: string;
      };
    };
  };
  categories?: {
    nodes: Category[];
  };
  tags?: {
    nodes: Tag[];
  };
  seo?: SEO;
  commentCount?: number;
  commentStatus?: string;
  comments?: {
    nodes: Comment[];
  };
}

export interface PostsResponse {
  posts: {
    nodes: Post[];
    pageInfo: PageInfo;
  };
}

export interface PostBySlugResponse {
  postBy: Post | null;
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------

export interface CommentAuthor {
  name: string;
  email?: string;
  avatar?: {
    url: string;
  };
}

export interface Comment {
  id: string;
  databaseId: number;
  content: string;
  date: string;
  parentId: string | null;
  author: {
    node: CommentAuthor;
  };
  replies?: {
    nodes: Comment[];
  };
}

export interface CreateCommentResponse {
  createComment: {
    success: boolean;
    comment: Comment | null;
  };
}

// ---------------------------------------------------------------------------
// Discussion Settings
// ---------------------------------------------------------------------------

export interface DiscussionConfig {
  requireNameEmail: boolean;
  commentRegistration: boolean;
  threadComments: boolean;
  threadCommentsDepth: number;
  pageComments: boolean;
  commentsPerPage: number;
  defaultCommentsPage: string;
  commentOrder: string;
  closeCommentsForOld: boolean;
  closeCommentsDaysOld: number;
  showAvatars: boolean;
}

// ---------------------------------------------------------------------------
// Membership Settings
// ---------------------------------------------------------------------------

export interface MembershipConfig {
  usersCanRegister: boolean;
  defaultRole: string;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  databaseId: number;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  nickname: string;
  description: string;
  url: string;
  avatar?: {
    url: string;
  };
}

export interface LoginResponse {
  login: {
    authToken: string;
    refreshToken: string;
    user: AuthUser;
  };
}

export interface RefreshTokenResponse {
  refreshToken: {
    authToken: string;
  };
}

export interface ViewerResponse {
  viewer: AuthUser | null;
}

export interface RegisterUserResponse {
  registerUser: {
    user: AuthUser;
  };
}

export interface UpdateUserResponse {
  updateUser: {
    user: AuthUser;
  };
}

export interface UpdateUserPasswordResponse {
  updateUser: {
    user: {
      id: string;
    };
  };
}

// ---------------------------------------------------------------------------
// Authors
// ---------------------------------------------------------------------------

export interface Author {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description?: string;
  avatar?: {
    url: string;
  };
}

export interface AuthorBySlugResponse {
  user: Author | null;
}

// ---------------------------------------------------------------------------
// Taxonomy
// ---------------------------------------------------------------------------

export interface Category {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  uri: string;
  description?: string;
  count?: number;
}

export interface CategoryBySlugResponse {
  category: Category | null;
}

export interface Tag {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  uri?: string;
  description?: string;
  count?: number;
}

export interface TagBySlugResponse {
  tag: Tag | null;
}

// ---------------------------------------------------------------------------
// Menus
// ---------------------------------------------------------------------------

export interface MenuItem {
  id: string;
  label: string;
  uri: string;
  path: string;
  parentId: string | null;
  cssClasses: string[];
  childItems?: {
    nodes: MenuItem[];
  };
}

export interface MenuResponse {
  menu: {
    menuItems: {
      nodes: MenuItem[];
    };
  } | null;
}

// ---------------------------------------------------------------------------
// Site / Settings
// ---------------------------------------------------------------------------

export interface GeneralSettings {
  title: string;
  description: string;
  url: string;
  language: string;
  timezone: string;
}

export interface ReadingSettings {
  postsPerPage: number;
  postsPerPageMax: number | null;
  showOnFront: string;
  pageOnFront: number;
  pageForPosts: number;
  blogPublic: boolean;
}

export interface HeadlessConfig {
  frontendUrl: string;
  version: string;
  enableComments: boolean;
  authTokenLifetime: number;
  refreshTokenLifetime: number;
}

export interface SiteSettingsResponse {
  generalSettings: GeneralSettings;
  readingSettings: ReadingSettings;
  discussionConfig: DiscussionConfig;
  membershipConfig: MembershipConfig;
  headlessConfig: HeadlessConfig;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface ContentNode {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  uri: string;
  date: string;
  excerpt?: string;
  featuredImage?: {
    node: WPImage;
  };
  contentType: {
    node: {
      name: string;
    };
  };
}

export interface SearchResponse {
  contentNodes: {
    nodes: ContentNode[];
    pageInfo: PageInfo;
  };
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
}
