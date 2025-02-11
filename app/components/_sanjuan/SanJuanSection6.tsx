// app/components/IndexSection1.tsx
//UI Component: just responsible for displaying pure html with props passed from feature component
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";

import { SanJuanSection6Type } from "~/data/data";
import { Check } from "lucide-react";
import { Button } from "../ui/button";

// Child Props type
type ChildProps = {
  width: number;
  SanJuanSection6Text: SanJuanSection6Type;
};

const SanJuanSection6: React.FC<ChildProps> = ({ width, SanJuanSection6Text }) => {
  return (
    <div className="w-[95%] max-w-[1280px] p-10 flex flex-col items-center justify-center relative mx-auto z-0 mb-24">
      <Card className={`${
        width < 300 ? "w-[140%]" : 
        width < 350 ? "w-[130%]" : 
        width < 400 ? "w-[120%]" : 
        width < 450 ? "w-[115%]" : 
        "w-full"
      } max-w-[600px] backdrop-blur-md bg-white/80 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300`}>
        <CardHeader className="flex flex-col justify-center items-center space-y-4">
          <CardTitle className="text-[2rem] font-bold text-center bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
            {SanJuanSection6Text.cardTitle}
          </CardTitle>
          <CardDescription className="text-[1.2rem] text-center text-blue-800/80">
            {SanJuanSection6Text.cardDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8">
          <h4 className="font-semibold text-blue-900 text-xl mb-6">
            {SanJuanSection6Text.firstH4}
          </h4>
          <ul className={`flex flex-col gap-6 mt-2 ${
            width < 350 ? "ml-0 text-[0.9rem]" : 
            width < 500 ? "ml-2 text-[0.9rem]" : 
            "ml-6"
          }`}>
            {SanJuanSection6Text.list.map((li) => (
              <li 
                className="flex flex-row items-start justify-start gap-4 group" 
                key={li.index}
              >
                <div className="rounded-full p-2 bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <Check className="h-5 w-5 text-blue-700" />
                </div>
                <p className="text-blue-800/90 leading-relaxed pt-1">
                  {li.li}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col justify-center items-center gap-8 p-8 bg-gradient-to-b from-transparent to-blue-50/50">
          <div className="text-center">
            <h4 className="font-extrabold text-5xl tracking-wider text-blue-900">
              {SanJuanSection6Text.secondH4}
            </h4>
            <span className="text-sm font-medium text-blue-600 mt-2 block">
              {SanJuanSection6Text.secondH4span}
            </span>
          </div>
          <Button className="bg-blue-800 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
            {SanJuanSection6Text.button}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SanJuanSection6;
