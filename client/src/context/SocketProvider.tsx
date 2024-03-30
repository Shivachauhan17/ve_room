import React, { createContext, useMemo, useContext, ReactNode } from "react";
import { Socket,io } from "socket.io-client";

interface SocketContextProps {
  children: ReactNode;
}

// Define the context type
interface ISocketContext {
  socket: Socket;
}

const SocketContext = createContext<ISocketContext | null>(null);

export const useSocket = (): Socket => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context.socket;
};

export const SocketProvider: React.FC<SocketContextProps> = (props) => {
  // Create the socket instance
  const socket = useMemo(() => io("https://watchpartywebapp.onrender.com:8000"), []);

  // Wrap the socket instance in a context provider
  const contextValue = useMemo(() => ({ socket }), [socket]);

  return (
    <SocketContext.Provider value={contextValue}>
      {props.children}
    </SocketContext.Provider>
  );
};
