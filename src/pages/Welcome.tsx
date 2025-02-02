import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <Card className="w-full max-w-md p-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">Welcome to E-Shop</h1>
          <p className="text-muted-foreground">Choose your interface to continue</p>
        </div>
        
        <div className="space-y-4">
          <Button 
            className="w-full h-12 text-lg"
            onClick={() => navigate("/client")}
          >
            Client Interface
          </Button>
          
          <Button 
            variant="outline"
            className="w-full h-12 text-lg"
            onClick={() => navigate("/admin")}
          >
            Admin Interface
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Welcome;