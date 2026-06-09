import MainPage from "@/pages/MainPage";
import PlayerInventory from "@/pages/PlayerInventory";
import type { NavLinkItem } from "@/types/NavLinkItem";

export const mainNavLinks: NavLinkItem[] = [
  { path: "/", label: "main", exact: true, component: MainPage },
  { path: "/Inv", label: "Inv", exact: false, component: PlayerInventory },
  { path: "/Admin", label: "admin", exact: false, component: MainPage },
];
