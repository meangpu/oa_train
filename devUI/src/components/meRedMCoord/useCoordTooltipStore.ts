import { create } from "zustand";

export type CoordTooltipState = {
  visible: boolean;
  coords: { x: number; y: number; z: number; } | null;
  mouse: { x: number; y: number; };
};

type CoordTooltipStore = {
  tooltip: CoordTooltipState;
  show: (
    coords: { x: number; y: number; z: number; },
    mouse: { x: number; y: number; }
  ) => void;
  move: (mouse: { x: number; y: number; }) => void;
  hide: () => void;
};

const useCoordTooltipStore = create<CoordTooltipStore>((set, get) => ({
  tooltip: {
    visible: false,
    coords: null,
    mouse: { x: 0, y: 0 },
  },
  show: (coords, mouse) => {
    set({
      tooltip: {
        visible: true,
        coords,
        mouse,
      },
    });
  },
  move: (mouse) => {
    const prev = get().tooltip;
    if (!prev.visible) return;
    set({ tooltip: { ...prev, mouse } });
  },
  hide: () => {
    const prev = get().tooltip;
    if (!prev.visible && !prev.coords) return;
    set({ tooltip: { ...prev, visible: false } });
  },
}));

export default useCoordTooltipStore;

