import { useState } from "react";
import { Eye, Search, List, Table } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const RecentActivity = () => {
  const [viewMode, setViewMode] = useState<"table" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");

  const activities = [
    {
      id: 1,
      type: "Material Request",
      description: "Steel rods requested for Machine #45",
      status: "Pending",
      time: "2 hours ago",
      user: "John Smith",
      priority: "High"
    },
    {
      id: 2,
      type: "Stock Alert",
      description: "Cement bags running low (5 remaining)",
      status: "Low Stock",
      time: "4 hours ago",
      user: "System",
      priority: "Medium"
    },
    {
      id: 3,
      type: "Request Approved",
      description: "Hydraulic oil approved for Machine #12",
      status: "Approved",
      time: "6 hours ago",
      user: "Maria Garcia",
      priority: "Low"
    },
    {
      id: 4,
      type: "New Material",
      description: "Industrial bolts added to inventory",
      status: "Completed",
      time: "1 day ago",
      user: "Ahmed Hassan",
      priority: "Low"
    }
  ];

  const filteredActivities = activities.filter(activity =>
    activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const badges = {
      "Pending": "badge-status bg-warning/10 text-warning ring-1 ring-warning/20",
      "Low Stock": "badge-status bg-destructive/10 text-destructive ring-1 ring-destructive/20",
      "Approved": "badge-status bg-success/10 text-success ring-1 ring-success/20",
      "Completed": "badge-status bg-success/10 text-success ring-1 ring-success/20"
    };
    return badges[status as keyof typeof badges] || "badge-status bg-muted text-muted-foreground";
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      "High": "badge-status bg-destructive/10 text-destructive ring-1 ring-destructive/20",
      "Medium": "badge-status bg-warning/10 text-warning ring-1 ring-warning/20",
      "Low": "badge-status bg-primary/10 text-primary ring-1 ring-primary/20"
    };
    return badges[priority as keyof typeof badges] || "badge-status bg-muted text-muted-foreground";
  };

  return (
    <div className="card-friendly p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Recent Activity</h2>
          <p className="text-muted-foreground">Latest updates and actions in your system</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-friendly"
            />
          </div>
          
          {/* View Toggle */}
          <div className="flex rounded-xl border border-border overflow-hidden bg-secondary">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="rounded-none"
            >
              <Table className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === "list" ? (
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="border border-border rounded-xl p-4 hover:bg-secondary/30 transition-colors duration-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{activity.type}</h3>
                    <span className={getStatusBadge(activity.status)}>
                      {activity.status}
                    </span>
                    <span className={getPriorityBadge(activity.priority)}>
                      {activity.priority}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-2">{activity.description}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>By {activity.user}</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-semibold text-foreground">Type</th>
                <th className="text-left py-3 px-2 font-semibold text-foreground">Description</th>
                <th className="text-left py-3 px-2 font-semibold text-foreground">Status</th>
                <th className="text-left py-3 px-2 font-semibold text-foreground">Priority</th>
                <th className="text-left py-3 px-2 font-semibold text-foreground">User</th>
                <th className="text-left py-3 px-2 font-semibold text-foreground">Time</th>
                <th className="text-left py-3 px-2 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map((activity) => (
                <tr key={activity.id} className="border-b border-border hover:bg-accent/20 transition-colors duration-200">
                  <td className="py-3 px-2 font-medium text-foreground">{activity.type}</td>
                  <td className="py-3 px-2 text-muted-foreground">{activity.description}</td>
                  <td className="py-3 px-2">
                    <span className={getStatusBadge(activity.status)}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={getPriorityBadge(activity.priority)}>
                      {activity.priority}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground">{activity.user}</td>
                  <td className="py-3 px-2 text-muted-foreground">{activity.time}</td>
                  <td className="py-3 px-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View All Button */}
      <div className="mt-6 text-center">
        <Button variant="outline" size="lg" className="btn-friendly">
          <Eye className="w-5 h-5 mr-2" />
          View All Activities
        </Button>
      </div>
    </div>
  );
};