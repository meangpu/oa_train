import useGlobalVar from "@/services/GlobalVar";
import { formatCooldownMinute } from "@/services/Utils";
import { VipTierKey } from "@/types/TrainConfig";

const VIP_TIERS: {
  key: VipTierKey;
  image: string;
}[] = [
  { key: "vip_small", image: "vip_small.png" },
  { key: "vip_medium", image: "vip_medium.png" },
  { key: "vip_large", image: "vip_large.png" },
];

const ACTIVE_ROW_CLASS = "border-green bg-green/10";
const INACTIVE_ROW_CLASS = "border-grey-more-more";

const WaitDurationTier = () => {
  const waitTime = useGlobalVar((state) => state.waitTime);
  const userVipTier = useGlobalVar((state) => state.userVipTier);
  const isDefaultActive = userVipTier === null;

  return (
    <div className='flex flex-col gap-1 bg-bg-black-opacity p-2 rounded'>
      <div className='text-sm text-grey'>เวลารอใช้งานรถไฟ</div>
      <div
        className={`px-1 py-0.5 text-sm border rounded ${
          isDefaultActive ? ACTIVE_ROW_CLASS : INACTIVE_ROW_CLASS
        }`}
      >
        <span className={isDefaultActive ? "text-green-light" : "text-grey"}>
          ทั่วไป{" "}
        </span>
        <span
          className={`font-extrabold ${isDefaultActive ? "text-green-light" : "text-white"}`}
        >
          {formatCooldownMinute(waitTime.default)}
        </span>
        {isDefaultActive && (
          <span className='ml-1 text-xs text-green-light'>(คุณ)</span>
        )}
      </div>
      {VIP_TIERS.map(({ key, image }) => {
        const isActive = userVipTier === key;
        return (
          <div
            key={key}
            className={`flex items-center gap-1 border rounded px-0.5 ${
              isActive ? ACTIVE_ROW_CLASS : INACTIVE_ROW_CLASS
            }`}
          >
            <img src={image} className='h-6 w-auto shrink-0 ' />
            <span className='text-sm'>
              <span
                className={`font-extrabold ${isActive ? "text-green-light" : "text-white"}`}
              >
                {formatCooldownMinute(waitTime[key])}
              </span>
              {isActive && (
                <span className='ml-1 text-xs text-green-light'>(คุณ)</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default WaitDurationTier;
