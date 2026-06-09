import { useEffect } from "react";
import { create } from "zustand";
import useGlobalModal from "./GlobalModal";
import { NuiProxy } from "./NuiProxy";
import AudioManager from "./AudioManager";
import { ItemData } from "@/types/ItemData";

const audioManager = new AudioManager({
  defaultPoolSize: 2,
  defaultVolume: 0.3,
  defaultMinPitch: 0.8,
  defaultMaxPitch: 1.2,
});

const getAudioManager = () => audioManager;
export { getAudioManager };

/*
  Example:
   const audioManager = getAudioManager();
   audioManager.playAudio("stopWorking.mp3");
*/

interface GlobalVarType {
  MyValue: string;
  displayRoot: boolean;
  uiEnabled: boolean;
  setUiEnabled: (enabled: boolean) => void;
  setRouterNavigate: (
    navigate: ((to: string) => void) | null | undefined,
  ) => void;

  playerInventory: ItemData[];
  playerInventoryIndex: ReadonlyMap<
    string,
    { count: number; limit: number; item: ItemData }
  >;
  setPlayerInventory: (inventory: ItemData[]) => void;
  findItemCountByName: (itemName: string) => number;
  findItemLimitByName: (itemName: string) => number;

  setDisplayRoot: (display: boolean) => void;
  CloseUIDisableClient: () => void;
  ChangeUINavPage: (page: string) => void;
}

const useGlobalVar = create<GlobalVarType>((set, get) => {
  let routerNavigate: ((to: string) => void) | null | undefined;
  const root = document.getElementById("root");
  const updateDisplay = () => {
    const { displayRoot, uiEnabled } = get();
    if (!root) return;
    root.style.display = displayRoot && uiEnabled ? "block" : "none";
  };
  return {
    MyValue: "",
    displayRoot: false,
    uiEnabled: true,
    setRouterNavigate: (navigate) => {
      routerNavigate = navigate;
    },

    playerInventory: [],
    playerInventoryIndex: new Map(), // this make find itemCount and limit be O(1)
    setPlayerInventory: (inventory: ItemData[]) => {
      const next = Array.isArray(inventory) ? inventory : [];
      const index = new Map<
        string,
        { count: number; limit: number; item: ItemData }
      >();
      for (const item of next) {
        if (!item?.name) continue;
        index.set(item.name, {
          count: item.count ?? 0,
          limit: item.limit ?? -1,
          item,
        });
      }
      set({ playerInventory: next, playerInventoryIndex: index });
    },
    findItemCountByName: (itemName: string) => {
      const entry = get().playerInventoryIndex.get(itemName);
      return entry?.count ?? 0;
    },
    findItemLimitByName: (itemName: string) => {
      const entry = get().playerInventoryIndex.get(itemName);
      return entry?.limit ?? -1;
    },

    setDisplayRoot: (display: boolean) => {
      set({ displayRoot: display });
      updateDisplay();
    },
    setUiEnabled: (enabled: boolean) => {
      set({ uiEnabled: enabled });
      updateDisplay();
    },
    setAudioEnabled: (enabled: boolean) => {
      audioManager.setAudioSystemEnabled(enabled);
    },
    CloseUIDisableClient: () => {
      get().setDisplayRoot(false);
      NuiProxy.call("NUIFocusOff");
    },
    ChangeUINavPage: (page: string) => {
      const raw = (page ?? "").toString().trim();
      if (!raw) return;
      const normalized = raw.startsWith("/") ? raw : `/${raw}`;
      if (routerNavigate) {
        routerNavigate(normalized);
        return;
      }
      window.location.hash = `#${normalized}`;
    },
  };
});

export default useGlobalVar;

export function useEventHandlers() {
  useEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {
      if (!useGlobalVar.getState().displayRoot) return;
      switch (event.code) {
        case "Escape":
          if (useGlobalModal.getState().isOpen) {
            useGlobalModal.getState().hideModal();
          } else {
            useGlobalVar.getState().CloseUIDisableClient();
          }
          break;
      }
    };
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMessage = ({ data }: { data: any }) => {
      // console.log(JSON.stringify(data));
      switch (data.type) {
        case "OpenUI":
          useGlobalVar.getState().setDisplayRoot(true);
          break;
        case "CloseUI":
          useGlobalVar.getState().setDisplayRoot(false);
          break;
        case "SetGlobalShow":
          useGlobalVar.getState().setUiEnabled(data.show);
          break;
        case "ChangeUINavPage":
          useGlobalVar.getState().ChangeUINavPage(data.page);
          break;
        // case "PlayAudio": {
        //   audioManager.playAudio("notification.mp3", { volume: 0.5 });
        //   audioManager.playAudio("buttonClick.mp3", { poolSize: 5 });
        //   break;
        // }
        case "PlayAudio": {
          audioManager.playAudio(data.audioName);
          break;
        }
        case "StopAudio": {
          audioManager.stopAllAudio();
          break;
        }
        case "SetPlayerInv":
          useGlobalVar.getState().setPlayerInventory(data.inventoryData);
          break;
        case "SetClientData":
          useGlobalVar.setState({
            MyValue: data.MyValue,
          });
          break;
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    NuiProxy.call("NUILoaded");
  }, []);

  return null;
}
