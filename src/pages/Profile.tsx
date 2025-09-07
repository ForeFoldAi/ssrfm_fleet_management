import { useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, Building, Edit, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { useRole } from "../contexts/RoleContext";
import { toast } from "../hooks/use-toast";

const Profile = () => {
  const { currentUser } = useRole();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: "john.martinez@ssrfm.com",
    phone: "+91 98765 43210",
    address: "123 Industrial Area, Mumbai, Maharashtra 400001",
    department: "Production Floor A",
    employeeId: "EMP-2023-045",
    joinDate: "March 15, 2020",
    supervisor: "Sarah Chen",
    bio: "Experienced site supervisor with 8+ years in industrial operations. Specialized in production line management and quality assurance."
  });

  const roleConfig = {
    site_supervisor: {
      label: "Site Supervisor",
      color: "bg-blue-500",
      description: "Operations & Requests Management"
    },
    inventory_manager: {
      label: "Inventory Manager",
      color: "bg-orange-500",
      description: "Inventory & Approvals Management"
    },
    company_owner: {
      label: "Company Owner",
      color: "bg-purple-500",
      description: "Full Business Control & Strategy"
    }
  };

  const currentRoleConfig = roleConfig[currentUser?.role || 'site_supervisor'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || "",
      email: "john.martinez@ssrfm.com",
      phone: "+91 98765 43210",
      address: "123 Industrial Area, Mumbai, Maharashtra 400001",
      department: "Production Floor A",
      employeeId: "EMP-2023-045",
      joinDate: "March 15, 2020",
      supervisor: "Sarah Chen",
      bio: "Experienced site supervisor with 8+ years in industrial operations. Specialized in production line management and quality assurance."
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            My Profile
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your personal information and account settings
          </p>
        </div>
        
        <div className="flex gap-3">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel} className="gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="card-friendly lg:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className={`w-24 h-24 ${currentRoleConfig.color} rounded-full flex items-center justify-center`}>
                <User className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-xl">{formData.name}</CardTitle>
            <div className="space-y-2">
              <Badge className={currentRoleConfig.color}>
                {currentRoleConfig.label}
              </Badge>
              <p className="text-sm text-muted-foreground">{currentRoleConfig.description}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{formData.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{formData.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span>{formData.department}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Joined {formData.joinDate}</span>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="card-friendly lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-medium p-2 bg-secondary/30 rounded-md">{formData.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-medium p-2 bg-secondary/30 rounded-md">{formData.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-medium p-2 bg-secondary/30 rounded-md">{formData.phone}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <p className="text-sm font-medium p-2 bg-secondary/30 rounded-md">{formData.employeeId}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              ) : (
                <p className="text-sm font-medium p-2 bg-secondary/30 rounded-md">{formData.address}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="min-h-[100px]"
                />
              ) : (
                <p className="text-sm p-2 bg-secondary/30 rounded-md">{formData.bio}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Work Information */}
      <Card className="card-friendly">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Work Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label>Department</Label>
              <p className="text-sm font-medium p-2 bg-secondary/30 rounded-md">{formData.department}</p>
            </div>
            
            <div className="space-y-2">
              <Label>Role</Label>
              <p className="text-sm font-medium p-2 bg-secondary/30 rounded-md">{currentRoleConfig.label}</p>
            </div>
            
            <div className="space-y-2">
              <Label>Supervisor</Label>
              <p className="text-sm font-medium p-2 bg-secondary/30 rounded-md">{formData.supervisor}</p>
            </div>
            
            <div className="space-y-2">
              <Label>Join Date</Label>
              <p className="text-sm font-medium p-2 bg-secondary/30 rounded-md">{formData.joinDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-friendly">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Requests Submitted</p>
                <p className="text-2xl font-bold text-blue-600">24</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-friendly">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved Requests</p>
                <p className="text-2xl font-bold text-blue-600">22</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-friendly">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Years of Service</p>
                <p className="text-2xl font-bold text-purple-600">4.2</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile; 