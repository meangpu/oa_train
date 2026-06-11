import MiniMap from "@/components/meRedMCoord/MiniMap";
import { TrainPins } from "@/components/train";
import useGlobalVar from "@/services/GlobalVar";
import React from "react";

const MainPage: React.FC = () => {
  const playerLocation = useGlobalVar((state) => state.playerLocation);

  return (
    <div className='flex-center flex-col gap-1 bg-bg-black-opacity p-4 rounded-lg'>
      เลือกสถานีที่คุณต้องการไป
      <MiniMap
        coords={playerLocation}
        height='h-[530px]'
        width='w-[944px]'
        showPlayerLocation
      >
        <TrainPins />
      </MiniMap>
    </div>
  );
};

export default MainPage;
