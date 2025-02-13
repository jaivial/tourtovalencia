import { Panel, List } from "rsuite";
import { useLanguageContext } from "~/providers/LanguageContext";

const IndexSection6 = () => {
  const { state } = useLanguageContext();

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8">{state.indexSection6.title}</h2>
      
      <div className="space-y-6">
        {/* Accessibility Panel */}
        <Panel 
          header={state.indexSection6.accessibility.title} 
          bordered 
          className="bg-white shadow-sm"
        >
          <List>
            <List.Item>{state.indexSection6.accessibility.wheelchair}</List.Item>
            <List.Item>{state.indexSection6.accessibility.babies}</List.Item>
          </List>
        </Panel>

        {/* Additional Information Panel */}
        <Panel 
          header={state.indexSection6.additional.title} 
          bordered 
          className="bg-white shadow-sm"
        >
          <List>
            <List.Item>{state.indexSection6.additional.confirmation}</List.Item>
            <List.Item>{state.indexSection6.additional.participation}</List.Item>
            <List.Item>{state.indexSection6.additional.weather}</List.Item>
            <List.Item>{state.indexSection6.additional.minTravelers}</List.Item>
            <List.Item>{state.indexSection6.additional.private}</List.Item>
          </List>
        </Panel>

        {/* Cancellation Policy Panel */}
        <Panel 
          header={state.indexSection6.cancellation.title} 
          bordered 
          className="bg-white shadow-sm"
        >
          <List>
            <List.Item>{state.indexSection6.cancellation.free}</List.Item>
            <List.Item>{state.indexSection6.cancellation.noRefund}</List.Item>
            <List.Item>{state.indexSection6.cancellation.noChanges}</List.Item>
            <List.Item>{state.indexSection6.cancellation.deadline}</List.Item>
            <List.Item>{state.indexSection6.cancellation.weather}</List.Item>
            <List.Item>{state.indexSection6.cancellation.minParticipants}</List.Item>
            <List.Item>{state.indexSection6.cancellation.moreDetails}</List.Item>
          </List>
        </Panel>
      </div>
    </section>
  );
};

export default IndexSection6; 