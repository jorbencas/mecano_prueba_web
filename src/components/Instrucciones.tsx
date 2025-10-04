import React, { useState } from "react";

interface InstruccionesButtonProps {
  buttonLabel: string;
  instructions: string;
  color?: "green" | "yellow" | "red" | "blue"; // puedes expandirlo si quieres más
}

const colorClasses: Record<string, string> = {
  green: "bg-green-500 hover:bg-green-600",
  yellow: "bg-yellow-500 hover:bg-yellow-600",
  red: "bg-red-500 hover:bg-red-600",
  blue: "bg-blue-500 hover:bg-blue-600",
};

const InstruccionesButton: React.FC<InstruccionesButtonProps> = ({
  buttonLabel,
  instructions,
  color = "blue",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      {/* Botón */}
      <button
        onClick={openModal}
        className={`px-4 py-2 text-white rounded-xl shadow-md transition ${colorClasses[color]}`}
      >
        {buttonLabel}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Instrucciones</h2>
            <p className="text-gray-700 mb-6">{instructions}</p>

            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstruccionesButton;
