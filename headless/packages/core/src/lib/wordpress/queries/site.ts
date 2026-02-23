/**
 * Site-wide queries (settings, general config)
 */

export const GET_SITE_SETTINGS = `
  query GetSiteSettings {
    generalSettings {
      title
      description
      url
      language
      timezone
    }
    readingSettings {
      postsPerPage
      postsPerPageMax
      showOnFront
      pageOnFront
      pageForPosts
      blogPublic
    }
    discussionConfig {
      requireNameEmail
      commentRegistration
      threadComments
      threadCommentsDepth
      pageComments
      commentsPerPage
      defaultCommentsPage
      commentOrder
      closeCommentsForOld
      closeCommentsDaysOld
      showAvatars
    }
    membershipConfig {
      usersCanRegister
      defaultRole
    }
    headlessConfig {
      frontendUrl
      version
      enableComments
      authTokenLifetime
      refreshTokenLifetime
    }
  }
`;
