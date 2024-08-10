// React 관련 패키지
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// 앱 내부의 상태 관리와 관련된 파일
import { useRecoilState, useRecoilValue } from 'recoil';
import { baseURLState, isListeningState, userState } from '../../recoil/atoms';

// 외부 라이브러리
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';
import axios from 'axios';

const DreamRegisterPage = () => {
  return <div></div>;
};

export default DreamRegisterPage;
