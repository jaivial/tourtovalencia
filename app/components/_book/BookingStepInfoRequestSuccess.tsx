interface BookingStepInfoRequestSuccessProps {
  text: {
    title: string;
    description: string;
  };
}

export const BookingStepInfoRequestSuccess = ({ text }: BookingStepInfoRequestSuccessProps) => {
  return (
    <div className="space-y-4 text-center py-6">
      <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-semibold">
        ✓
      </div>
      <h3 className="text-xl font-semibold text-foreground">{text.title}</h3>
      <p className="text-muted-foreground">{text.description}</p>
    </div>
  );
};
