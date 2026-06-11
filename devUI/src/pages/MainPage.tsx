import MiniMap from "@/components/meRedMCoord/MiniMap";
import useGlobalVar from "@/services/GlobalVar";
import React from "react";

const MainPage: React.FC = () => {
  const playerLocation = useGlobalVar((state) => state.playerLocation);

  return (
    <div className='flex-center flex-col gap-2 bg-bg-black-opacity p-4 rounded-lg'>
      <MiniMap
        coords={playerLocation}
        height='h-[530px]'
        width='w-[944px]'
        showPlayerLocation
      />
    </div>
  );
};

export default MainPage;
