import { useEffect, useRef } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const DateSelector = ({ year, month, setMonth, setYear }) => {
  const swiperRef = useRef(null);

  useEffect(() => {
    swiperRef.current?.swiper.slideTo(month - 1, 0);
  }, []);

  // 선택한 달에 따라서 swiper 이동
  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slideTo(month - 1, 0);
    }
  }, [month]);

  const handleYear = (number) => {
    setYear((prev) => Math.max(prev + number, 1900));
  };

  const handleMonth = (number) => {
    setMonth(number + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-12 px-2.5 py-1 text-xl">
        <button onClick={() => handleYear(-1)}>{'<'}</button>
        <p className="md:text-lg lg:text-xl">{year}</p>
        <button onClick={() => handleYear(1)}>{'>'}</button>
      </div>
      {/* 월 선택 */}
      <div className="align-center my-3 flex items-center justify-center gap-1 text-base">
        <Swiper
          ref={swiperRef}
          slidesPerView={6}
          centeredSlides={true}
          spaceBetween={10}
          grabCursor={true}
          modules={[Pagination]}
          slideToClickedSlide={true}
          className="mySwiper h-full"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <SwiperSlide key={i} onClick={() => handleMonth(i)}>
              <div className="flex justify-center">
                <p
                  className={`m-auto p-2 ${i + 1 == month ? 'rounded-lg bg-primary-500 text-white' : 'text-slate-600'}`}
                >
                  {`${i + 1}`}월
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default DateSelector;
