// app/components/_index/IndexFeatures.tsx
import { Clock, Tag, Languages, Dog, Ban } from "lucide-react";

type FeatureProps = {
  width: number;
};

const IndexFeatures: React.FC<FeatureProps> = ({ width }) => {
  return (
    <div className="w-[95%] max-w-[1280px] flex flex-col items-center justify-center my-10 mx-auto relative z-0">
      <div className={`w-full grid ${width <= 768 ? "grid-cols-1 gap-8" : "grid-cols-2 lg:grid-cols-4 gap-6"} p-4`}>
        {/* Reservas Section */}
        <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <Clock className="w-12 h-12 text-blue-950 mb-4" />
          <h3 className="text-xl font-semibold text-blue-950 mb-3">Reservas</h3>
          <p className="text-blue-800">Normalmente aceptaremos reservas al menos 24 horas antes del tour. La edad legal mínima para un pasajero es de más de 2 años.</p>
        </div>

        {/* Precios Section */}
        <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <Tag className="w-12 h-12 text-blue-950 mb-4" />
          <h3 className="text-xl font-semibold text-blue-950 mb-3">Precios</h3>
          <p className="text-blue-800"> 120€ por persona. <br />El número máximo de participantes por tour es de 4 personas.</p>
        </div>

        {/* Idiomas Section */}
        <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <Languages className="w-12 h-12 text-blue-950 mb-4" />
          <h3 className="text-xl font-semibold text-blue-950 mb-3">Idiomas</h3>
          <p className="text-blue-800">Todos nuestros tours pueden ser narrados en español e inglés.</p>
        </div>

        {/* Mascotas Section */}
        <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="relative mb-4">
            <Dog className="w-12 h-12 text-blue-950" />
            <Ban className="w-12 h-12 text-red-500/80 absolute top-0 left-0" />
          </div>
          <h3 className="text-xl font-semibold text-blue-950 mb-3">Mascotas</h3>
          <p className="text-blue-800">No se permiten mascotas durante el tour.</p>
        </div>
      </div>
    </div>
  );
};

export default IndexFeatures;
