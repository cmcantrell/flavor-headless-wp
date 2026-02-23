/**
 * Auth queries and mutations
 *
 * Uses Headless Login for WPGraphQL plugin for login/refresh,
 * and native WPGraphQL for registerUser/viewer.
 */

const USER_FIELDS = `
  fragment UserFields on User {
    id
    databaseId
    name
    email
    firstName
    lastName
    username
    nickname
    description
    url
    avatar {
      url
    }
  }
`;

export const LOGIN_USER = `
  ${USER_FIELDS}
  mutation LoginUser($username: String!, $password: String!) {
    login(input: {
      provider: PASSWORD
      credentials: { username: $username, password: $password }
    }) {
      authToken
      refreshToken
      user {
        ...UserFields
      }
    }
  }
`;

export const REFRESH_TOKEN = `
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(input: { jwtRefreshToken: $refreshToken }) {
      authToken
    }
  }
`;

export const GET_VIEWER = `
  ${USER_FIELDS}
  query GetViewer {
    viewer {
      ...UserFields
    }
  }
`;

export const REGISTER_USER = `
  ${USER_FIELDS}
  mutation RegisterUser($username: String!, $email: String!, $password: String!) {
    registerUser(input: { username: $username, email: $email, password: $password }) {
      user {
        ...UserFields
      }
    }
  }
`;

export const UPDATE_USER = `
  ${USER_FIELDS}
  mutation UpdateUser(
    $id: ID!
    $firstName: String
    $lastName: String
    $nickname: String
    $displayName: String
    $email: String
    $websiteUrl: String
    $description: String
  ) {
    updateUser(input: {
      id: $id
      firstName: $firstName
      lastName: $lastName
      nickname: $nickname
      displayName: $displayName
      email: $email
      websiteUrl: $websiteUrl
      description: $description
    }) {
      user {
        ...UserFields
      }
    }
  }
`;

export const UPDATE_USER_PASSWORD = `
  mutation UpdateUserPassword($id: ID!, $password: String!) {
    updateUser(input: { id: $id, password: $password }) {
      user {
        id
      }
    }
  }
`;
