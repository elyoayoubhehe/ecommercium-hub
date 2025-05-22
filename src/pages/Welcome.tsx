import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Store, User, Loader2 } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, loading } = useAuth();

  // If user is already authenticated, redirect to the appropriate interface
  if (isAuthenticated && !loading) {
    return <Navigate to={isAdmin ? "/admin" : "/client"} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <Card className="w-full max-w-md p-8 space-y-8">
        <div className="text-center space-y-4">
          <Store className="mx-auto h-16 w-16 text-primary" />
          <h1 className="text-3xl font-bold text-primary">Welcome to E-Shop</h1>
          <p className="text-muted-foreground">Your one-stop online shopping destination</p>
        </div>
        
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Button 
                className="w-full h-12 text-lg"
                onClick={() => navigate("/client")}
              >
                Continue as Guest
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => navigate("/register")}
                >
                  Register
                </Button>
              </div>
              
              <p className="text-center text-sm text-muted-foreground">
                Create an account to track orders and save your favorite items
              </p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Welcome;