import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { RootState } from '@/store/store';

const RedirectIfAuthenticated = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  console.log("🚀 ---------------------------------------------------------------🚀")
  console.log("🚀 ~ RedirectIfAuthenticated ~ isAuthenticated:", isAuthenticated)
  console.log("🚀 ---------------------------------------------------------------🚀")

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

export default RedirectIfAuthenticated;
