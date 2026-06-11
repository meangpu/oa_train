import StaticTrainMap from "@/components/train/StaticTrainMap";
import TrainPins from "@/components/train/TrainPins";
import UserCooldownDisplay from "@/components/train/UserCooldownDisplay";
import React from "react";

const MainPage: React.FC = () => {
  return (
    <div className='flex-center flex-col gap-1 bg-bg-black-opacity p-4 rounded-lg'>
      <div className='flex-center gap-1'>
        เลือกสถานีที่คุณต้องการไป
        <UserCooldownDisplay />
      </div>
      <StaticTrainMap height='h-[720px]'>
        <TrainPins />
      </StaticTrainMap>
    </div>
  );
};

export default MainPage;
