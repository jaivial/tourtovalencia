// app/components/IndexSection1.tsx
//UI Component: just responsible for displaying pure html with props passed from feature component
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { IndexSection5Type } from "~/data/data";

// Child Props type
type ChildProps = {
  width: number;
  indexSection5Text: IndexSection5Type;
};

const IndexSection5: React.FC<ChildProps> = ({ width, indexSection5Text }) => {
  return (
    <div className={`w-[95%] max-w-[1280px] p-0 flex flex-col items-center justify-center relative mx-auto z-0`}>
      <div className={`w-full h-fit flex ${width <= 500 ? "flex-col" : "flex-row"} justify-center items-center p-0  -translate-y-[50px]`}>
        <DotLottieReact src="https://lottie.host/e422824f-429d-4dcd-86ba-b35f3d467061/jgsDOnfLdH.lottie" loop autoplay className={`h-[170px] w-auto`} />
        <h3 className={`transition-all duration-500 ease-in-out text-orange-950 font-sans font-bold ${width <= 1280 ? "" : "-translate-x-[50px]"} ${width <= 350 ? "text-[1.7rem]" : width <= 450 ? "text-[2.1rem]" : "text-[2.5rem]"} text-center`}>{indexSection5Text.firstH3}</h3>
      </div>
      <div className={`w-full h-auto flex flex-row flex-wrap justify-center items-center p-6 gap-8 -translate-y-[40px]`}>
        <img src="/plazadelareina.jpg" alt="Viajes en Barca en San Juan desde Valencia. BOAT TRIP AND EXCURSION FROM VALENCIA" className="rounded-2xl max-h-[350px]" />
        <div className={`flex flex-col ${width <= 1280 ? "w-full" : "w-1/2"} justify-center items-center gap-4 my-auto`}>
          <h3 className={`transition-all duration-500 ease-in-out text-orange-950 font-sans font-medium ${width <= 350 ? "text-[1rem]" : width <= 450 ? "text-[1.2rem]" : "text-[1.6rem]"} text-center`}>{indexSection5Text.secondH3}</h3>
          <h3 className={`transition-all duration-500 ease-in-out text-orange-950 font-sans font-medium ${width <= 350 ? "text-[1rem]" : width <= 450 ? "text-[1.2rem]" : "text-[1.6rem]"} text-center`}>{indexSection5Text.thirdH3}</h3>
          <h3 className={`transition-all duration-500 ease-in-out text-orange-950 font-sans font-medium ${width <= 350 ? "text-[1rem]" : width <= 450 ? "text-[1.2rem]" : "text-[1.6rem]"} text-center`}>{indexSection5Text.fourthH3}</h3>
          <h3 className={`transition-all duration-500 ease-in-out text-orange-950 font-sans font-medium ${width <= 350 ? "text-[1rem]" : width <= 450 ? "text-[1.2rem]" : "text-[1.6rem]"} text-center`}>{indexSection5Text.fifthH3}</h3>
        </div>
      </div>
      <DotLottieReact src="https://lottie.host/88bf0f6a-04a0-48ea-a36c-f5e082079f9f/gymc6ImWs9.lottie" loop autoplay className="w-[90%] max-w-[500px] -translate-y-[40px]" />
    </div>
  );
};

export default IndexSection5;
