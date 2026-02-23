/**
 * Menu queries
 *
 * WPGraphQL exposes menus by their registered location or slug.
 * The location name depends on the active theme's registered menu locations.
 */

import { MENU_ITEM_FIELDS } from "../fragments";

export const GET_MENU_BY_LOCATION = `
  query GetMenuByLocation($location: MenuLocationEnum!) {
    menuItems(where: { location: $location }, first: 100) {
      nodes {
        ...MenuItemFields
        childItems {
          nodes {
            ...MenuItemFields
          }
        }
      }
    }
  }
  ${MENU_ITEM_FIELDS}
`;