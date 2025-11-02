import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useDispatch } from "react-redux";
import { updateUser } from "../store/slices/authSlice";
import { API_BASE_URL as BASE_URL } from "./url.service";

const API_BASE_URL = `${BASE_URL}/users`;

const updateProfile = async ({ profileData, id }: any) => {
  const { data } = await axios.patch(`${API_BASE_URL}/${id}`, profileData);
  return data;
};

const userById = async (id: string) => {
  const { data } = await axios.get(`${API_BASE_URL}/${id}`);
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

export const useFetchUserById = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => userById(id).then((res) => res.data),
  });
};
