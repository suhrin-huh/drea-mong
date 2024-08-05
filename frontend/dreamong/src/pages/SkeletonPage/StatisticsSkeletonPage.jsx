import React from 'react';
import SkeletonBlock from './components/SkeletonBlock';

const StatisticsSkeletonPage = () => {
    return (
        <div className="w-full h-full bg-[#3a3a3a] flex flex-col justify-center items-center">
            <div className="w-full max-w-md h-full flex flex-col justify-start items-center p-5 bg-[#3a3a3a]">
                <div className="flex flex-col items-end justify-start w-full h-16 gap-1">
                    <SkeletonBlock width="1/3" height="full" />
                    <SkeletonBlock width="3/5" height="full" />
                </div>
                <div className="w-full flex-grow py-6 bg-[#3a3a3a] flex flex-col justify-end items-center gap-2.5">
                    <div className="w-full h-64 p-6 bg-[#646464] rounded-2xl flex flex-col justify-center items-center gap-2.5 animate-pulse">
                        <SkeletonBlock width="4/5" height="10" rounded="3xl" />
                        <SkeletonBlock width="4/5" height="10" rounded="3xl" />
                        <SkeletonBlock width="4/5" height="10" rounded="3xl" />
                    </div>
                    <div className="w-full flex justify-start items-center gap-5 p-2.5">
                        <div className="w-1/2 h-40 p-5 bg-[#646464] rounded-2xl flex flex-col justify-end items-center gap-2.5 animate-pulse">
                            <SkeletonBlock width="full" height="8" />
                            <SkeletonBlock width="full" height="8" />
                        </div>
                        <div className="w-1/2 h-40 p-5 bg-[#646464] rounded-2xl flex flex-col justify-end items-center gap-2.5 animate-pulse">
                            <SkeletonBlock width="full" height="8" />
                            <SkeletonBlock width="full" height="8" />
                        </div>
                    </div>
                    <div className="w-full h-48 p-6 bg-[#646464] rounded-2xl flex flex-col justify-center items-center gap-2.5 animate-pulse">
                        <div className="flex items-center justify-center w-full gap-4 px-12">
                            <SkeletonBlock width="1/3" height="6" />
                            <SkeletonBlock width="1/3" height="6" />
                            <SkeletonBlock width="1/3" height="6" />
                        </div>
                        <div className="w-full flex justify-center items-center gap-4 px-2.5">
                            <SkeletonBlock width="1/4" height="6" />
                            <SkeletonBlock width="1/4" height="6" />
                            <SkeletonBlock width="1/4" height="6" />
                            <SkeletonBlock width="1/4" height="6" />
                        </div>
                        <div className="flex items-center justify-center w-full gap-4 px-12">
                            <SkeletonBlock width="1/3" height="6" />
                            <SkeletonBlock width="1/3" height="6" />
                            <SkeletonBlock width="1/3" height="6" />
                        </div>
                    </div>
                    <div className="w-full h-56 p-2.5 mt-4 bg-[#646464] rounded-xl flex justify-center items-end gap-4">
                        <SkeletonBlock width="1/6" height="16" />
                        <SkeletonBlock width="1/6" height="28" />
                        <SkeletonBlock width="1/6" height="48" />
                        <SkeletonBlock width="1/6" height="40" />
                        <SkeletonBlock width="1/6" height="12" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsSkeletonPage;
