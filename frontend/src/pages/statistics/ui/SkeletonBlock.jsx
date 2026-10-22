import React from 'react';

const SkeletonBlock = ({ width = 'full', height, rounded = '2xl', extraClasses = '' }) => {
    const baseClasses = `shadow bg-neutral-500 animate-pulse ${extraClasses}`;
    return (
        <div className={`w-${width} h-${height} ${baseClasses} rounded-${rounded}`} />
    );
};

export default SkeletonBlock;
