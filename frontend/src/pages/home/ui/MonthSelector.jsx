import { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const MonthSelector = ({ month, setMonth }) => {
  const swiperRef = useRef(null);

  useEffect(() => {
    swiperRef.current?.slideTo(month - 1, 0);
  }, [month]);

  return (
    <div className="min-w-0 shrink-0 px-3 pb-2" role="group" aria-label="월 선택">
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        initialSlide={month - 1}
        slidesPerView={6}
        centeredSlides
        spaceBetween={8}
        grabCursor
        slideToClickedSlide
      >
        {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
          <SwiperSlide key={value}>
            <button
              type="button"
              aria-label={`${value}월`}
              aria-pressed={value === month}
              onClick={() => setMonth(value)}
              className={`h-10 w-full whitespace-nowrap rounded-lg text-base focus-visible:outline-primary-500 ${value === month ? 'bg-primary-500 text-white' : 'text-slate-600'}`}
            >
              {value}월
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default MonthSelector;
