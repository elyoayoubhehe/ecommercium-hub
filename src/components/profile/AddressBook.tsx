import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Home, Plus, MapPin, Check, Trash2, PenSquare } from "lucide-react";

const addressSchema = z.object({
  label: z.string().min(1, "Address label is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
  country: z.string().min(1, "Country is required"),
  isDefault: z.boolean().default(false),
});

type AddressValues = z.infer<typeof addressSchema>;

interface Address extends AddressValues {
  id: string;
}

// Mock data - replace with real address data
const mockAddresses: Address[] = [
  {
    id: "1",
    label: "Home",
    street: "123 Main St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    country: "United States",
    isDefault: true,
  },
  {
    id: "2",
    label: "Work",
    street: "456 Market St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94103",
    country: "United States",
    isDefault: false,
  },
];

export function AddressBook() {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const form = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      isDefault: false,
    },
  });

  const onSubmit = async (data: AddressValues) => {
    try {
      if (editingAddress) {
        // Update existing address
        setAddresses(prev =>
          prev.map(addr =>
            addr.id === editingAddress.id
              ? { ...data, id: addr.id }
              : addr
          )
        );
        toast.success("Address updated successfully");
      } else {
        // Add new address
        const newAddress: Address = {
          ...data,
          id: Math.random().toString(36).substr(2, 9),
        };
        setAddresses(prev => [...prev, newAddress]);
        toast.success("Address added successfully");
      }
      setIsAddingAddress(false);
      setEditingAddress(null);
      form.reset();
    } catch (error) {
      toast.error("Failed to save address");
      console.error("Error saving address:", error);
    }
  };

  const deleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    toast.success("Address deleted successfully");
  };

  const editAddress = (address: Address) => {
    setEditingAddress(address);
    form.reset(address);
    setIsAddingAddress(true);
  };

  const setDefaultAddress = (id: string) => {
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
    toast.success("Default address updated");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Address Book</h2>
        <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Address
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? "Edit Address" : "Add New Address"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Label</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Home, Work" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter street address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter state" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter ZIP code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="United States">
                              United States
                            </SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="United Kingdom">
                              United Kingdom
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingAddress ? "Save Changes" : "Add Address"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <Card key={address.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{address.label}</span>
                {address.isDefault && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editAddress(address)}
                >
                  <PenSquare className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteAddress(address.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <p>{address.street}</p>
              <p>
                {address.city}, {address.state} {address.zipCode}
              </p>
              <p>{address.country}</p>
            </div>

            {!address.isDefault && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-4"
                onClick={() => setDefaultAddress(address.id)}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Set as Default
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
