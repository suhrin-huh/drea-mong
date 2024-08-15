import React from 'react';
import SkeletonBlock from './components/SkeletonBlock';

const StatisticsSkeletonPage = () => {
  const objectBlocks = [
    { width: '1/3', height: 'full', rounded: '2xl' },
    { width: '3/4', height: 'full', rounded: '2xl' },
  ];

  const characterBlocks = [
    { width: '4/5', height: '10', rounded: '2xl' },
    { width: '4/5', height: '10', rounded: '2xl' },
    { width: '4/5', height: '10', rounded: '2xl' },
  ];

  const locationBlocks = [
    { width: 'full', height: '8', rounded: '2xl' },
    { width: 'full', height: '8', rounded: '2xl' },
  ];

  const moodBlocks = [
    { width: '1/3', height: '6', rounded: '2xl' },
    { width: '1/3', height: '6', rounded: '2xl' },
    { width: '1/3', height: '6', rounded: '2xl' },
  ];

  const dreamTypeBlocks = [
    { width: '1/8', height: '16', rounded: '2xl' },
    { width: '1/8', height: '48', rounded: '2xl' },
    { width: '1/8', height: '36', rounded: '2xl' },
    { width: '1/8', height: '20', rounded: '2xl' },
    { width: '1/8', height: '36', rounded: '2xl' },
    { width: '1/8', height: '20', rounded: '2xl' },
  ];

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#3a3a3a]">
      <div className="flex h-full w-full max-w-md flex-col items-center justify-start bg-[#3a3a3a] p-5">
        <div className="flex w-full flex-grow flex-col items-center justify-end gap-2.5 bg-[#3a3a3a] py-6">
          <div className="flex h-64 w-full animate-pulse flex-col items-center justify-center gap-2.5 rounded-2xl bg-[#646464] p-6">
            {characterBlocks.map((block, index) => (
              <SkeletonBlock key={index} {...block} />
            ))}
          </div>
          <div className="flex w-full items-center justify-start gap-5 p-2.5">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="flex h-40 w-1/2 animate-pulse flex-col items-center justify-end gap-2.5 rounded-2xl bg-[#646464] p-5"
              >
                {locationBlocks.map((block, index) => (
                  <SkeletonBlock key={index} {...block} />
                ))}
              </div>
            ))}
          </div>
          <div className="flex h-48 w-full animate-pulse flex-col items-center justify-center gap-2.5 rounded-2xl bg-[#646464] p-6">
            <div className="flex w-full items-center justify-center gap-4 px-12">
              {moodBlocks.map((block, index) => (
                <SkeletonBlock key={index} {...block} />
              ))}
            </div>
            <div className="flex w-full items-center justify-center gap-4 px-2.5">
              {moodBlocks.map((block, index) => (
                <SkeletonBlock key={index} {...block} />
              ))}
            </div>
            <div className="flex w-full items-center justify-center gap-4 px-12">
              {moodBlocks.map((block, index) => (
                <SkeletonBlock key={index} {...block} />
              ))}
            </div>
          </div>
          <div className="mt-4 grid h-56 w-full grid-cols-6 items-end justify-center gap-4 rounded-2xl bg-[#646464] p-2.5">
            {dreamTypeBlocks.map((block, index) => (
              <SkeletonBlock key={index} {...block} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsSkeletonPage;
