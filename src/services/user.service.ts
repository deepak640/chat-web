
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login as loginAction } from '../store/slices/authSlice';
const API_BASE_URL = '/v1/users';
const login = async (credentials: any) => {
  const { data } = await axios.post(`${API_BASE_URL}/login`, credentials);
  return data;
};

const register = async (userData: any) => {
  const { data } = await axios.post(`${API_BASE_URL}/register`, userData);
  return data;
};

export const useLogin = () => {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      dispatch(loginAction(data));
    },
  });
};

export const useRegister = () => {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      dispatch(loginAction(data));
    },
  });
};
