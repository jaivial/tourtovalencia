// Feature component: just responsible for containing UI components, fetch data and handle features and pass down props to UI components.
import HeroSection from "./HeroSection";
import { useWindowSize } from "@uidotdev/usehooks";
const IndexContainer: React.FC = () => {
  const size = useWindowSize();
  const width = size.width ?? 0;
  const height = size.height ?? 0;
  return (
    <>
      <HeroSection width={width} height={height} />
    </>
  );
};

export default IndexContainer;
