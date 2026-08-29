import { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext(null);

/** Empty = same origin (Vite proxy in dev, Express host in prod). */
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;

export function SocketProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [liveVehicles, setLiveVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      auth: { userId: user?.id, role: user?.role },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('vehicles:live', (vehicles) => {
      setLiveVehicles(vehicles);
    });

    newSocket.on('vehicle:update', (update) => {
      setLiveVehicles((prev) =>
        prev.map((v) =>
          v.id === update.vehicleId
            ? { ...v, locationLat: update.lat, locationLng: update.lng, ...update }
            : v
        )
      );
    });

    newSocket.on('alert:low-battery', (alert) => {
      setAlerts((prev) => [{ ...alert, type: 'low-battery', id: Date.now() }, ...prev].slice(0, 10));
    });

    newSocket.on('alert:maintenance', (alert) => {
      setAlerts((prev) => [{ ...alert, type: 'maintenance', id: Date.now() }, ...prev].slice(0, 10));
    });

    newSocket.on('sos:alert', (alert) => {
      setAlerts((prev) => [{ ...alert, type: 'sos', id: Date.now() }, ...prev]);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [user?.id, user?.role]);

  return (
    <SocketContext.Provider value={{ socket, liveVehicles, alerts, setAlerts }}>
      {children}
    </SocketContext.Provider>
  );
}
