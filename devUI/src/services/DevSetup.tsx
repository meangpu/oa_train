import { useEffect } from "react";
import useGlobalVar from "./GlobalVar";
import { generateItemData } from "@/test/TestItemData";
import { TrainLocations } from "@/types/TrainConfig";

const DEV_TRAIN_LOCATIONS: TrainLocations = {
  ARMADILO: {
    npcLocation: { x: -3729.156, y: -2601.321, z: -12.888, w: 180.806 },
    exitLocation: { x: -3740.613, y: -2607.416, z: -13.184, w: 91.332 },
  },
  BLACKWATER: {
    npcLocation: { x: -873.513, y: -1332.754, z: 44.011, w: 270.809 },
    exitLocation: { x: -866.153, y: -1332.853, z: 43.425, w: 267.751 },
  },
  VALENTINE: {
    npcLocation: { x: -175.371, y: 631.853, z: 114.14, w: 324.162 },
    exitLocation: { x: -165.587, y: 631.442, z: 114.082, w: 236.152 },
  },
  RHODES: {
    npcLocation: { x: 1230.161, y: -1298.506, z: 76.954, w: 226.338 },
    exitLocation: { x: 1230.326, y: -1306.115, z: 76.956, w: 136.125 },
  },
  SAINT_DENIS: {
    npcLocation: { x: 2747.902, y: -1396.479, z: 46.233, w: 29.842 },
    exitLocation: { x: 2746.083, y: -1403.451, z: 46.243, w: 202.676 },
  },
  BACCHUS_STATION: {
    npcLocation: { x: 582.725, y: 1681.029, z: 187.839, w: 317.242 },
    exitLocation: { x: 584.914, y: 1684.099, z: 187.72, w: 314.859 },
  },
  ANNESBURG: {
    npcLocation: { x: 2933.111, y: 1282.543, z: 44.703, w: 77.108 },
    exitLocation: { x: 2944.753, y: 1282.118, z: 44.676, w: 248.123 },
  },
};

export function useDevSetup() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      useGlobalVar.setState({
        displayRoot: true,
        playerInventory: generateItemData(30),
        playerLocation: { x: -1644.44, y: -1393.21, z: 83.2 },
        trainLocations: DEV_TRAIN_LOCATIONS,
        playerMoney: 10000,
        userCooldownSecondsLeft: 125,
      });
    }
  }, []);
}
