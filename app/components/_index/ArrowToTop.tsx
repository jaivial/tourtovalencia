// app/components/_index/ArrowToTop.tsx
// Feature component responsible for features and passing props to UI components
import { ChevronsUp } from "lucide-react";

const ArrowToTop: React.FC = () => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return <ChevronsUp className="fixed bottom-3 right-3 p-2 z-[999] rounded-full bg-blue-950 text-blue-50" size={40} onClick={handleScrollToTop} />;
};

export default ArrowToTop;
