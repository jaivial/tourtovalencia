// app/components/_index/IndexFeatures.tsx
import { Clock, Tag, Languages, Dog, Ban } from "lucide-react";
import { IndexFeaturesType } from "~/data/data";

type FeatureProps = {
  width: number;
  indexFeatures: IndexFeaturesType;
};

const IndexFeatures: React.FC<FeatureProps> = ({ width, indexFeatures }) => {
  return (
    <div className="w-[95%] max-w-[1280px] flex flex-col items-center justify-center my-10 mx-auto relative z-0">
      <div className={`w-full grid ${width <= 768 ? "grid-cols-1 gap-8" : "grid-cols-2 lg:grid-cols-4 gap-6"} p-4`}>
        {/* Reservas Section */}
        <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <Clock className="w-12 h-12 text-blue-950 mb-4" />
          <h3 className="text-xl font-semibold text-blue-950 mb-3">{indexFeatures.firstSquareTitle}</h3>
          <p className="text-blue-800">{indexFeatures.firstSquareDescription}</p>
        </div>

        {/* Precios Section */}
        <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <Tag className="w-12 h-12 text-blue-950 mb-4" />
          <h3 className="text-xl font-semibold text-blue-950 mb-3">{indexFeatures.secondSquareTitle}</h3>
          <p className="text-blue-800">{indexFeatures.secondSquareDescription}</p>
        </div>

        {/* Idiomas Section */}
        <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <Languages className="w-12 h-12 text-blue-950 mb-4" />
          <h3 className="text-xl font-semibold text-blue-950 mb-3">{indexFeatures.thirdSquareTitle}</h3>
          <p className="text-blue-800">{indexFeatures.thirdSquareDescription}</p>
        </div>

        {/* Mascotas Section */}
        <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="relative mb-4">
            <Dog className="w-12 h-12 text-blue-950" />
            <Ban className="w-12 h-12 text-red-500/80 absolute top-0 left-0" />
          </div>
          <h3 className="text-xl font-semibold text-blue-950 mb-3">{indexFeatures.fourthSquareTitle}</h3>
          <p className="text-blue-800">{indexFeatures.fourthSquareDescription}</p>
        </div>
      </div>
    </div>
  );
};

export default IndexFeatures;
