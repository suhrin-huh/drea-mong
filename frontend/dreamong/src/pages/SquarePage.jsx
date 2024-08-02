import React from 'react';
import { useNavigate } from 'react-router-dom';

const SquarePage = () => {
    const navigate = useNavigate();

    // Dummy data
    const dreams = [
        { dreamId: 72, image: 'dream_image_uri1' },
        { dreamId: 207, image: 'dream_image_uri3' },
        { dreamId: 184, image: 'dream_image_uri4' },
        { dreamId: 171, image: 'dream_image_uri6' },
        { dreamId: 101, image: 'dream_image_uri7' },
        { dreamId: 102, image: 'dream_image_uri8' },
        { dreamId: 103, image: 'dream_image_uri9' },
        { dreamId: 104, image: 'dream_image_uri10' },
        { dreamId: 105, image: 'dream_image_uri11' },
        { dreamId: 106, image: 'dream_image_uri12' },
        { dreamId: 107, image: 'dream_image_uri13' },
        { dreamId: 108, image: 'dream_image_uri14' },
    ];

    const handleSquareClick = (dreamId) => {
        navigate(`/square/${dreamId}`);
    };

    return (
        <div>
            <div className="flex flex-wrap justify-around p-6 relative bg-[#222222]">
                {dreams.map(dream => (
                    <div
                        key={dream.dreamId}
                        className="w-40 h-40 mb-2 bg-gray-500 rounded-[30px] cursor-pointer"
                        onClick={() => handleSquareClick(dream.dreamId)}
                        style={{ backgroundImage: `url(${dream.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default SquarePage;
