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
        { width: '1/6', height: '16', rounded: '2xl' },
        { width: '1/6', height: '48', rounded: '2xl' },
        { width: '1/6', height: '40', rounded: '2xl' },
        { width: '1/6', height: '24', rounded: '2xl' },
        { width: '1/6', height: '16', rounded: '2xl' },
        { width: '1/6', height: '24', rounded: '2xl' },
    ];

    return (
        <div className="w-full h-full bg-[#3a3a3a] flex flex-col justify-center items-center">
            <div className="w-full max-w-md h-full flex flex-col justify-start items-center p-5 bg-[#3a3a3a]">
                <div className="flex flex-col items-end justify-start w-full h-16 gap-1">
                    {objectBlocks.map((block, index) => (
                        <SkeletonBlock key={index} {...block} />
                    ))}
                </div>
                <div className="w-full flex-grow py-6 bg-[#3a3a3a] flex flex-col justify-end items-center gap-2.5">
                    <div className="w-full h-64 p-6 bg-[#646464] rounded-2xl flex flex-col justify-center items-center gap-2.5 animate-pulse">
                        {characterBlocks.map((block, index) => (
                            <SkeletonBlock key={index} {...block} />
                        ))}
                    </div>
                    <div className="w-full flex justify-start items-center gap-5 p-2.5">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="w-1/2 h-40 p-5 bg-[#646464] rounded-2xl flex flex-col justify-end items-center gap-2.5 animate-pulse">
                                {locationBlocks.map((block, index) => (
                                    <SkeletonBlock key={index} {...block} />
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="w-full h-48 p-6 bg-[#646464] rounded-2xl flex flex-col justify-center items-center gap-2.5 animate-pulse">
                        <div className="flex items-center justify-center w-full gap-4 px-12">
                            {moodBlocks.map((block, index) => (
                                <SkeletonBlock key={index} {...block} />
                            ))}
                        </div>
                        <div className="w-full flex justify-center items-center gap-4 px-2.5">
                            {moodBlocks.map((block, index) => (
                                <SkeletonBlock key={index} {...block} />
                            ))}
                        </div>
                        <div className="flex items-center justify-center w-full gap-4 px-12">
                            {moodBlocks.map((block, index) => (
                                <SkeletonBlock key={index} {...block} />
                            ))}
                        </div>
                    </div>
                    <div className="w-full h-56 p-2.5 mt-4 bg-[#646464] rounded-2xl flex justify-center items-end gap-4">
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
