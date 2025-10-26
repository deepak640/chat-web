import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { updateUser } from '../store/slices/authSlice';

const API_BASE_URL = '/v1/users';

const updateProfile = async (profileData: any) => {
  const { data } = await axios.put(`${API_BASE_URL}/profile`, profileData);
  return data;
};

export const useUpdateProfile = () => {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      dispatch(updateUser(data));
    },
  });
};
