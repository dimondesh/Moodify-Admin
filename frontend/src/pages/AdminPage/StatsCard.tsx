import { Card, CardContent } from "../../components/ui/card";

type StatsCardProps = {
  icon: React.ElementType;
  label: string;
  value: string;
  bgColor: string;
  iconColor: string;
};

const StatsCard = ({
  bgColor,
  icon: Icon,
  iconColor,
  label,
  value,
}: StatsCardProps) => {
  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#2a2a2a] transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${bgColor}`}>
            <Icon className={`size-6 ${iconColor}`} />
          </div>
          <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default StatsCard;
