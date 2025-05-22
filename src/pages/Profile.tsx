import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClientNav } from "@/components/ClientNav";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Save, Loader2 } from "lucide-react";
import { toast } from 'sonner';

const Profile = () => {
  const { currentUser, updateUserProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    password: "",
    confirmPassword: "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords if attempting to change password
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await updateUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password || undefined
      });
      
      toast.success("Profile updated successfully");
      setIsEditing(false);
      setFormData(prev => ({
        ...prev,
        password: "",
        confirmPassword: ""
      }));
    } catch (err) {
      setError("Failed to update profile");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Failed to log out", err);
    }
  };
  
  if (!currentUser) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
        <div className="grid gap-8 md:grid-cols-[300px_1fr]">
          {/* Left sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Account</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 text-2xl font-medium">
                    {currentUser.firstName?.charAt(0) || ""}{currentUser.lastName?.charAt(0) || ""}
                  </div>
                  <p className="font-medium">{currentUser.firstName} {currentUser.lastName}</p>
                  <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/client/orders")}
                  >
                    My Orders
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </CardHeader>
              <form onSubmit={handleSave}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={!isEditing || isLoading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={!isEditing || isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      disabled={true}
                    />
                  </div>
                  
                  {isEditing && (
                    <>
                      <Separator className="my-4" />
                      <CardTitle className="text-base mb-2">Change Password</CardTitle>
                      <CardDescription className="mb-4">Leave blank to keep current password</CardDescription>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleChange}
                          disabled={isLoading}
                          placeholder="••••••"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          disabled={isLoading}
                          placeholder="••••••"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
                
                {isEditing && (
                  <CardFooter className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setError(null);
                        setFormData({
                          firstName: currentUser.firstName || "",
                          lastName: currentUser.lastName || "",
                          email: currentUser.email || "",
                          password: "",
                          confirmPassword: "",
                        });
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                )}
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
