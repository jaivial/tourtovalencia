import { Panel, List } from "rsuite";
import type { IndexSection4Props } from "../types";

export const IndexSection4UI = ({ data }: IndexSection4Props) => {
  return (
    <section className="w-full py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">{data.title}</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Panel header={data.accessibility.title} bordered>
            <List>
              <List.Item>{data.accessibility.wheelchair}</List.Item>
              <List.Item>{data.accessibility.babies}</List.Item>
            </List>
          </Panel>

          <Panel header={data.additionalInfo.title} bordered>
            <List>
              <List.Item>{data.additionalInfo.confirmation}</List.Item>
              <List.Item>{data.additionalInfo.participation}</List.Item>
              <List.Item>{data.additionalInfo.weather}</List.Item>
              <List.Item>{data.additionalInfo.minTravelers}</List.Item>
              <List.Item>{data.additionalInfo.private}</List.Item>
            </List>
          </Panel>

          <Panel header={data.cancellation.title} bordered className="md:col-span-2 lg:col-span-1">
            <List>
              <List.Item>{data.cancellation.free}</List.Item>
              <List.Item>{data.cancellation.noRefund}</List.Item>
              <List.Item>{data.cancellation.noChanges}</List.Item>
              <List.Item>{data.cancellation.deadline}</List.Item>
              <List.Item>{data.cancellation.weather}</List.Item>
              <List.Item>{data.cancellation.minParticipants}</List.Item>
              <List.Item>{data.cancellation.moreInfo}</List.Item>
            </List>
          </Panel>
        </div>
      </div>
    </section>
  );
}; 