import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import usersApi from '@/shared/api/modules/users.api';
import dreamsApi from '@/shared/api/modules/dreams.api';
import { userState } from '@/entities/user';

const useHomeDreams = (year, month) => {
  const [dreams, setDreams] = useState([]);
  const [user, setUser] = useRecoilState(userState);
  const [totalCount, setTotalCount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const getDreams = async () => {
      setIsLoading(true);
      try {
        const userResponse = await usersApi.getUserInfo({ signal: controller.signal });
        const userInfo = userResponse.data.data;
        const dreamResponse = await dreamsApi.getMonthlyDreams(
          userInfo.userId,
          `${year}${String(month).padStart(2, '0')}01`,
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        setUser(userInfo);
        setDreams(dreamResponse.data.data.dreamMainResponsesList);
        setTotalCount(dreamResponse.data.data.totalCount);
      } catch (error) {
        if (!controller.signal.aborted) {
          navigate(error.response?.status === 401 ? '/login' : '/error');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    getDreams();
    return () => controller.abort();
  }, [year, month, navigate, setUser]);

  return { dreams, user, totalCount, isLoading };
};

export default useHomeDreams;
