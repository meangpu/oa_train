import React from "react";
import { FaClock } from "react-icons/fa";
import { useUserCooldownSecondsLeft } from "@/services/GlobalVar";
import { formatCooldownRemaining } from "@/services/Utils";

const UserCooldownDisplay: React.FC = () => {
  const secondsLeft = useUserCooldownSecondsLeft();

  if (secondsLeft <= 0) return null;

  return (
    <div className='flex items-center justify-center gap-1 rounded-lg px-2 text-sm text-red-light'>
      <FaClock className='shrink-0 text-red-light' />
      <span>
        ใช้งานได้ในอีก{" "}
        <span className='font-extrabold text-red'>
          {formatCooldownRemaining(secondsLeft)}
        </span>
      </span>
    </div>
  );
};

export default React.memo(UserCooldownDisplay);
