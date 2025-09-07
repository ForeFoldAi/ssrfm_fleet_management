import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Package, User, Settings, Shield } from "lucide-react";
import { useRole, UserRole } from "../contexts/RoleContext";
import { toast } from "../hooks/use-toast";

const DEMO_USERS = [
  { name: 'John Martinez', email: 'john@demo.com', password: 'supervisor123', role: 'site_supervisor' as UserRole, icon: User, color: 'bg-blue-500' },
  { name: 'Sarah Chen', email: 'sarah@demo.com', password: 'manager123', role: 'inventory_manager' as UserRole, icon: Settings, color: 'bg-orange-500' },
  { name: 'Robert Williams', email: 'robert@demo.com', password: 'owner123', role: 'company_owner' as UserRole, icon: Shield, color: 'bg-purple-500' }
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setCurrentUser } = useRole();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    
    if (user) {
      setCurrentUser({ id: '1', name: user.name, email: user.email, role: user.role, department: 'Demo Department' });
      toast({ title: "Login Successful", description: `Welcome back, ${user.name}!` });
      navigate("/");
    } else {
      toast({ title: "Login Failed", description: "Invalid credentials", variant: "destructive" });
    }
  };

  const handleDemoLogin = (user: typeof DEMO_USERS[0]) => {
    setCurrentUser({ id: '1', name: user.name, email: user.email, role: user.role, department: 'Demo Department' });
    toast({ title: "Demo Login", description: `Logged in as ${user.name}` });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2 lg:gap-8">
        <Card className="w-full max-w-sm md:max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to SSRFM</CardTitle>
            <CardDescription>Sign in to access the Materials Management System</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">Sign In</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Try Demo Accounts</h2>
            <p className="text-lg text-muted-foreground">Experience different user roles</p>
          </div>
          {DEMO_USERS.map((user) => {
            const Icon = user.icon;
            return (
              <Card key={user.email} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleDemoLogin(user)}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 ${user.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.role.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">{user.email} / {user.password}</p>
                    </div>
                    <Button variant="outline" size="sm">Login</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Login;