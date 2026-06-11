import useGlobalVar from "@/services/GlobalVar";
import { formatCooldownRemaining } from "@/services/Utils";
import { WaitTimeConfig } from "@/types/TrainConfig";

const VIP_TIERS: {
  key: keyof Omit<WaitTimeConfig, "default">;
  image: string;
}[] = [
  { key: "vip_large", image: "vip_large.png" },
  { key: "vip_medium", image: "vip_medium.png" },
  { key: "vip_small", image: "vip_small.png" },
];

const WaitDurationTier = () => {
  const waitTime = useGlobalVar((state) => state.waitTime);

  return (
    <div className='flex flex-col gap-3'>
      <div className='text-sm text-grey'>เวลารอใช้งานรถไฟ</div>
      {VIP_TIERS.map(({ key, image }) => (
        <div key={key} className='flex items-center gap-3'>
          <img
            src={image}
            alt=''
            className='h-20 w-auto shrink-0 drop-shadow-md'
          />
          <span className='text-sm'>
            <span className='font-extrabold text-green-light'>
              {formatCooldownRemaining(waitTime[key])}
            </span>
          </span>
        </div>
      ))}
      <div className='border-t border-grey-more-more pt-2 text-sm text-grey'>
        ทั่วไป{" "}
        <span className='font-extrabold text-white'>
          {formatCooldownRemaining(waitTime.default)}
        </span>
      </div>
    </div>
  );
};

export default WaitDurationTier;
