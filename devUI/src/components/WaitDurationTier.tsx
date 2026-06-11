import useGlobalVar from "@/services/GlobalVar";
import { formatCooldownMinute } from "@/services/Utils";
import { WaitTimeConfig } from "@/types/TrainConfig";

const VIP_TIERS: {
  key: keyof Omit<WaitTimeConfig, "default">;
  image: string;
}[] = [
  { key: "vip_small", image: "vip_small.png" },
  { key: "vip_medium", image: "vip_medium.png" },
  { key: "vip_large", image: "vip_large.png" },
];

const WaitDurationTier = () => {
  const waitTime = useGlobalVar((state) => state.waitTime);
  return (
    <div className='flex flex-col gap-1 bg-bg-black-opacity p-2 rounded'>
      <div className='text-sm text-grey'>เวลารอใช้งานรถไฟ</div>
      <div className='px-1 py-0.5 text-sm text-grey border border-grey-more-more rounded'>
        ทั่วไป{" "}
        <span className='font-extrabold text-white'>
          {formatCooldownMinute(waitTime.default)}
        </span>
      </div>
      {VIP_TIERS.map(({ key, image }) => (
        <div
          key={key}
          className='flex items-center gap-1 border border-grey-more-more rounded'
        >
          <img src={image} className='h-6 w-auto shrink-0 ' />
          <span className='text-sm'>
            <span className='font-extrabold text-white'>
              {formatCooldownMinute(waitTime[key])}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
};

export default WaitDurationTier;
