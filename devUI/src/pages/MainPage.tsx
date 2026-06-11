import StaticTrainMap from "@/components/train/StaticTrainMap";
import TrainPins from "@/components/train/TrainPins";
import React from "react";

const MainPage: React.FC = () => {
  return (
    <div className='flex-center flex-col gap-1 bg-bg-black-opacity p-4 rounded-lg'>
      เลือกสถานีที่คุณต้องการไป
      <StaticTrainMap height='h-[720px]'>
        <TrainPins />
      </StaticTrainMap>
    </div>
  );
};

export default MainPage;
