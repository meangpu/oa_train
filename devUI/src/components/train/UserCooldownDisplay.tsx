import React, { useEffect } from "react";
import { FaClock } from "react-icons/fa";
import useGlobalVar from "@/services/GlobalVar";
import { formatCooldownRemaining } from "@/services/Utils";

const UserCooldownDisplay: React.FC = () => {
  const secondsLeft = useGlobalVar((state) => state.userCooldownSecondsLeft);
  const requestUserCooldown = useGlobalVar(
    (state) => state.requestUserCooldown,
  );

  useEffect(() => {
    void requestUserCooldown();
  }, [requestUserCooldown]);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const intervalId = window.setInterval(() => {
      useGlobalVar.setState((state) => ({
        userCooldownSecondsLeft: Math.max(0, state.userCooldownSecondsLeft - 1),
      }));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [secondsLeft > 0]);

  if (secondsLeft <= 0) return null;

  return (
    <div className='flex items-center justify-center gap-2 rounded-lg border border-red/40 bg-red/10 px-3 py-1 text-sm text-red-light'>
      <FaClock className='shrink-0 text-red-light' />
      <span>
        ใช้งานรถไฟได้อีกครั้งใน{" "}
        <span className='font-extrabold text-red'>
          {formatCooldownRemaining(secondsLeft)}
        </span>
      </span>
    </div>
  );
};

export default React.memo(UserCooldownDisplay);
