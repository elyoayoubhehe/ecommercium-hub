import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
      <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
      <p className="text-muted-foreground mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
        <Link to="/client">
          <Button>Return Home</Button>
        </Link>
        <Link to="/client/products">
          <Button variant="outline">Go to Shop</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 