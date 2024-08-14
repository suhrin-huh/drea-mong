import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AUTHIMG from '../assets/404.png';
import NOTIMG from '../assets/500.png';
const ErrorPage = () => {
  const location = useLocation();
  if (location.pathname == '/error')
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-center text-white">
        <img src={NOTIMG} className="block w-72"></img>
        <p className="text-2xl font-extrabold">An error occured</p>
        <p>
          오류가 발생하였습니다. <br />
          이용에 불편함을 드려 죄송합니다.
        </p>
        <Link to="/">
          <button className="rounded-full border border-white px-5 py-3">Go Home</button>
        </Link>
      </div>
    );

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-5 text-white">
      <img src={AUTHIMG} className="block w-72"></img>
      <p className="text-2xl font-extrabold">Page is not founded</p>
      <Link to="/">
        <button className="rounded-full border border-white px-5 py-2">Go Home</button>
      </Link>
    </div>
  );
};

export default ErrorPage;
