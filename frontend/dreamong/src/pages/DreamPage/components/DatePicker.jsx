// 외부 라이브러리
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';

// 앱 내부의 컴포넌트/아이콘

/** - 미래의 날짜 선택시 오류 반환
 * - 선택되는 날짜는 Date 형식이므로 yyyy-mm-dd로 변경
 */
const DatePicker = ({ date, setDate, replaceDateType }) => {
  const handleDate = (event) => {
    const current = replaceDateType(new Date());
    const selected = event.target.value;
    selected <= current
      ? setDate(selected)
      : Swal.fire({
          title: 'ERROR',
          text: '일기는 현재 또는 과거의 날짜에 대해서만 작성할 수 있습니다.',
          icon: 'error',
          confirmButtonText: '확인',
        });
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
