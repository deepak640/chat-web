import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login as loginAction } from "../store/slices/authSlice";
const API_BASE_URL = "/v1/users";

const auth = {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
};

// Functions
const login = async (credentials: any) => {
  const { data } = await axios.post(`${API_BASE_URL}/login`, credentials);
  return data;
};

const register = async (userData: any) => {
  const { data } = await axios.post(`${API_BASE_URL}/register`, userData);
  return data;
};

const getUserList = async (Obj: any) => {
  const query = new URLSearchParams(Obj).toString();
  const { data } = await axios.get(`${API_BASE_URL}/list?${query}`, auth);
  return data;
};

// Hooks
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

export const useGetUserList = (Obj: any) => {
  return useQuery({
    queryKey: ["userList", Obj],
    queryFn: () => getUserList(Obj).then((res) => res.data),
  });
};
