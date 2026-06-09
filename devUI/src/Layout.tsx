import { Outlet } from "react-router-dom";
import Modal from "./components/Modal";
import GameBgTest from "./components/GameBgTest";
// import NavBar from "./components/Navbar";
// import OutsideMain from "./page_outside/OutsideMain";

const Layout = () => {
  const devDisplay = import.meta.env.DEV;

  return (
    <div>
      {devDisplay && <GameBgTest />}
      <Modal />
      {/* <NavBar /> */}

      <main className='absolute-center flex-center'>
        <Outlet />
        {/* <OutsideMain /> */}
      </main>
    </div>
  );
};

export default Layout;
