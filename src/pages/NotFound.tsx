import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Package, Home } from "lucide-react";
import { useRole } from "../contexts/RoleContext";

const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useRole();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-hero rounded-xl flex items-center justify-center">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Page Not Found</CardTitle>
          <CardDescription>
            The page you're looking for doesn't exist.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {isAuthenticated 
                ? "You might have mistyped the URL or the page has been moved."
                : "Please log in to access the application."
              }
            </p>
            <Button 
              onClick={() => navigate(isAuthenticated ? "/" : "/login")}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              {isAuthenticated ? "Go to Dashboard" : "Go to Login"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
