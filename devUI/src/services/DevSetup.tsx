import { useEffect } from "react";
import useGlobalVar from "./GlobalVar";
import { generateItemData } from "@/test/TestItemData";

export function useDevSetup() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      useGlobalVar.setState({
        displayRoot: true,
        playerInventory: generateItemData(30),
        playerLocation: { x: -1644.44, y: -1393.21, z: 83.2 },
      });
    }
  }, []);
}
