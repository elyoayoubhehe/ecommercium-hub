import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClientNav } from "@/components/ClientNav";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, loading, clearError, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiStatus, setApiStatus] = useState("Not tested");
  
  // Handle redirection after successful login
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || (isAdmin ? "/admin" : "/client");
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, location]);

  // Test API connectivity on component mount
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        setApiStatus("Testing...");
        const response = await fetch('http://localhost:5000/api/products');
        if (response.ok) {
          const data = await response.json();
          setApiStatus(`Connected, found ${data.length} products`);
        } else {
          setApiStatus(`API responded with status: ${response.status}`);
        }
      } catch (err) {
        setApiStatus(`Connection error: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    testApiConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log("Attempting login with:", { email, password });
      await login(email, password);
      
      // No need to navigate here, the useEffect will handle it once isAuthenticated changes
    } catch (err) {
      toast.error("Login failed: " + (err instanceof Error ? err.message : "Unknown error"));
      console.error("Login error in component:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
            <div className="text-sm mt-2 p-2 bg-slate-100 rounded">
              API Status: {apiStatus}
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError();
                  }}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError();
                  }}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
              
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Register
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login; 