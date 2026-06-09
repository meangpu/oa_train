import { useEffect } from "react";
import useGlobalVar from "./GlobalVar";
import { generateItemData } from "@/test/TestItemData";

export function useDevSetup() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      useGlobalVar.setState({
        MyValue: "steam:1a2b3c4d5e6f7890",
        displayRoot: true,
        playerInventory: generateItemData(30),
      });
    }
  }, []);
}
