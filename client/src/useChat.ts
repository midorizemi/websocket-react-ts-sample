import { useEffect, useRef, useState } from "react";
import socketIOClient, { Socket } from "socket.io-client";

const NEW_CHAT_MESSAGE_EVENT = "newChatMessage"; // Name of the event
const ALL_CHAT_MESSAGE_EVENT = "greeting";
const SOCKET_SERVER_URL = "http://localhost:4000";

const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<
    Array<{
      body?: string;
      senderId?: string;
      ownedByCurrentUser?: string;
      postedAt?: string;
    }>
  >([]); // Sent and received messages
  const socketRef = useRef<Socket>();
  const mounted = useRef(false);

  useEffect(() => {
    // Creates a WebSocket connection
    socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
      query: { roomId },
    });

    // Listens for incoming messages
    socketRef.current.on(NEW_CHAT_MESSAGE_EVENT, (message) => {
      const incomingMessage = {
        ...message,
        ownedByCurrentUser: message.senderId === socketRef.current?.id,
      };
      setMessages((messages) => [...messages, incomingMessage]);
    });
    socketRef.current.on(ALL_CHAT_MESSAGE_EVENT, (_messages) => {
      if (!mounted.current) {
        const incomingMessages = _messages.map((m: any, i: number) => {
          return {
            ...m,
            ownedByCurrentUser: m.senderId === socketRef.current?.id,
          };
        });
        setMessages((messages) => [...messages, ...incomingMessages]);
        mounted.current = true;
      }
    });

    // Destroys the socket reference
    // when the connection is closed
    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  // Sends a message to the server that
  // forwards it to all users in the same room
  const sendMessage = (messageBody: string) => {
    socketRef.current?.emit(NEW_CHAT_MESSAGE_EVENT, {
      body: messageBody,
      senderId: socketRef.current.id,
      postedAt: Date.now(),
    });
  };

  // 保存されたメッセージ一覧を取得する
  const getLatestMessages = () => {
    socketRef.current?.emit(ALL_CHAT_MESSAGE_EVENT, {});
  };

  return { messages, sendMessage };
};

export default useChat;
