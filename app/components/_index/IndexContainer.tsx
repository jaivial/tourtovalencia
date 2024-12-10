// Feature component: just responsible for containing UI components, fetch data and handle features and pass down props to UI components.
import HeroSection from "./HeroSection";
const IndexContainer: React.FC = () => {
  return (
    <>
      <HeroSection />
    </>
  );
};

export default IndexContainer;
