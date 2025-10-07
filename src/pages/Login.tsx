import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRole, UserRole, deriveUserRole } from '../contexts/RoleContext';
import { toast } from '../hooks/use-toast';
import { authService } from '../lib/api/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useRole();

  // Get role-specific redirect path
  const getRoleRedirectPath = (role: UserRole) => {
    switch (role) {
      case 'supervisor':
        return '/materials-inventory';
      case 'company_owner':
        return '/';
      default:
        return '/';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiResp = await authService.login({ email, password });
      const apiUser = apiResp.user;
      const permissions = authService.getPermissions();

      // Derive a legacy label for UI only
      const derivedRole = deriveUserRole(permissions) as UserRole;

      // Update context user
      setCurrentUser({
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        role: derivedRole,
        department: apiUser.branch?.name,
      });

      // Notify app to refresh permission state
      window.dispatchEvent(new Event('auth:updated'));

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${apiUser?.name || 'User'}!`,
      });

      // Role-based redirect logic (always go to role-specific default since logout clears last visited path)
      const getRoleRedirectPath = (role: UserRole) => {
        console.log('Login: Redirecting to role-specific page for:', role);
        switch (role) {
          case 'supervisor':
            return '/materials-inventory';
          case 'company_owner':
            return '/'; // This will show CompanyOwnerDashboard
          default:
            return '/';
        }
      };

      const redirectPath = getRoleRedirectPath(derivedRole);
      
      navigate(redirectPath);
    } catch (err) {
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <Card className='w-full mx-auto'>
          <CardHeader className='text-center'>
            <div className='flex items-center justify-center mx-auto mb-4'>
              <img
                src='/logo.png'
                alt='Company Logo'
                className='h-20 w-auto object-contain'
              />
            </div>

            <CardDescription>
              Sign in to access the Operations Management System
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='Enter your email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter your password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className='pr-10'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none'
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </div>
              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
