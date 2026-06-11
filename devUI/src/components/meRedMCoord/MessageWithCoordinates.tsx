import React, { useMemo, useCallback, useEffect, useRef } from "react";
import type {
  CoordinateClickContext,
  Coordinates,
  MessageWithCoordinatesProps,
} from "./types";
import CoordinateButton from "./CoordinateButton";

const COORDINATE_PATTERN =
  /@(?:\$\{([^}]+)\}|([^[\s]+))?\[([+-]?\d*\.?\d+),([+-]?\d*\.?\d+),([+-]?\d*\.?\d+)\]/g;
const COORDINATE_PATTERN_SINGLE =
  /@(?:\$\{([^}]+)\}|([^[\s]+))?\[([+-]?\d*\.?\d+),([+-]?\d*\.?\d+),([+-]?\d*\.?\d+)\]/;

type ParsedPart =
  | { type: "text"; text: string; key: string }
  | { type: "errorText"; text: string; key: string }
  | {
      type: "coord";
      key: string;
      coords: Coordinates;
      cityName?: string;
      isCityCoordinate: boolean;
      match: string;
    };

function parseCoordinates(text: string): {
  hasCoordinates: boolean;
  parts: ParsedPart[];
} {
  const coordinateMatches = text.match(COORDINATE_PATTERN);

  if (!coordinateMatches) {
    return {
      hasCoordinates: false,
      parts: [
        {
          type: "text",
          key: "text-0",
          text,
        },
      ],
    };
  }

  const placeholders: string[] = [];
  const processedText = text.replace(COORDINATE_PATTERN, (match) => {
    const placeholder = `__COORD_PLACEHOLDER_${placeholders.length}__`;
    placeholders.push(match);
    return placeholder;
  });

  const textParts = processedText.split(/__COORD_PLACEHOLDER_\d+__/);
  const parts: ParsedPart[] = [];
  let placeholderIndex = 0;

  for (let i = 0; i < textParts.length; i++) {
    const textPart = textParts[i];

    if (textPart && textPart.trim()) {
      parts.push({
        type: "text",
        key: `text-${i}`,
        text: textPart,
      });
    }

    if (i < textParts.length - 1 && placeholders[placeholderIndex]) {
      const match = placeholders[placeholderIndex];
      const coordMatch = match.match(COORDINATE_PATTERN_SINGLE);

      if (coordMatch) {
        try {
          const coords: Coordinates = {
            x: parseFloat(coordMatch[3]),
            y: parseFloat(coordMatch[4]),
            z: parseFloat(coordMatch[5]),
          };

          const cityName = coordMatch[1] || coordMatch[2];
          const isCityCoordinate = !!cityName;

          parts.push({
            type: "coord",
            key: `coord-${i}`,
            coords,
            cityName,
            isCityCoordinate,
            match,
          });
        } catch (error) {
          console.warn("Failed to parse coordinates:", match, error);
          parts.push({
            type: "errorText",
            key: `coord-fallback-${i}`,
            text: match,
          });
        }
      }

      placeholderIndex++;
    }
  }

  return {
    hasCoordinates: true,
    parts,
  };
}

const MessageWithCoordinates: React.FC<MessageWithCoordinatesProps> = ({
  message,
  className = "mb-2 break-words whitespace-pre-wrap text-left select-text! text-bg-grey",
  onCoordinateClick,
}) => {
  const onCoordinateClickRef = useRef(onCoordinateClick);
  useEffect(() => {
    onCoordinateClickRef.current = onCoordinateClick;
  }, [onCoordinateClick]);

  const stableOnCoordinateClick = useCallback(
    (coords: Coordinates, context: CoordinateClickContext) => {
      onCoordinateClickRef.current?.(coords, context);
    },
    []
  );

  const parsedMessage = useMemo(() => parseCoordinates(message), [message]);

  const renderTextWithNewlines = useCallback((text: string) => {
    const lines = text.split("\n");
    if (lines.length <= 1) return text;

    return lines.map((line, idx) => (
      <React.Fragment key={`line-${idx}`}>
        {idx > 0 ? <br /> : null}
        {line}
      </React.Fragment>
    ));
  }, []);

  return (
    <div className={className}>
      {parsedMessage.parts.map((part) => {
        if (part.type === "text") {
          return (
            <span key={part.key}>{renderTextWithNewlines(part.text)}</span>
          );
        }

        if (part.type === "errorText") {
          return (
            <span key={part.key} className='text-red'>
              {renderTextWithNewlines(part.text)}
            </span>
          );
        }

        return (
          <CoordinateButton
            key={part.key}
            coords={part.coords}
            cityName={part.cityName}
            isCityCoordinate={part.isCityCoordinate}
            match={part.match}
            onCoordinateClick={stableOnCoordinateClick}
          />
        );
      })}
    </div>
  );
};

export default React.memo(MessageWithCoordinates);
