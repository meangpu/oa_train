import { NavLink } from "react-router-dom";
import React, { JSX } from "react";
import { mainNavLinks } from "./NavData";
import type { NavLinkItem } from "@/types/NavLinkItem";

const NavBar: React.FC = () => {
  const renderNavLink = ({ path, label, exact }: NavLinkItem): JSX.Element => (
    <NavLink
      key={path}
      to={path}
      end={exact}
      className={({ isActive }) =>
        `rounded btn-outline me-p-sm  ${isActive ? "btn-white" : ""}`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <div className='absolute w-full top-4 flex-center gap-1.5'>
      {mainNavLinks.map(renderNavLink)}
    </div>
  );
};

export default NavBar;
