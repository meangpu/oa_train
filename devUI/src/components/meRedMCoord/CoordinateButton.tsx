import React, { useCallback, useMemo } from "react";
import { IoMdPin } from "react-icons/io";
import { distanceFromPlayerText, distanceFromPlayerTextStyle } from "./types";
import type { CoordinateButtonProps } from "./types";
import useGlobalVar from "@/services/GlobalVar";
import useCoordTooltipStore from "./useCoordTooltipStore";

const CoordinateButton = React.memo(
  ({
    coords,
    cityName,
    isCityCoordinate,
    match,
    showDistance = true,
    onCoordinateClick,
    onCoordinateCtrlRightClick,
  }: CoordinateButtonProps) => {
    const playerLocation = useGlobalVar(
      useCallback(
        (state) => (showDistance ? state.playerLocation : null),
        [showDistance]
      )
    );

    const distanceText = useMemo(() => {
      if (!showDistance) return null;
      if (!playerLocation) return null;
      return distanceFromPlayerText(coords);
    }, [showDistance, playerLocation, coords]);

    const distanceStyle = useMemo(() => {
      if (!showDistance) return null;
      if (!playerLocation) return null;
      return distanceFromPlayerTextStyle(coords);
    }, [showDistance, playerLocation, coords]);

    const handleClick = useCallback(() => {
      onCoordinateClick?.(coords, { match, cityName, isCityCoordinate });
    }, [coords, match, cityName, isCityCoordinate, onCoordinateClick]);

    const handleContextMenu = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!e.ctrlKey) return;
        e.preventDefault();
        onCoordinateCtrlRightClick?.(coords, {
          match,
          cityName,
          isCityCoordinate,
        });
      },
      [coords, match, cityName, isCityCoordinate, onCoordinateCtrlRightClick]
    );

    const showCoordTooltip = useCoordTooltipStore((s) => s.show);
    const moveCoordTooltip = useCoordTooltipStore((s) => s.move);
    const hideCoordTooltip = useCoordTooltipStore((s) => s.hide);

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        showCoordTooltip(coords, { x: e.clientX, y: e.clientY });
      },
      [coords, showCoordTooltip]
    );

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        moveCoordTooltip({ x: e.clientX, y: e.clientY });
      },
      [moveCoordTooltip]
    );

    const handleMouseLeave = useCallback(() => {
      hideCoordTooltip();
    }, [hideCoordTooltip]);

    return (
      <button
        className={`inline-flex items-center px-1 py-0.5 mx-0.5 rounded text-grey text-[10px] hover:opacity-35 border border-grey-more bg-grey-more-more-more ${
          isCityCoordinate ? "  uppercase font-bold" : ""
        }`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        type='button'
      >
        <span className='flex items-center -gap-1'>
          <IoMdPin />
          {isCityCoordinate ? cityName : match.replace("@", "")}
          <span
            className='text-white bg-grey-more ml-1 px-1 rounded font-bold'
            style={distanceStyle ?? undefined}
          >
            {distanceText}
          </span>
        </span>
      </button>
    );
  }
);

export default CoordinateButton;
