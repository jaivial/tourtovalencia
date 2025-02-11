// app/components/_index/IndexFeatures.tsx
import { Clock, Tag, Languages, Dog } from "lucide-react";

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
          <p className="text-blue-800">Normalmente aceptaremos reservas al menos 12 horas antes del tour. La edad legal mínima para un pasajero es de 12 años. Los cascos son obligatorios en España.</p>
        </div>

        {/* Precios Section */}
        <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <Tag className="w-12 h-12 text-blue-950 mb-4" />
          <h3 className="text-xl font-semibold text-blue-950 mb-3">Precios</h3>
          <p className="text-blue-800">El número máximo de participantes por tour es de 2 personas por sidecar (excluido el conductor) (2ª persona + € 60, -)</p>
        </div>

        {/* Idiomas Section */}
        <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <Languages className="w-12 h-12 text-blue-950 mb-4" />
          <h3 className="text-xl font-semibold text-blue-950 mb-3">Idiomas</h3>
          <p className="text-blue-800">Todos nuestros tours pueden ser narrados en español, inglés y alemán. Nuestros colegas de la oficina también hablan holandés.</p>
        </div>

        {/* Mascotas Section */}
        <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <Dog className="w-12 h-12 text-blue-950 mb-4" />
          <h3 className="text-xl font-semibold text-blue-950 mb-3">Mascotas</h3>
          <p className="text-blue-800">Podemos transportar animales pequeños en una bolsa especialmente adaptada.</p>
        </div>
      </div>
    </div>
  );
};

export default IndexFeatures;
