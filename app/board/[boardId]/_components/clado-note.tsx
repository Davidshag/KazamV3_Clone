import { Kalam } from "next/font/google";
import { useState } from 'react';

import { cn, colorToCSS, getContrastingTextColor } from "@/lib/utils";
import { useMutation } from "@/liveblocks.config";
import type { CladoNoteLayer } from "@/types/canvas";

const font = Kalam({
  subsets: ["latin"],
  weight: ["400"],
});

const calculateFontSize = (width: number, height: number) => {
  const maxFontSize = 96;
  const scaleFactor = 0.15;
  const fontSizeBasedOnHeight = height * scaleFactor;
  const fontSizeBasedOnWidth = width * scaleFactor;

  return Math.min(fontSizeBasedOnHeight, fontSizeBasedOnWidth, maxFontSize);
};

type CladoNoteProps = {
  id: string;
  layer: CladoNoteLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
};

export const CladoNote = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: CladoNoteProps) => {
  const { x, y, width, height, fill, value } = layer;
  const [inputValue, setInputValue] = useState(value || "");

  const updateValue = useMutation(({ storage }, newValue: string) => {
    const liveLayers = storage.get("layers");
    liveLayers.get(id)?.set("value", newValue);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearch = () => {
    // TODO: Implement Clado API call
    console.log("Searching for:", inputValue);
    updateValue(inputValue);
  };

  return (
    <foreignObject
      x={x}
      y={y}
      width={width}
      height={height}
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        outline: selectionColor ? `1px solid ${selectionColor}` : "none",
        backgroundColor: fill ? colorToCSS(fill) : "#000",
      }}
      className="shadow-md drop-shadow-xl p-4"
    >
      <div className="h-full w-full flex flex-col items-center justify-center">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className={cn(
            "w-full text-center bg-transparent outline-none",
            font.className
          )}
          style={{
            fontSize: calculateFontSize(width, height - 40),
            color: fill ? getContrastingTextColor(fill) : "#000",
          }}
          placeholder="Enter name..."
        />
        <button
          onClick={handleSearch}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Deep Search
        </button>
      </div>
    </foreignObject>
  );
};
