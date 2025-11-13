import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL } from "./url.service";

const auth = {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
};

const getChats = async () => {
  const { data } = await axios.get(`${API_BASE_URL}/conversations/chats`, auth);
  return data;
};

const getUsers = async () => {
  const { data } = await axios.get(`${API_BASE_URL}/users`);
  return data;
};

const createChat = async (chatData: {
  participants: string[];
  isGroup?: boolean;
  name?: string;
}) => {
  const { data } = await axios.post(
    `${API_BASE_URL}/conversations/chats`,
    chatData,
    auth
  );
  return data;
};

const getConversationsById = async (conversationId: string) => {
  console.log(
    "🚀 ----------------------------------------------------------🚀"
  );
  console.log("🚀 ~ getConversationsById ~ conversationId:", conversationId);
  console.log(
    "🚀 ----------------------------------------------------------🚀"
  );
  const { data } = await axios.get(
    `${API_BASE_URL}/messages/${conversationId}`,
    auth
  );
  return data;
};

export const useGetChats = () => {
  return useQuery({
    queryKey: ["chats"],
    queryFn: () => getChats().then((res) => res.data),
  });
};

export const useGetUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};

export const useGetConversationById = (conversationId: string) => {
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => getConversationsById(conversationId).then((res) => res.data),
    enabled: !!conversationId,
  });
};
