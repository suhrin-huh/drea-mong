import React from 'react';

const StatisticsSkeletonPage = () => {
    return (
        <div className="w-full h-full bg-[#3a3a3a] flex flex-col justify-center items-center">
            <div className="w-full max-w-md h-full flex flex-col justify-start items-center p-5 bg-[#3a3a3a]">
                <div className="flex flex-col items-end justify-start w-full h-16 gap-1">
                    <div className="w-1/3 h-full shadow bg-neutral-500 rounded-2xl animate-pulse" />
                    <div className="w-3/5 h-full shadow bg-neutral-500 rounded-2xl animate-pulse" />
                </div>
                <div className="w-full flex-grow py-6 bg-[#3a3a3a] flex flex-col justify-end items-center gap-2.5">
                    <div className="w-full h-64 p-6 bg-[#646464] rounded-2xl flex flex-col justify-center items-center gap-2.5 animate-pulse">
                        <div className="w-4/5 h-10 shadow bg-neutral-500 rounded-3xl animate-pulse" />
                        <div className="w-4/5 h-10 shadow bg-neutral-500 rounded-3xl animate-pulse" />
                        <div className="w-4/5 h-10 shadow bg-neutral-500 rounded-3xl animate-pulse" />
                    </div>
                    <div className="w-full flex justify-start items-center gap-5 p-2.5">
                        <div className="w-1/2 h-40 p-5 bg-[#646464] rounded-2xl flex flex-col justify-end items-center gap-2.5 animate-pulse">
                            <div className="w-full h-8 shadow bg-neutral-500 rounded-2xl animate-pulse" />
                            <div className="w-full h-8 shadow bg-neutral-500 rounded-2xl animate-pulse" />
                        </div>
                        <div className="w-1/2 h-40 p-5 bg-[#646464] rounded-2xl flex flex-col justify-end items-center gap-2.5 animate-pulse">
                            <div className="w-full h-8 shadow bg-neutral-500 rounded-2xl animate-pulse" />
                            <div className="w-full h-8 shadow bg-neutral-500 rounded-2xl animate-pulse" />
                        </div>
                    </div>
                    <div className="w-full h-48 p-6 bg-[#646464] rounded-2xl flex flex-col justify-center items-center gap-2.5 animate-pulse">
                        <div className="flex items-center justify-center w-full gap-4 px-12">
                            <div className="w-1/3 h-6 shadow bg-neutral-500 rounded-2xl animate-pulse" />
                            <div className="w-1/3 h-6 shadow bg-neutral-500 rounded-2xl animate-pulse" />
                            <div className="w-1/3 h-6 shadow bg-neutral-500 rounded-2xl animate-pulse" />
                        </div>
                        <div className="w-full flex justify-center items-center gap-4 px-2.5">
                            <div className="w-1/4 h-6 shadow bg-neutral-500 rounded-2xl animate-pulse" />
                            <div className="w-1/4 h-6 shadow bg-neutral-500 rounded-2xl animate-pulse" />
                            <div className="w-1/4 h-6 shadow bg-neutral-500 rounded-2xl animate-pulse" />
                            <div className="w-1/4 h-6 shadow bg-neutral-500 rounded-2xl animate-pulse" />
                        </div>
                        <div className="flex items-center justify-center w-full gap-4 px-12">
                            <div className="w-1/3 h-6 shadow bg-neutral-500 rounded-2xl animate-pulse" />
                            <div className="w-1/3 h-6 shadow bg-neutral-500 rounded-2xl animate-pulse" />
                            <div className="w-1/3 h-6 shadow bg-neutral-500 rounded-2xl animate-pulse" />
                        </div>
                    </div>
                    <div className="w-full h-56 p-2.5 mt-4 bg-[#646464] rounded-2xl flex justify-center items-end gap-4">
                        <div className="h-16 shadow w-[12.5%] bg-neutral-500 animate-pulse" />
                        <div className="h-28 shadow w-[12.5%]  bg-neutral-500 animate-pulse" />
                        <div className="h-48 shadow w-[12.5%] bg-neutral-500 animate-pulse" />
                        <div className="h-40 shadow w-[12.5%] bg-neutral-500 animate-pulse" />
                        <div className="h-12 shadow w-[12.5%] bg-neutral-500 animate-pulse" />
                    </div> m
                </div>
            </div>
        </div>
    );
};

export default StatisticsSkeletonPage;
