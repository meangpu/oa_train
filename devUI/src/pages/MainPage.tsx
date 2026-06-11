import MiniMap from "@/components/meRedMCoord/MiniMap";
import TrainPins from "@/components/train/TrainPins";
import useGlobalVar from "@/services/GlobalVar";
import React from "react";

const MainPage: React.FC = () => {
  const playerLocation = useGlobalVar((state) => state.playerLocation);

  return (
    <div className='flex-center flex-col gap-1 bg-bg-black-opacity p-4 rounded-lg'>
      เลือกสถานีที่คุณต้องการไป
      <MiniMap
        coords={playerLocation}
        height='h-[795px]'
        width='w-[1416px]'
        showPlayerLocation={false}
        showDestinationMarker={false}
      >
        <TrainPins />
      </MiniMap>
    </div>
  );
};

export default MainPage;
