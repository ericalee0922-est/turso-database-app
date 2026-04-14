import React from 'react';

export default function StardewTitle() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-full md:max-w-3xl mb-4 px-4">
      <img
        src="/title_transparent.png"
        alt="One Edition Farm"
        className="w-full h-auto object-contain drop-shadow-md"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
