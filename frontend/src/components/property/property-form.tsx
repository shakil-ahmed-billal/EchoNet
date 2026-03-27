"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Building, MapPin, Info, 
  CheckCircle2, DollarSign,
  Bed, Bath, Move, Loader2
} from "lucide-react"
import { ImageUpload } from "./image-upload"

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  priceUnit: z.enum(["TOTAL", "PER_MONTH"]),
  listingType: z.enum(["SALE", "RENT", "LEASE"]),
  category: z.string().min(1, "Category is required"),
  city: z.string().min(1, "City is required"),
  area: z.string().min(1, "Area is required"),
  address: z.string().min(1, "Address is required"),
  details: z.object({
    bedrooms: z.coerce.number().optional(),
    bathrooms: z.coerce.number().optional(),
    areaSqft: z.coerce.number().positive("Area is required"),
    floorNo: z.coerce.number().optional(),
    totalFloors: z.coerce.number().optional(),
    parking: z.coerce.number().optional(),
    facing: z.string().optional(),
    furnished: z.string().optional(),
  }),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.any()).min(1, "At least one image is required"),
})

export type PropertyFormValues = z.infer<typeof formSchema>

interface PropertyFormProps {
  initialData?: any
  onSubmit: (values: FormData) => void
  isPending: boolean
  title: string
  description: string
}

export function PropertyForm({
  initialData,
  onSubmit,
  isPending,
  title,
  description
}: PropertyFormProps) {
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
        ...initialData,
        images: initialData.images?.map((img: any) => ({
            url: img.url,
            isCover: img.isCover,
            id: img.id
        })) || []
    } : {
      title: "",
      description: "",
      price: 0,
      listingType: "SALE",
      priceUnit: "TOTAL",
      category: "Apartment",
      city: "",
      area: "",
      address: "",
      details: { areaSqft: 0 },
      amenities: [],
      images: []
    }
  })

  const handleFormSubmit = (values: PropertyFormValues) => {
    const formData = new FormData();
    
    // 1. Separate files from text data
    const files = values.images
        .filter((img: any) => !!img.file)
        .map((img: any) => img.file as File);
    
    const existingImages = values.images
        .filter((img: any) => !img.file)
        .map((img: any) => ({ url: img.url, isCover: img.isCover, id: img.id }));

    // 2. Prepare payload without raw files
    const payload = {
        ...values,
        images: existingImages // Server will append new ones
    };

    // 3. Append to FormData
    formData.append("data", JSON.stringify(payload));
    files.forEach(file => {
        formData.append("images", file);
    });

    onSubmit(formData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <Card className="rounded-2xl border border-border/50 shadow-sm overflow-hidden bg-card p-0">
              <CardHeader className="bg-muted/30 border-b border-border/50 py-4 px-6">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" /> Basic Information
                </CardTitle>
                <CardDescription className="text-xs">Provide essential details about your property.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">Listing Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Luxurious 3BR Apartment in Gulshan" {...field} className="rounded-xl border-border/50 focus-visible:ring-primary/20" />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="listingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider">Listing Type</FormLabel>
                        <select 
                          className="flex h-10 w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="SALE">For Sale</option>
                          <option value="RENT">For Rent</option>
                          <option value="LEASE">For Lease</option>
                        </select>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider">Property Category</FormLabel>
                        <select 
                          className="flex h-10 w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm ring-offset-background"
                          {...field}
                        >
                          <option value="Apartment">Apartment</option>
                          <option value="House">House</option>
                          <option value="Duplex">Duplex</option>
                          <option value="Penthouse">Penthouse</option>
                          <option value="Plot">Plot / Land</option>
                          <option value="Commercial">Commercial Space</option>
                        </select>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the property's key features, environment, and why someone should buy or rent it..." 
                          className="min-h-[150px] rounded-xl border-border/50 focus-visible:ring-primary/20 resize-none text-sm"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="rounded-2xl border border-border/50 shadow-sm overflow-hidden bg-card p-0">
              <CardHeader className="bg-muted/30 border-b border-border/50 py-4 px-6">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider">Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="House #, Block #, Road #" {...field} className="rounded-xl border-border/50 focus-visible:ring-primary/20" />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider">City</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Dhaka" {...field} className="rounded-xl border-border/50 focus-visible:ring-primary/20" />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider">Area</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Gulshan 2" {...field} className="rounded-xl border-border/50 focus-visible:ring-primary/20" />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="rounded-2xl border border-border/50 shadow-sm overflow-hidden bg-card p-0">
              <CardHeader className="bg-muted/30 border-b border-border/50 py-4 px-6">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Amenities & Features
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Gas', 'Water', 'Lift', 'CCTV', 'Security', 'Generator', 'Parking', 'Gym', 'Pool'].map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id={`amenity-${amenity}`}
                        defaultChecked={initialData?.amenities?.includes(amenity)}
                        value={amenity} 
                        className="w-4 h-4 rounded border-border/50 text-primary shadow-sm"
                        onChange={(e) => {
                          const current = form.getValues("amenities") || []
                          if (e.target.checked) form.setValue("amenities", [...current, amenity])
                          else form.setValue("amenities", (current as any).filter((a: any) => a !== amenity))
                        }}
                      />
                      <label htmlFor={`amenity-${amenity}`} className="text-sm font-medium text-muted-foreground">{amenity}</label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-8">
            {/* Property Details */}
            <Card className="rounded-2xl border border-border/50 shadow-sm overflow-hidden bg-card p-0">
               <CardHeader className="bg-muted/30 border-b border-border/50 py-4 px-6">
                <CardTitle className="text-sm uppercase tracking-wider font-bold">Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <FormField
                  control={form.control}
                  name="details.areaSqft"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Area (Sqft)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Move className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <Input type="number" {...field} className="pl-9 rounded-xl border-border/50" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="details.bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Beds</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Bed className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input type="number" {...field} className="pl-9 rounded-xl border-border/50" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="details.bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Baths</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Bath className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input type="number" {...field} className="pl-9 rounded-xl border-border/50" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="rounded-2xl border border-border/50 shadow-sm overflow-hidden bg-card p-0">
              <CardHeader className="bg-muted/30 border-b border-border/50 py-4 px-6">
                <CardTitle className="text-sm uppercase tracking-wider font-bold">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">৳</span>
                          <Input type="number" {...field} className="pl-8 rounded-xl border-border/50 text-emerald-600 font-bold" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priceUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Payment Type</FormLabel>
                      <select 
                        className="flex h-10 w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-xs font-semibold ring-offset-background"
                        {...field}
                      >
                        <option value="TOTAL">Full Price (Sale)</option>
                        <option value="PER_MONTH">Per Month (Rent)</option>
                      </select>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Media */}
            <Card className="rounded-2xl border border-border/50 shadow-sm overflow-hidden bg-card p-0">
              <CardHeader className="bg-muted/30 border-b border-border/50 py-4 px-6">
                <CardTitle className="text-sm uppercase tracking-wider font-bold">Property Images</CardTitle>
                <CardDescription className="text-[10px]">Add at least 1 image. Max 10.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUpload 
                          value={field.value} 
                          onChange={field.onChange} 
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button 
                type="submit" 
                disabled={isPending} 
                className="w-full h-12 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {initialData ? "Save Changes" : "Publish Listing"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
