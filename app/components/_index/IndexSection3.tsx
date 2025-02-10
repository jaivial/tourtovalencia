// app/components/IndexSection1.tsx
//UI Component: just responsible for displaying pure html with props passed from feature component
import { IndexSection3Type } from "~/data/data";
import { Review } from "~/data/data";
import { AvatarGroup, Avatar } from "rsuite";
import { Rate } from "rsuite";
// entry.client.tsx
import "rsuite/dist/rsuite.min.css";
import { Carousel } from "rsuite";

// Child Props type
type ChildProps = {
  width: number;
  indexSection3Text: IndexSection3Type;
};

const IndexSection3: React.FC<ChildProps> = ({ width, indexSection3Text }) => {
  return (
    <div className={`w-[95%] max-w-[1280px] flex flex-row flex-wrap items-center justify-center my-10 mx-auto ${width <= 450 ? "gap-0" : "gap-10"} relative z-0`}>
      <div className="bg-red w-full flex flex-row items-center justify-center max-w-[1180px]">
        <div className="w-full max-w-[600px] bg-[url('/sanjuanbarca.jpg')] bg-cover bg-center h-[500px] rounded-2xl"></div>
        <div className="w-full gap-4 flex flex-col items-center justify-between p-8">
          <h3 className="text-center text-[1.5rem]">{indexSection3Text.firstH3}</h3>
          <p className="text-justify text-[1.1rem]">{indexSection3Text.firstp}</p>
          <p className="text-justify text-[1.1rem]">{indexSection3Text.secondp}</p>
          <p className="text-justify text-[1.1rem]">{indexSection3Text.thirdp}</p>
          <p className="text-center text-[1.1rem]">{indexSection3Text.fourthp}</p>
        </div>
      </div>
    </div>
  );
};

export default IndexSection3;
