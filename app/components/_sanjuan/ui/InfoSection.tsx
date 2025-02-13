import { Panel } from 'rsuite';
import type { InfoSectionProps } from '../sanjuan.types';

const InfoSection = ({ 
  accessibility,
  additionalInfo,
  cancellation 
}: InfoSectionProps) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Accessibility Panel */}
        <Panel header={accessibility.title} bordered>
          <div className="space-y-4">
            <p className="text-gray-700">{accessibility.wheelchairAccess}</p>
            <p className="text-gray-700">{accessibility.babySeating}</p>
            <p className="text-gray-700">{accessibility.helpText}</p>
            <p className="text-gray-700 font-semibold">{accessibility.phoneNumber}</p>
          </div>
        </Panel>

        {/* Additional Info Panel */}
        <Panel header={additionalInfo.title} bordered>
          <div className="space-y-4">
            <p className="text-gray-700">{additionalInfo.confirmation}</p>
            <p className="text-gray-700">{additionalInfo.participation}</p>
            <p className="text-gray-700">{additionalInfo.weatherDependent}</p>
            <p className="text-gray-700">{additionalInfo.minimumRequired}</p>
            <p className="text-gray-700">{additionalInfo.privateActivity}</p>
          </div>
        </Panel>

        {/* Cancellation Policy Panel */}
        <Panel header={cancellation.title} bordered>
          <div className="space-y-4">
            <p className="text-gray-700 font-semibold">{cancellation.freeCancellation}</p>
            <p className="text-gray-700">{cancellation.fullRefund24h}</p>
            <p className="text-gray-700">{cancellation.noRefund24h}</p>
            <p className="text-gray-700">{cancellation.noChanges24h}</p>
            <p className="text-gray-700">{cancellation.timeZoneNote}</p>
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default InfoSection; 