import React from "react";

interface InstruccionesButtonProps {
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
  instructions,
  color = "blue",
}) => {
  return (
    <div className={`bg-red p-6 rounded-2xl  w-full`}>
      <h2 className="text-xl font-semibold mb-4">Instrucciones</h2>
      <p className="text-gray-700 mb-6">{instructions}</p>
    </div>
  );
};

export default InstruccionesButton;
