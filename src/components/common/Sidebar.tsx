/* Pi-hole: A black hole for Internet advertisements
 * (c) 2019 Pi-hole, LLC (https://pi-hole.net)
 * Network-wide ad blocking via your own hardware.
 *
 * Web Interface
 * Sidebar component
 *
 * This file is copyright under the latest version of the EUPL.
 * Please see LICENSE file for your rights under this license. */

import React, { Fragment, ReactElement } from "react";
import { WithNamespaces, withNamespaces } from "react-i18next";
import { NavLink } from "react-router-dom";
import { Nav, NavItem } from "reactstrap";
import logo from "../../img/logo.svg";
import { mobileSidebarHide } from "./Header";
import api from "../../util/api";
import StatusBadge from "./StatusBadge";
import NavDropdown from "./NavDropdown";
import {
  RouteCustomItem,
  RouteData,
  RouteGroup,
  RouteItem
} from "../../routes";
import i18next from "i18next";

/**
 * A nav item constructed from the given {@link RouteItem}
 *
 * @param item The {@link RouteItem}
 * @param t The translation function
 * @constructor
 */
export const PiholeNavItem = ({
  item,
  t
}: {
  item: RouteItem;
  t: i18next.TranslationFunction;
}): ReactElement => (
  <NavItem>
    <NavLink
      to={item.url}
      onClick={mobileSidebarHide}
      className="nav-link"
      activeClassName="active"
    >
      <i className={"nav-icon " + item.icon} />
      {t(item.name)}
    </NavLink>
  </NavItem>
);

/**
 * A nav dropdown constructed from the given {@link RouteGroup}
 *
 * @param item The {@link RouteGroup}
 * @param t The translation function
 * @param location The location object
 * @constructor
 */
export const PiholeNavDropdown = ({
  item,
  t,
  location
}: {
  item: RouteGroup;
  t: i18next.TranslationFunction;
  location: Location;
}): ReactElement => (
  <NavDropdown
    name={t(item.name)}
    icon={item.icon}
    isOpen={location.pathname.startsWith(item.url)}
  >
    <NavList items={item.children} t={t} location={location} />
  </NavDropdown>
);

/**
 * A nav list constructed from the given {@link RouteItem}'s
 *
 * @param items The {@link RouteItem}'s
 * @param t The translation function
 * @param location The location object
 * @constructor
 */
export const NavList = ({
  items,
  t,
  location
}: {
  items: Array<RouteData>;
  t: i18next.TranslationFunction;
  location: Location;
}): ReactElement => (
  <Fragment>
    {items.map((item, index) => {
      // Don't show an item if it requires auth and we're not logged in
      if (item.auth && !api.loggedIn) return null;

      // Some items (login page) should only be shown when logged in or logged out, not both
      if (item.authStrict && item.auth !== api.loggedIn) return null;

      // Check if it's a custom component
      if ((item as RouteCustomItem).customComponent !== undefined) {
        const Component = (item as RouteCustomItem).customComponent;
        return <Component key={index} />;
      }

      // At this point it's ok to show the item
      return (item as RouteGroup).children ? (
        <PiholeNavDropdown
          item={item as RouteGroup}
          key={index}
          t={t}
          location={location}
        />
      ) : (
        <PiholeNavItem item={item as RouteItem} key={index} t={t} />
      );
    })}
  </Fragment>
);

export interface SidebarProps extends WithNamespaces {
  items: Array<RouteData>;
  location: Location;
}

/**
 * The sidebar used by the web interface
 *
 * @param items The nav items
 * @param t The translation function
 * @param location The location object
 * @constructor
 */
const Sidebar = ({ items, t, location }: SidebarProps): ReactElement => (
  <div className="sidebar">
    <nav className="sidebar-nav">
      <Nav>
        <li className="nav-title">
          <img
            src={logo}
            className="img-responsive pull-left"
            style={{ height: "67px" }}
            alt=""
          />
          <p
            className="pull-left"
            style={{
              paddingLeft: "15px",
              textTransform: "initial",
              fontSize: "14px",
              marginBottom: "initial",
              lineHeight: "14px",
              color: "white"
            }}
          >
            {t("Status")}
          </p>
          <br />
          <span style={{ textTransform: "initial", paddingLeft: "15px" }}>
            <StatusBadge />
          </span>
        </li>
        <NavList items={items} t={t} location={location} />
      </Nav>
    </nav>
  </div>
);

export default withNamespaces(["common", "location"])(Sidebar);
