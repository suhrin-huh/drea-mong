// 외부 라이브러리
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';
import { useEffect } from 'react';

import { dateState } from '../../../recoil/dream/atom';
import { useRecoilState } from 'recoil';
import { replaceDateType } from '../../../utils/formatter';

const DatePicker = ({ initial }) => {
  const [date, setDate] = useRecoilState(dateState);

  useEffect(() => {
    const current = replaceDateType(new Date());
    if (initial) {
      setDate(initial);
    } else {
      setDate(current);
    }
  }, []);

  const handleDate = (event) => {
    const selected = event.target.value;
    if (selected > current) {
      Swal.fire({
        title: 'ERROR',
        text: '일기는 현재 또는 과거의 날짜에 대해서만 작성할 수 있습니다.',
        icon: 'error',
        confirmButtonText: '확인',
      });
      return;
    }
    setDate(selected);
  };

  return (
    <div className="my-1 flex justify-center rounded-lg">
      <input
        value={date}
        type="date"
        onChange={(e) => handleDate(e)}
        className="bg-inherit text-center md:text-base lg:text-lg"
      />
    </div>
  );
};

export default DatePicker;
