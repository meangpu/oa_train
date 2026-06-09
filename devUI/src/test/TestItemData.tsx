import { ItemData } from "@/types/ItemData";

const itemNames = [
  "wheat",
  "armor_iron",
  "casepaper_special",
  "newspaper",
  "paper",
  "bread",
  "bread_2",
];

export const generateItemData = (numberOfItems: number): ItemData[] => {
  const n = Number.isFinite(numberOfItems)
    ? Math.max(0, Math.floor(numberOfItems))
    : 0;
  const namesLen = itemNames.length;

  return Array.from({ length: n }, (): ItemData => {
    const randomName = itemNames[Math.floor(Math.random() * namesLen)];
    return {
      name: randomName,
      label:
        randomName.charAt(0).toUpperCase() +
        randomName.slice(1).replace(/_/g, " "),
      count: Math.floor(Math.random() * 10),
      chance: Math.random(),
      limit: Math.floor(Math.random() * 5) + 1,
    };
  });
};
