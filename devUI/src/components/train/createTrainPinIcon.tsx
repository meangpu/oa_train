import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { FaTrain } from "react-icons/fa";

export function createTrainPinIcon(label: string, selected = false) {
  const color = selected ? "#f5c542" : "#e8d4a8";

  const iconMarkup = renderToStaticMarkup(
    <div className='relative w-[22px] h-[22px]'>
      <div
        className='text-[8px] absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1 rounded'
        style={{
          color,
          textShadow: "0 0 3px rgba(0,0,0,0.9)",
        }}
      >
        {label}
      </div>
      <FaTrain
        style={{
          color,
          fontSize: "18px",
          filter: "drop-shadow(0 0 2px rgba(0,0,0,0.9))",
        }}
      />
    </div>
  );

  return L.divIcon({
    html: iconMarkup,
    className: "train-pin-icon",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  });
}
