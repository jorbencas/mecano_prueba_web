import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useMultiplayer } from '../context/MultiplayerContext';
import { multiplayerAPI, Room, CreateRoomData } from '../api/multiplayer';
import { FaUsers, FaPlus, FaTimes, FaLock, FaGlobeAmericas } from 'react-icons/fa';
import { useDynamicTranslations } from '../hooks/useDynamicTranslations';

interface RoomLobbyProps {
  onJoinRoom: (roomId: string) => void;
  mode?: 'race' | 'practice';
}

const RoomLobby: React.FC<RoomLobbyProps> = ({ onJoinRoom, mode = 'practice' }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { joinRoom } = useMultiplayer();
  const { t } = useDynamicTranslations();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const data = await multiplayerAPI.getRooms(token);
      // Filter by mode
      setRooms(data.rooms.filter(room => room.mode === mode));
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      alert('Por favor ingresa un nombre para la sala');
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const roomData: CreateRoomData = {
        name: roomName,
        mode: mode,
        maxPlayers,
        isPrivate,
      };

      const { room } = await multiplayerAPI.createRoom(token, roomData);
      
      // Join the created room
      joinRoom(room.id);
      
      setShowCreateModal(false);
      setRoomName('');
      setMaxPlayers(4);
      setIsPrivate(false);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Error al crear la sala. Por favor intenta de nuevo.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    joinRoom(roomId);
  };

  const filteredRooms = rooms.filter(room => room.mode === mode);

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {mode === 'race' ? '🏁 Salas de Carrera' : '🎮 Salas de Práctica'}
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 transition-colors"
          >
            <FaPlus /> Crear Nueva Sala
          </button>
        </div>

        {/* Rooms List */}
        {loading ? (
          <div className={`p-8 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <p>Cargando salas...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className={`p-8 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <p className="text-xl mb-4">No hay salas disponibles</p>
            <p className="text-sm opacity-75">Sé el primero en crear una sala</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map(room => (
              <div
                key={room.id}
                className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold">{room.name}</h3>
                  {room.is_private ? (
                    <FaLock className="text-yellow-500" />
                  ) : (
                    <FaGlobeAmericas className="text-blue-500" />
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm opacity-75">
                    <strong>Creado por:</strong> {room.creator_name || room.creator_email}
                  </p>
                  <div className="flex items-center gap-2">
                    <FaUsers />
                    <span className="text-sm">
                      0/{room.max_players} jugadores
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleJoinRoom(room.id)}
                  className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-bold transition-colors"
                >
                  Unirse
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Create Room Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`max-w-md w-full rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Crear Nueva Sala</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-semibold">Nombre de la Sala</label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className={`w-full p-3 rounded border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-black'
                    }`}
                    placeholder="Ej: Sala de Juan"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Máximo de Jugadores</label>
                  <input
                    type="number"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                    className={`w-full p-3 rounded border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-black'
                    }`}
                    min="2"
                    max="8"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="private-room"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <label htmlFor="private-room" className="font-semibold cursor-pointer">
                    Sala Privada (solo por invitación)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateRoom}
                    disabled={creating}
                    className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded font-bold transition-colors"
                  >
                    {creating ? 'Creando...' : 'Crear Sala'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomLobby;
