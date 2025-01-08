import { httpClient } from "../config/AxiosHelper";

export const createRoomApi = async (roomId, userName, profileImage) => {
  const formData = new FormData();
  formData.append("roomId", roomId);
  formData.append("userName", userName);
  formData.append("profileImage", profileImage);

  try {
      const response = await httpClient.post("/api/v1/rooms/create", formData, {
          headers: {
              "Content-Type": "multipart/form-data",
          },
      });

      // Store room details in localStorage
      localStorage.setItem("roomId", response.data.roomId);
      localStorage.setItem("userName", response.data.userName);
      localStorage.setItem("profileImageUrl", response.data.profileImageUrl);

      return response.data;
  } catch (error) {
      console.error("Error creating room:", error);
      throw error;
  }
};



export const joinChatApi = async (roomId, userName, profileImage = null) => {
  const formData = new FormData();
  formData.append("roomId", roomId);
  formData.append("userName", userName);
  if (profileImage) {
      formData.append("profileImage", profileImage);
  }

  const response = await httpClient.post("/api/v1/rooms/join", formData, {
      headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};


export const getMessagess = async (roomId,size=50,page=1) => {
  const response = await httpClient.get(`/api/v1/rooms/${roomId}/messages?size=${size}&page=${page}`);
  return response.data;
};

// Add logout function
export const logout = () => {
  localStorage.clear(); // Clear all localStorage items
};