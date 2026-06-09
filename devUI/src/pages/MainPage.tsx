import useGlobalVar from "@/services/GlobalVar";
import React from "react";

const MainPage: React.FC = () => {
  const displayRoot = useGlobalVar((state) => state.displayRoot);

  return (
    <div className='flex-center flex-col gap-2 bg-bg-black-opacity p-4 rounded-lg '>
      <div>{displayRoot ? "true" : "false"}</div>
      <div>start template</div>
    </div>
  );
};

export default MainPage;
