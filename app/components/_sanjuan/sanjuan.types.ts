export interface InfoSectionProps {
  accessibility: {
    title: string;
    wheelchairAccess: string;
    babySeating: string;
    helpText: string;
    phoneNumber: string;
  };
  additionalInfo: {
    title: string;
    confirmation: string;
    participation: string;
    weatherDependent: string;
    minimumRequired: string;
    privateActivity: string;
  };
  cancellation: {
    title: string;
    freeCancellation: string;
    fullRefund24h: string;
    noRefund24h: string;
    noChanges24h: string;
    timeZoneNote: string;
  };
} 