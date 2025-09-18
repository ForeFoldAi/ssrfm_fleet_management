import { Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useRole } from "../contexts/RoleContext";

interface UnitFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const UnitFilter = ({ value, onValueChange, className = "" }: UnitFilterProps) => {
  const { currentUser } = useRole();

  // Available units for company owner
  const availableUnits = [
    { id: "unit-1", name: "SSRFM Unit 1", location: "Mumbai" },
    { id: "unit-2", name: "SSRFM Unit 2", location: "Delhi" },
    { id: "unit-3", name: "SSRFM Unit 3", location: "Bangalore" },
    { id: "unit-4", name: "SSRFM Unit 4", location: "Chennai" }
  ];

  // Only show unit filter for company owners
  if (currentUser?.role !== 'company_owner') {
    return null;
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`w-full sm:w-48 ${className}`}>
        <SelectValue placeholder="Select Unit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Units</SelectItem>
        {availableUnits.map((unit) => (
          <SelectItem key={unit.id} value={unit.id}>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <div>
                <div className="font-medium">{unit.name}</div>
                <div className="text-xs text-muted-foreground">{unit.location}</div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};