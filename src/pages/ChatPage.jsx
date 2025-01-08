import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { getMessagess } from "../services/RoomService";
import { timeAgo } from "../config/helper";
import { baseURL } from "../config/AxiosHelper";

const ChatPage = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState(localStorage.getItem("roomId"));
    const [userName, setUserName] = useState(localStorage.getItem("userName"));
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const chatBoxRef = useRef(null);
    const [stompClient, setStompClient] = useState(null);
    const [userProfiles, setUserProfiles] = useState(
        JSON.parse(localStorage.getItem("userProfiles")) || []
    );

    useEffect(() => {
        const profiles = JSON.parse(localStorage.getItem("userProfiles"));
        setUserProfiles(profiles || []);
    }, []);

    const getUserProfileImage = (sender) => {
        const profile = userProfiles.find((profile) => profile.userName === sender);
        return profile?.profileImageUrl
            ? `${baseURL}${profile.profileImageUrl}`
            : "https://via.placeholder.com/50";
    };

    useEffect(() => {
        if (!roomId || !userName) {
            navigate("/");
        }
    }, [roomId, userName, navigate]);

    useEffect(() => {
        if (roomId && connected) {
            const loadMessages = async () => {
                try {
                    const messages = await getMessagess(roomId);
                    setMessages(messages);
                } catch (error) {
                    console.error("Error loading messages:", error);
                }
            };
            loadMessages();
        }
    }, [roomId, connected]);

    useEffect(() => {
        if (roomId && userName) {
            const sock = new SockJS(`${baseURL}/chat`);
            const client = Stomp.over(sock);

            client.connect({}, () => {
                setConnected(true);
                setStompClient(client);
                toast.success("Connected to chat!");

                client.subscribe(`/topic/room/${roomId}`, (message) => {
                    const newMessage = JSON.parse(message.body);
                    setMessages((prev) => [...prev, newMessage]);
                });
            });

            return () => {
                client.disconnect(() => {
                    console.log("Disconnected from chat");
                });
            };
        }
    }, [roomId, userName]);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scroll({
                top: chatBoxRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    const sendMessage = () => {
        if (stompClient && connected && input.trim()) {
            const message = { sender: userName, content: input, roomId };
            stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
            setInput("");
        }
    };

    const handleLogOut = () => {
        if (stompClient) stompClient.disconnect();
        setConnected(false);
        localStorage.clear();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-200 to-gray-800 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="fixed w-full shadow-lg bg-gradient-to-r from-blue-500 via-purple-600 to-red-500 text-white flex justify-between items-center p-4 md:px-8">
                <div className="flex items-center space-x-3 text-xl font-bold">
                    <span>Room:</span>
                    <span className="bg-yellow-300 text-gray-800 px-3 py-1 rounded-full shadow-lg">
                        {roomId}
                    </span>
                </div>
                <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-sm md:text-lg font-medium px-6 py-3 rounded-full shadow-md">
                    Username: <span className="font-bold text-yellow-300">{userName}</span>
                </div>
                <button
                    onClick={handleLogOut}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:scale-105 transition-transform duration-300 text-white font-bold px-5 py-2 rounded-full shadow-md"
                >
                    Log Out
                </button>
            </header>

            {/* Chat Messages */}
            <main
                ref={chatBoxRef}
                className="pt-20 px-10 w-full lg:w-2/3 mx-auto h-[calc(100vh-100px)] overflow-auto scrollbar-hide"
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.sender === userName ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`my-2 p-4 rounded-lg max-w-xs shadow-md ${message.sender === userName
                                ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                                : "bg-gradient-to-r from-gray-700 to-gray-800 text-white"
                                }`}
                        >
                            <div className="flex gap-3 items-center">
                                <img
                                    className="h-10 w-10 rounded-full"
                                    src={getUserProfileImage(message.sender)}
                                    alt={`${message.sender}'s Profile`}
                                />
                                <div>
                                    <p className="font-bold">{message.sender}</p>
                                    <p>{message.content}</p>
                                    <p className="text-xs text-gray-300">{timeAgo(message.timeStamp)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </main>


            {/* Input Area */}
            <div className="fixed bottom-4 w-full flex justify-center">
                <div className="flex items-center gap-4 w-3/4 lg:w-1/2 p-3 bg-gray-900 rounded-full shadow-lg">
                    <input
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        type="text"
                        placeholder="Type your message..."
                        className="w-full bg-gray-800 text-white px-4 py-2 rounded-full focus:outline-none"
                    />
                    <button
                        onClick={() => toast.success("Feature coming soon!")}
                        className="flex justify-center items-center bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full"
                    >
                        <MdAttachFile size={25} />
                    </button>
                    <button
                        onClick={sendMessage}
                        className="flex justify-center items-center bg-green-600 hover:bg-green-700 text-white p-3 rounded-full"
                    >
                        <MdSend size={25} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
