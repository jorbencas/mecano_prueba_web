import React from "react";
import { useTheme } from '../context/ThemeContext';
import { useDynamicTranslations } from "../hooks/useDynamicTranslations";

interface InstruccionesButtonProps {
  instructions?: string;
}

const InstruccionesButton: React.FC<InstruccionesButtonProps> = ({
  instructions,
}) => {
  const { isDarkMode } = useTheme();
  const { t } = useDynamicTranslations();

  return (
    <div className={`p-6 rounded-2xl w-full ${isDarkMode 
                ? 'bg-gray-700 text-white' 
                : 'bg-white text-black'}`}>
      <h2 className="text-xl font-semibold mb-4 ">
        {t("instructions.title")}
      </h2>
      <p className=" mb-6">
        {instructions || t("instructions.default")}
      </p>
    </div>
  );
};

export default InstruccionesButton;
