export const DateTime = ({ date }: { date: Date }) => {
  return <div className="date-time">{date.toLocaleDateString()}</div>;
};
