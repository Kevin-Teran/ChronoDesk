import { ClipLoader } from "react-spinners";

export const Loader = () => (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <ClipLoader 
      size={50}
      color="#3B82F6"
      cssOverride={{
        borderWidth: "4px"
      }}
    />
    <span className="ml-3 text-white text-lg">Cargando...</span>
  </div>
);