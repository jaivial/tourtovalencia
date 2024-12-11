// app/components/IndexSection1.tsx
//UI Component: just responsible for displaying pure html with props passed from feature component
import * as React from "react";
import { IndexSection2Type } from "~/data/data";
import { carouselData, CarouselDataType } from "~/data/carouseldata";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "~/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel";

// Child Props type
type ChildProps = {
  width: number;
  height: number;
  indexSection2Text: IndexSection2Type;
};

const IndexSection3: React.FC<ChildProps> = ({ width, height, indexSection2Text }) => {
  const plugin = React.useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));
  const carouselImages: CarouselDataType[] = carouselData;
  return (
    <>
      {width > 500 ? (
        <div className="w-[95%] max-w-[1280px] flex flex-col flex-wrap-reverse items-center justify-center my-10 mx-auto relative z-0 gap-6">
          <div className="flex flex-row justify-center gap-6 items-center w-full">
            <div className="rounded-2xl h-[400px] w-2/5 bg-[url('/photo1IS3.webp')] bg-no-repeat bg-center bg-cover"></div>
            <div className="rounded-2xl h-[400px] bg-[url('/photo2IS3.webp')] bg-center bg-cover w-3/5"></div>
          </div>
          <div className="flex flex-row-reverse justify-center gap-6 items-center w-full">
            <div className="rounded-2xl h-[400px] w-2/5 bg-[url('/photo3IS3.webp')] bg-no-repeat bg-center bg-cover"></div>
            <div className="rounded-2xl h-[400px] bg-[url('/photo4IS3.webp')] bg-center bg-cover w-3/5"></div>
          </div>
        </div>
      ) : (
        <div className="w-[95%] max-w-[1280px] flex flex-col flex-wrap-reverse items-center justify-center my-10 mx-auto relative z-0 gap-0 rounded-2xl -translate-y-[100px]">
          <Carousel plugins={[plugin.current]} className="w-full" onMouseEnter={plugin.current.stop} onMouseLeave={plugin.current.reset}>
            <CarouselContent>
              {carouselImages.map((image) => (
                <CarouselItem key={image.index}>
                  <div className="p-1">
                    <Card className="w-full">
                      <CardContent className={`flex aspect-square items-center justify-center rounded-xl p-6 bg-cover bg-center bg-no-repeat bg-[url('${image.source}')]`}></CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      )}
    </>
  );
};

export default IndexSection3;
