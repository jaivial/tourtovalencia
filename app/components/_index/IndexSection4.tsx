// app/components/IndexSection1.tsx
//UI Component: just responsible for displaying pure html with props passed from feature component
import { FlexboxGrid } from "rsuite";
import { Panel, Placeholder, Row, Col, Button } from "rsuite";
import { CardProps, IndexSection4Type } from "~/data/data";

// entry.client.tsx
import "rsuite/dist/rsuite.min.css";
import { Carousel } from "rsuite";

// Child Props type
type ChildProps = {
  width: number;
  indexSection4Text: IndexSection4Type;
};

const Card = (props: CardProps) => (
  <Panel {...props} bordered header="" className="max-w-[420px] w-[420px] h-[680px] bg-gradient-to-b from-blue-50 to-blue-100 shadow-lg hover:shadow-xl hover:from-blue-100 hover:to-blue-200 transition-all hover:w-[470px] hover:max-w-[470px] duration-500 hover:cursor-pointer group">
    <div className="flex flex-col items-center h-[620px]">
      <div className="w-full h-[600px] mt-0 bg-blue-300 rounded-lg bg-[url('/sanjuancard.jpg')] bg-cover bg-center"></div>
      <div className="pt-8 pb-0 py-2 flex flex-col items-center gap-4 flex-grow justify-between h-full">
        {/* Div with image of the adventure */}
        <div>
          <h3 className="text-3xl font-extrabold text-blue-800 text-center">{props.title}</h3>
        </div>
        <div>
          <h5 className="text-xl font-medium text-blue-800 text-center">{props.price}</h5>
        </div>
        <div>
          <h5 className="text-xl font-medium text-blue-800 text-center">{props.duration}</h5>
        </div>
        <div>
          <p className="text-blue-600 text-center text-lg leading-relaxed flex-grow">{props.mainText}</p>
        </div>
        <button className="bg-blue-500 text-white rounded-full px-6 py-4 text-base font-bold uppercase tracking-wider transition-colors duration-300 hover:bg-blue-600">Book Now</button>
      </div>
    </div>
  </Panel>
);

const IndexSection4: React.FC<ChildProps> = ({ width, indexSection4Text }) => {
  return (
    <div className={`w-[95%] max-w-[1280px] flex flex-row flex-wrap items-center justify-center my-10 mx-auto ${width <= 450 ? "gap-0" : "gap-10"} relative z-0`}>
      <div className="w-full max-w-[1180px] flex flex-col items-center justify-center gap-5">
        <div className="w-full">
          <h3 className="text-center text-blue-800 text-3xl font-bold">{indexSection4Text.firstH3}</h3>
        </div>
        <div className="show-grid">
          <FlexboxGrid justify="center">
            <FlexboxGrid.Item colspan={0}>
              <Card {...indexSection4Text.propscard} />
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </div>
      </div>
    </div>
  );
};

export default IndexSection4;
