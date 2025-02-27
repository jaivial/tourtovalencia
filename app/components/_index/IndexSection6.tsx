import { Panel, List } from "rsuite";
import { useLanguageContext } from "~/providers/LanguageContext";
import { motion } from "framer-motion";
import { 
  AccessibilityIcon, 
  InfoIcon, 
  BanIcon 
} from "lucide-react";
import { useRef, useState } from "react";

const IndexSection6 = () => {
  const { state } = useLanguageContext();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { title: state.indexSection6.accessibility.title, icon: AccessibilityIcon },
    { title: state.indexSection6.additional.title, icon: InfoIcon },
    { title: state.indexSection6.cancellation.title, icon: BanIcon },
  ];

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    const container = scrollContainerRef.current;
    const panels = container?.getElementsByClassName(panelWrapperClass);
    if (container && panels && panels[index]) {
      const panel = panels[index] as HTMLElement;
      container.scrollTo({
        left: panel.offsetLeft - (container.offsetWidth - panel.offsetWidth) / 2,
        behavior: 'smooth'
      });
    }
  };

  // Safe animations that work well on mobile Safari
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        duration: 0.5
      }
    }
  };

  const panelVariants = {
    hidden: { 
      opacity: 0,
      x: 20
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const panelHeaderClass = "flex items-center gap-2 h-14 items-center";
  const iconClass = "w-5 h-5 text-blue-600 flex-shrink-0";
  const panelClass = "bg-white shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300 h-full flex flex-col";
  const listClass = "!bg-transparent flex-grow";
  const panelWrapperClass = "w-[calc(100vw-32px)] sm:w-[500px] md:w-[650px] flex-shrink-0 snap-center";

  return (
    <section className="w-full blue-50">
      <motion.div 
        className="max-w-[100vw] px-0 sm:px-4 py-8 sm:py-16 md:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.h2 
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-8 sm:mb-12 max-w-7xl mx-auto px-4"
          variants={panelVariants}
        >
          {state.indexSection6.title}
        </motion.h2>

        {/* Tabs */}
        <div className="grid sm:flex sm:justify-center mb-6 sm:mb-8 gap-2 sm:gap-4 px-4 max-w-7xl mx-auto">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <button
                key={index}
                onClick={() => handleTabClick(index)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all
                  justify-center sm:justify-start w-full sm:w-auto
                  ${activeTab === index 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${activeTab === index ? 'text-white' : 'text-blue-600'}`} />
                <span className="text-sm sm:text-base whitespace-nowrap">{tab.title}</span>
              </button>
            );
          })}
        </div>
        
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide scroll-smooth"
        >
          {/* Accessibility Panel */}
          <motion.div 
            variants={panelVariants}
            className={`${panelWrapperClass} ml-4 sm:ml-0`}
          >
            <Panel 
              header={
                <div className={panelHeaderClass}>
                  <AccessibilityIcon className={iconClass} />
                  <span className="text-sm sm:text-base">{state.indexSection6.accessibility.title}</span>
                </div>
              }
              bordered 
              className={panelClass}
            >
              <List className={listClass}>
                <List.Item className="!py-2 sm:!py-3 text-sm sm:text-base">
                  {state.indexSection6.accessibility.wheelchair}
                </List.Item>
                <List.Item className="!py-2 sm:!py-3 text-sm sm:text-base">
                  {state.indexSection6.accessibility.babies}
                </List.Item>
                <List.Item className="!py-2 sm:!py-3 text-sm sm:text-base">
                  {state.indexSection6.accessibility.pets}
                </List.Item>
              </List>
            </Panel>
          </motion.div>

          {/* Additional Information Panel */}
          <motion.div 
            variants={panelVariants}
            className={panelWrapperClass}
          >
            <Panel 
              header={
                <div className={panelHeaderClass}>
                  <InfoIcon className={iconClass} />
                  <span className="text-sm sm:text-base">{state.indexSection6.additional.title}</span>
                </div>
              }
              bordered 
              className={panelClass}
            >
              <List className={listClass}>
                <List.Item className="!py-2 sm:!py-3 text-sm sm:text-base">
                  {state.indexSection6.additional.confirmation}
                </List.Item>
                <List.Item className="!py-2 sm:!py-3 text-sm sm:text-base">
                  {state.indexSection6.additional.noFood}
                </List.Item>
              </List>
            </Panel>
          </motion.div>

          {/* Cancellation Policy Panel */}
          <motion.div 
            variants={panelVariants}
            className={`${panelWrapperClass} mr-4 sm:mr-0`}
          >
            <Panel 
              header={
                <div className={panelHeaderClass}>
                  <BanIcon className={iconClass} />
                  <span className="text-sm sm:text-base">{state.indexSection6.cancellation.title}</span>
                </div>
              }
              bordered 
              className={panelClass}
            >
              <List className={listClass}>
                <List.Item className="!py-2 sm:!py-3 text-sm sm:text-base">
                  {state.indexSection6.cancellation.free}
                </List.Item>
                <List.Item className="!py-2 sm:!py-3 text-sm sm:text-base">
                  {state.indexSection6.cancellation.noRefund}
                </List.Item>
                <List.Item className="!py-2 sm:!py-3 text-sm sm:text-base">
                  {state.indexSection6.cancellation.noChanges}
                </List.Item>
                <List.Item className="!py-2 sm:!py-3 text-sm sm:text-base">
                  {state.indexSection6.cancellation.deadline}
                </List.Item>
                <List.Item className="!py-2 sm:!py-3 text-sm sm:text-base">
                  {state.indexSection6.cancellation.weather}
                </List.Item>
                <List.Item className="!py-2 sm:!py-3 text-sm sm:text-base">
                  {state.indexSection6.cancellation.minParticipants}
                </List.Item>
                <List.Item className="!py-2 sm:!py-3 text-sm sm:text-base">
                  {state.indexSection6.cancellation.moreDetails}
                </List.Item>
              </List>
            </Panel>
          </motion.div>
        </div>

        {/* Scroll Indicator - hide on mobile since we have full-width tabs */}
        <div className="hidden sm:flex justify-center gap-1 mt-4 sm:mt-6">
          {tabs.map((_, index) => (
            <div 
              key={index}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                activeTab === index ? 'bg-blue-600' : 'bg-blue-300'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default IndexSection6; 