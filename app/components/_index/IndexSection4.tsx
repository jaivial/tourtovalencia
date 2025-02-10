// app/components/IndexSection1.tsx
//UI Component: just responsible for displaying pure html with props passed from feature component
import { FlexboxGrid } from "rsuite";
import { Panel, Placeholder, Row, Col } from "rsuite";

// entry.client.tsx
import "rsuite/dist/rsuite.min.css";
import { Carousel } from "rsuite";

// Child Props type
type ChildProps = {
  width: number;
};

type propscardtitle = {
  title: string;
};

const propscard = {
  title: "hola",
};

const Card = (props: propscardtitle) => (
  <Panel {...props} bordered header="Card title" className="bg-red-300 max-w-[400px] w-[400px] h-[500px]">
    <p>{props.title}</p>
  </Panel>
);

const IndexSection4: React.FC<ChildProps> = ({ width }) => {
  return (
    <div className={`w-[95%] max-w-[1280px] flex flex-row flex-wrap items-center justify-center my-10 mx-auto ${width <= 450 ? "gap-0" : "gap-10"} relative z-0`}>
      <div className="w-full max-w-[1180px] flex flex-col items-center justify-center gap-5">
        <div className="w-full">
          <h3 className="text-center">Nuestras Excursiones</h3>
        </div>
        <div className="show-grid">
          <FlexboxGrid justify="center">
            <FlexboxGrid.Item colspan={0}>
              <Card title={propscard.title} />
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </div>
      </div>
    </div>
  );
};

export default IndexSection4;
