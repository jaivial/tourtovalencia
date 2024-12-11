// app/components/IndexSection1.tsx
//UI Component: just responsible for displaying pure html with props passed from feature component
import { IndexSection1Type } from "~/data/data";

// Child Props type
type ChildProps = {
  width: number;
  height: number;
  indexSection1Text: IndexSection1Type;
};

const IndexSection1: React.FC<ChildProps> = ({ width, height, indexSection1Text }) => {
  return (
    <div className="w-[95%] max-w-[1280px] flex flex-row flex-wrap items-center justify-center my-10 mx-auto gap-10 relative z-0">
      <div className="w-full max-w-[620px] h-[600px] p-6 relative">
        <div
          className={`rounded-2xl transition-all duration-500 ease-in-out ${
            width <= 300 ? "w-[200px] h-[380px] bg-cover ml-[15px] -mt-[15px]" : width <= 350 ? "w-[250px] h-[380px] bg-cover ml-[20px] -mt-[20px]" : width <= 400 ? "w-[280px] h-[420px] bg-cover ml-[30px] -mt-[30px]" : width <= 450 ? "w-[300px] h-[450px] bg-cover ml-[30px] -mt-[30px]" : "w-[300px] h-[450px] bg-contain ml-[40px] -mt-[40px]"
          }   bg-[url('/photo1section1.jpg')] bg-no-repeat  absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]  z-30`}
        ></div>
        <div className={`transition-all duration-500 ease-in-out rounded-2xl ${width <= 300 ? "w-[200px] h-[380px]" : width <= 350 ? "w-[250px] h-[380px]" : width <= 400 ? "w-[280px] h-[420px]" : width <= 450 ? "w-[300px] h-[450px]" : "w-[300px] h-[450px]"}   bg-orange-100 absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-20`}></div>
        <div
          className={`rounded-2xl transition-all duration-500 ease-in-out ${
            width <= 300 ? "w-[200px] h-[380px] -ml-[15px] mt-[15px]" : width <= 350 ? "w-[250px] h-[380px] -ml-[20px] mt-[20px]" : width <= 400 ? "w-[280px] h-[420px] -ml-[30px] mt-[30px]" : width <= 450 ? "w-[300px] h-[450px] -ml-[30px] mt-[30px]" : "w-[300px] h-[450px] -ml-[40px] mt-[40px]"
          }   bg-orange-300 absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]  z-10`}
        ></div>
      </div>
      <div className="w-full max-w-[620px] min-h-[600px] flex flex-col justify-center items-center p-6 gap-8">
        <h2 className={`transition-all duration-500 ease-in-out text-orange-950 font-sans font-bold ${width <= 350 ? "text-[2.5rem]" : width <= 450 ? "text-[3rem]" : "text-[3.5rem]"} text-center`}>{indexSection1Text.firstH2}</h2>
        <h3 className={`transition-all duration-500 ease-in-out text-orange-950 font-sans font-medium ${width <= 350 ? "text-[1.6rem]" : width <= 450 ? "text-[2rem]" : "text-[2.5rem]"} text-center`}>{indexSection1Text.firstH3}</h3>
        <h3 className={`transition-all duration-500 ease-in-out text-orange-950 font-sans font-medium ${width <= 350 ? "text-[1.6rem]" : width <= 450 ? "text-[2rem]" : "text-[2.5rem]"} text-center`}>{indexSection1Text.secondH3}</h3>
        <button type="button" className={`${width <= 450 ? "text-xl" : "text-2xl"} text-white bg-slate-950 rounded-xl font-sans tracking-wider font-medium px-4 py-4 md:hover:bg-orange-800 transition-colors duration-500 ease-in-out`}>
          {indexSection1Text.button}
        </button>
      </div>
    </div>
  );
};

export default IndexSection1;
