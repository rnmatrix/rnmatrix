import { createContext, useContext } from 'react';

const RoomContext = createContext<{ room: any }>({ room: null });
RoomContext.displayName = 'RoomContext';
export default RoomContext;

export const useRoom = () => {
  const { room } = useContext(RoomContext);

  return room;
};
