import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";

const JoinCreateChat = () => {
    const [detail, setDetail] = useState({
        roomId: "",
        userName: "",
    });
    const [profileImage, setProfileImage] = useState(null);
    const { setConnected } = useChatContext();
    const navigate = useNavigate();

    // Handle form input changes
    const handleFormInputChange = (e) => {
        setDetail({
            ...detail,
            [e.target.name]: e.target.value,
        });
    };

    // Handle file change for profile image
    const handleFileChange = (e) => {
        setProfileImage(e.target.files[0]);
    };

    // Validate form inputs
    const validateForm = (isCreatingRoom) => {
        if (!detail.roomId || !detail.userName) {
            toast.error("Room ID and Username are required!");
            return false;
        }
        if (isCreatingRoom && !profileImage) {
            toast.error("Profile image is required to create a room!");
            return false;
        }
        return true;
    };

    // Create a room
    const createRoom = async () => {
        if (validateForm(true)) {
            try {
                const response = await createRoomApi(
                    detail.roomId,
                    detail.userName,
                    profileImage
                );

                toast.success("Room created successfully!");

                localStorage.setItem("roomId", response.roomId);
                localStorage.setItem("userName", response.userName);
                localStorage.setItem("profileImageUrl", response.profileImageUrl);
                localStorage.setItem("userProfiles", JSON.stringify(response.userProfiles));

                navigate("/chat");
            } catch (error) {
                toast.error(error.response?.data || "Error creating room");
            }
        }
    };

    // Join an existing room
    const joinRoom = async () => {
        if (validateForm(false)) {
            try {
                const response = await joinChatApi(
                    detail.roomId,
                    detail.userName,
                    profileImage
                );

                toast.success("Joined room successfully!");
                localStorage.setItem("roomId", response.roomId);
                localStorage.setItem("userName", response.userName);
                localStorage.setItem("userProfiles", JSON.stringify(response.userProfiles));

                navigate("/chat");
            } catch (error) {
                toast.error(error.response?.data || "Error joining room");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-200 to-gray-800 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-8 w-full max-w-lg">
                <h1 className="text-3xl font-bold text-center text-gray-700 dark:text-white mb-6">
                    Create or Join a Room
                </h1>

                {/* Username Input */}
                <div className="flex flex-col mb-4">
                    <label
                        htmlFor="userName"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Your Name
                    </label>
                    <input
                        type="text"
                        id="userName"
                        name="userName"
                        value={detail.userName}
                        onChange={handleFormInputChange}
                        placeholder="Enter your name"
                        className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                {/* Room ID Input */}
                <div className="flex flex-col mb-4">
                    <label
                        htmlFor="roomId"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Room ID
                    </label>
                    <input
                        type="text"
                        id="roomId"
                        name="roomId"
                        value={detail.roomId}
                        onChange={handleFormInputChange}
                        placeholder="Enter room ID"
                        className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                {/* Profile Image Upload */}
                <div className="flex flex-col mb-6">
                    <label
                        htmlFor="profileImage"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Upload Profile Image
                    </label>
                    <input
                        type="file"
                        id="profileImage"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        * Profile image is required for creating a new room
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex justify-between mt-6">
                    <button
                        onClick={createRoom}
                        className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-2 px-6 rounded-full shadow-md hover:scale-105 transform transition-transform"
                    >
                        Create Room
                    </button>
                    <button
                        onClick={joinRoom}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-6 rounded-full shadow-md hover:scale-105 transform transition-transform"
                    >
                        Join Room
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinCreateChat;
