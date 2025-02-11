// app/components/IndexSection1.tsx
//UI Component: just responsible for displaying pure html with props passed from feature component
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { IndexSection4Type } from "~/data/data";

// Child Props type
type ChildProps = {
  width: number;
  indexSection4Text: IndexSection4Type;
};

const IndexSection4: React.FC<ChildProps> = ({ width, indexSection4Text }) => {
  return (
    <div className={`w-[95%] max-w-[1280px] flex flex-col flex-wrap-reverse items-center justify-center my-10 mx-auto relative z-0 ${width <= 1280 ? "gap-0" : "gap-10"}`}>
      <div className={`w-full max-w-[620px] min-h-[600px] flex flex-col justify-center items-center p-6 gap-8 -translate-y-[50px]`}>
        <DotLottieReact src="https://lottie.host/f8570958-3acf-4c42-8ae6-2ad50fe220c7/N8q8bzQLK3.lottie" loop autoplay className={`${width <= 500 ? "w-[400px]" : "w-[600px]"}`} />
        <h3 className={`transition-all duration-500 ease-in-out text-orange-950 font-sans font-bold ${width <= 350 ? "text-[1.7rem]" : width <= 450 ? "text-[2.1rem]" : "text-[2.5rem]"} text-center`}>
          {indexSection4Text.firstH3} <br /> <span className={`font-medium ${width < 450 ? "text-[1.2rem]" : "text-[1.5rem]"}`}>({indexSection4Text.secondH3})</span>
        </h3>
        <h3 className={`transition-all duration-500 ease-in-out text-orange-950 font-sans font-medium ${width <= 350 ? "text-[1.1rem]" : width <= 450 ? "text-[1.4rem]" : "text-[1.8rem]"} text-center`}>{indexSection4Text.thirdH3}</h3>
      </div>
    </div>
  );
};

export default IndexSection4;
