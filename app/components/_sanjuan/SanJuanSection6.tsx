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

const IndexSection6: React.FC<ChildProps> = ({ width, SanJuanSection6Text }) => {
  return (
    <div className={`w-[95%] max-w-[1280px] p-10 flex flex-col items-center justify-center relative mx-auto z-0 mb-24`}>
      <Card className={`${width < 300 ? "w-[140%]" : width < 350 ? "w-[130%]" : width < 400 ? "w-[120%]" : width < 450 ? "w-[115%]" : "w-full"} max-w-[600px]`}>
        <CardHeader className="flex flex-col justify-center items-center">
          <CardTitle className="text-[1.6rem] text-center">{SanJuanSection6Text.cardTitle}</CardTitle>
          <CardDescription className="text-[1.2rem] text-center">{SanJuanSection6Text.cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <h4 className="font-semibold">{SanJuanSection6Text.firstH4}</h4>
          <ul className={`flex flex-col gap-4 mt-2 ${width < 350 ? "ml-0 text-[0.9rem]" : width < 500 ? "ml-2 text-[0.9rem]" : "ml-6"}`}>
            {SanJuanSection6Text.list.map((li) => (
              <li className="flex flex-row items-center justify-start gap-2" key={li.index}>
                <Check className=" max-h-[50px] min-h-[50px] max-w-[30px] min-w-[30px]" />
                <p>{li.li}</p>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col justify-center items-center gap-10 p-6">
          <h4 className="font-extrabold mx-auto text-5xl tracking-wider">
            {SanJuanSection6Text.secondH4} <span className="text-xs font-light">{SanJuanSection6Text.secondH4span}</span>
          </h4>
          <Button>{SanJuanSection6Text.button}</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default IndexSection6;
