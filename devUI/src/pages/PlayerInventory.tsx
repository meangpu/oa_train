import ItemBox from "@/components/ItemBox";
import useGlobalVar from "@/services/GlobalVar";
import React from "react";

const PlayerInventory: React.FC = () => {
  const playerInventory = useGlobalVar((state) => state.playerInventory);
  return (
    <div className='flex flex-wrap gap-1 bg-bg-black-opacity p-4 rounded-lg overflow-y-auto max-h-150'>
      {playerInventory.map((item) => (
        <ItemBox key={item.name} item={item} />
      ))}
    </div>
  );
};
export default PlayerInventory;
