import React, { useEffect, useState } from 'react';
import './InstaCarousel.css';

const images = [
    "/images/insta_frame_images/1.png",
    "/images/insta_frame_images/2.png",
    "/images/insta_frame_images/3.png",
    "/images/insta_frame_images/4.png",
    "/images/insta_frame_images/5.png",
    "/images/insta_frame_images/6.png",
    "/images/insta_frame_images/7.png",
];

const InstaCarousel = () => {
    const [centerIndex, setCenterIndex] = useState(2);

    useEffect(() => {
        const interval = setInterval(() => {
            setCenterIndex(prev => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Generate position classes for 5 visible images
    const getPosition = (i: number): number | null => {
        const total = images.length;
        const offset = (i - centerIndex + total) % total;

        if (offset === total - 3) return -3; // far left
        if (offset === total - 2) return -2; // far left
        if (offset === total - 1) return -1; // left
        if (offset === 0) return 0;         // center
        if (offset === 1) return 1;         // right
        if (offset === 2) return 2;         // far right
        if (offset === 3) return 3;         // far right

        return null; // hide others
    };

    return (
        <div className="insta-carousel-container">
            {images.map((src, i) => {
                const pos = getPosition(i);
                return pos !== null ? (
                    <img
                        key={i}
                        src={src}
                        alt={`img${i}`}
                        className={`insta-carousel-image insta-carousel-pos-${pos}`}
                    />
                ) : null;
            })}
        </div>
    );
};

export default InstaCarousel;
