import StaticTrainMap from "@/components/train/StaticTrainMap";
import TrainPins from "@/components/train/TrainPins";
import UserCooldownDisplay from "@/components/train/UserCooldownDisplay";
import WaitDurationTier from "@/components/WaitDurationTier";
import React from "react";

const MainPage: React.FC = () => {
  return (
    <div className='flex-center flex-col bg-bg-black-opacity p-4 rounded-lg'>
      <div className='flex-center gap-1'>
        <div> เลือกสถานีที่คุณต้องการไป </div>
        <UserCooldownDisplay />
      </div>
      <div className='text-xs text-grey mb-2'>
        สามารถใช้คำสั่ง{" "}
        <span className='bg-grey-more-more text-white px-1 rounded'>
          /train_cooldown
        </span>{" "}
        เพื่อดูเวลารอใช้งานรถไฟได้
      </div>
      <StaticTrainMap height='h-[720px]'>
        <TrainPins />
      </StaticTrainMap>
      <div className='absolute -right-40 flex flex-col gap-2'>
        <WaitDurationTier />
      </div>
    </div>
  );
};

export default MainPage;
