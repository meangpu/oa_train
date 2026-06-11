# meRedMCoord

```bash
npm install react react-dom react-leaflet leaflet react-icons
```

เพิ่มอันนี้ลง CSS

```css
.leaflet-container {
  background-color: #3d3d3d !important;
}
```

เพิ่มอันนี้ลง Layout.tsx

```tsx
import { Outlet } from "react-router-dom";
import Modal from "./components/Modal";
import GameBgTest from "./components/GameBgTest";
import { GlobalCoordinatesTooltip } from "./components/meRedMCoord";
// import NavBar from "./components/Navbar";
// import OutsideMain from "./page_outside/OutsideMain";

const Layout = () => {
  const devDisplay = import.meta.env.DEV;

  return (
    <div>
      {devDisplay && <GameBgTest />}
      <Modal />
      <GlobalCoordinatesTooltip />
      {/* <NavBar /> */}
      <main className='absolute-center flex-center'>
        <Outlet />
        {/* <OutsideMain /> */}
      </main>
    </div>
  );
};

export default Layout;
```

เรื่องปุ่มแสดง coord และ tooltip minimap ที่กดได้ หลักๆ เรียกใช้ผ่าน

CoordinateButton - MessageWithCoordinates
แบบนี้

```tsx
// ตัวบอกว่า กดปุ่มแล้วทำอะไร
const MessageWithCoordinates: React.FC<
  Omit<MessageWithCoordinatesProps, "onCoordinateClick">
> = ({ message, className }) => {
  const onCoordinateClick = useCallback((coords: Coordinates) => {
    useGlobalModal.getState().hideModal();
    NuiProxy.call("RequestMarker", { coords });
  }, []);

  return (
    <MessageWithCoordinatesBase
      message={message}
      className={className}
      onCoordinateClick={onCoordinateClick}
    />
  );
};

export default React.memo(MessageWithCoordinates);

// ใน component ที่เป็น text ยาวๆ เรียกแบบนี้เอา คือ จะแปลง text ไปเป็นปุ่มให้ ถ้ามันตรงกับ format @[4000,1000,0] หรือ @ชื่อเมือง[4000,1000,0]
<MessageWithCoordinates message={message} />;
// จะแสดงเป็นปุ่มขึ้นมาที่เราชี้ และกดให้นำทางได้
```

ตอนแรกว่าจะใช้ท่า git และให้มันเป็น npm ไป install แต่ติดตรงที่ว่า tailwind css มันจะเพี้ยนเยอะ คือ มีปัญหากับเรื่องนั้น

ทางที่ง่ายกว่าคือ copy ทั้ง src ไปไว้ใน project เลย สร้าง folder ชื่อ

meredMCoord ละเอาทั้งหมดไปวาง

install by

```
npm install git+https://github.com/meangpu/meRedMCoord.git
```

ตอนที่เรา update script และต้องการ ให้ มัน update ใหม่ ให้เราใช้

```
npm install -- สำหรับครั้งแรกสุด
npm run build -- ทุกครั้งที่ update
```
