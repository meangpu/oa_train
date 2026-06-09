import { getItemImageByName } from "@/services/Utils";
import { ItemData } from "@/types/ItemData";

const ItemBox = ({ item }: { item: ItemData }) => {
  return (
    <div
      className={`flex-center relative w-[60px] h-[60px] overflow-visible transition-all duration-200 ease-in-out rounded-lg opacity-80 hover:opacity-100 border border-grey-more bg-bg-black-opacity`}
    >
      <div
        className='flex-center w-full h-full'
        style={{
          contentVisibility: "auto",
          containIntrinsicSize: "60px 60px",
        }}
      >
        <div className='absolute-center top-6 w-[40px] h-[40px] overflow-hidden'>
          <img
            src={getItemImageByName(item.name)}
            width={40}
            height={40}
            draggable={false}
            onError={(e) => {
              const img = e.currentTarget;
              if (img.dataset.fallbackApplied === "1") return;
              img.dataset.fallbackApplied = "1";
              img.src = "icon.png";
            }}
            className={`w-full h-full transition-transform duration-200 ease-in-out hover:scale-105 `}
          />
        </div>
      </div>
      <div className='absolute -bottom-0 text-[10px] font-extrabold  w-full text-center text-white-real '>
        {item.label}
      </div>
      <div className='absolute -top-1 -right-1 font-extrabold text-[11px] rounded-md bg-bg-black-opacity px-1 py-0'>
        x{(item?.count ?? 0).toLocaleString()}
      </div>
    </div>
  );
};

export default ItemBox;
