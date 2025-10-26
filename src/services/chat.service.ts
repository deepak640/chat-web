import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = '/v1';

const getChats = async () => {
  const { data } = await axios.get(`${API_BASE_URL}/chats`);
  return data;
};

const getUsers = async () => {
  const { data } = await axios.get(`${API_BASE_URL}/users`);
  return data;
};

const createChat = async (chatData: { participants: string[], isGroup?: boolean, name?: string }) => {
  const { data } = await axios.post(`${API_BASE_URL}/chats`, chatData);
  return data;
};

export const useGetChats = () => {
  return useQuery({
    queryKey: ['chats'],
    queryFn: getChats,
  });
};

export const useGetUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
};
