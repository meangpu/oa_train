import MiniMap from "@/components/meRedMCoord/MiniMap";
import { MAP_CENTER_COORDS } from "@/components/meRedMCoord/mapCoords";
import TrainPins from "@/components/train/TrainPins";
import React from "react";

const MainPage: React.FC = () => {
  return (
    <div className='flex-center flex-col gap-1 bg-bg-black-opacity p-4 rounded-lg'>
      เลือกสถานีที่คุณต้องการไป
      <MiniMap
        coords={MAP_CENTER_COORDS}
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
