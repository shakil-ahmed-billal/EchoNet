"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useCreateProperty } from "@/hooks/use-property"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Building, MapPin, Info, 
  CheckCircle2, ChevronRight, 
  ChevronLeft, Upload, DollarSign,
  Bed, Bath, Move
} from "lucide-react"

const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.string(),
  priceUnit: z.enum(["TOTAL", "PER_MONTH"]),
  listingType: z.enum(["SALE", "RENT", "LEASE"]),
  category: z.string(),
  city: z.string(),
  area: z.string(),
  address: z.string(),
  details: z.object({
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    areaSqft: z.number(),
    floorNo: z.number().optional(),
    totalFloors: z.number().optional(),
    parking: z.number().optional(),
    facing: z.string().optional(),
    furnished: z.string().optional(),
  }),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.object({ url: z.string(), isCover: z.boolean() })).optional(),
})

export default function NewPropertyPage() {
  const [step, setStep] = useState(1)
  const { mutate: createProperty, isPending } = useCreateProperty()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listingType: "SALE",
      priceUnit: "TOTAL",
      category: "Apartment",
      details: { areaSqft: 0 },
      amenities: [],
      images: []
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createProperty({
       ...values,
       price: Number(values.price),
       details: values.details,
       images: values.images || [
          { url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070&auto=format&fit=crop", isCover: true }
       ]
    })
  }

  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)

  const steps = [
    { title: "Basic Info", icon: <Building /> },
    { title: "Details", icon: <Info /> },
    { title: "Amenities", icon: <CheckCircle2 /> },
    { title: "Pricing & Media", icon: <DollarSign /> },
  ]

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      <div className="text-center space-y-2">
         <h1 className="text-4xl font-black">List Your Property</h1>
         <p className="text-muted-foreground font-medium">Earn more by listing your property on EchoNet's trusted network.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between relative mb-12">
         <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 -z-10" />
         {steps.map((s, i) => (
            <div key={i} className={`flex flex-col items-center gap-2 px-4 bg-background transition-all ${
               step >= i + 1 ? 'text-primary' : 'text-muted-foreground opacity-50'
            }`}>
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${
                  step >= i + 1 ? 'bg-primary/10 border-primary scale-110 shadow-lg shadow-primary/10' : 'bg-background border-muted'
               }`}>
                  {step > i + 1 ? <CheckCircle2 className="h-6 w-6" /> : s.icon}
               </div>
               <span className="text-[10px] font-black">{s.title}</span>
            </div>
         ))}
      </div>

      <Card className="rounded-[40px] border-none shadow-2xl bg-card overflow-hidden">
         <CardContent className="p-10">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
               {step === 1 && (
                  <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-sm font-black text-muted-foreground">Listing Title</label>
                           <Input placeholder="Luxurious Garden Apartment" className="h-12 rounded-xl bg-muted/30 border-none" {...form.register("title")} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-black text-muted-foreground">Listing Type</label>
                           <select className="flex h-12 w-full rounded-xl bg-muted/30 border-none px-3 py-2 text-sm font-bold ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...form.register("listingType")}>
                              <option value="SALE">For Sale</option>
                              <option value="RENT">For Rent</option>
                              <option value="LEASE">For Lease</option>
                           </select>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Address</label>
                        <Input placeholder="Full street address, block, etc." className="h-12 rounded-xl bg-muted/30 border-none" {...form.register("address")} />
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-sm font-black text-muted-foreground">City</label>
                           <Input placeholder="e.g., Dhaka" className="h-12 rounded-xl bg-muted/30 border-none" {...form.register("city")} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-black text-muted-foreground">Area</label>
                           <Input placeholder="e.g., Gulshan" className="h-12 rounded-xl bg-muted/30 border-none" {...form.register("area")} />
                        </div>
                     </div>
                  </div>
               )}

               {step === 2 && (
                  <div className="space-y-6">
                     <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                           <label className="flex items-center gap-1.5 text-sm font-black text-muted-foreground"><Bed className="h-4 w-4" /> Bedrooms</label>
                           <Input type="number" className="h-12 rounded-xl bg-muted/30 border-none" {...form.register("details.bedrooms", { valueAsNumber: true })} />
                        </div>
                        <div className="space-y-2">
                           <label className="flex items-center gap-1.5 text-sm font-black text-muted-foreground"><Bath className="h-4 w-4" /> Bathrooms</label>
                           <Input type="number" className="h-12 rounded-xl bg-muted/30 border-none" {...form.register("details.bathrooms", { valueAsNumber: true })} />
                        </div>
                        <div className="space-y-2">
                           <label className="flex items-center gap-1.5 text-sm font-black text-muted-foreground"><Move className="h-4 w-4" /> Sqft</label>
                           <Input type="number" className="h-12 rounded-xl bg-muted/30 border-none" {...form.register("details.areaSqft", { valueAsNumber: true })} />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Description</label>
                        <Textarea placeholder="Describe your property in detail..." className="rounded-xl bg-muted/30 border-none min-h-[150px]" {...form.register("description")} />
                     </div>
                  </div>
               )}

               {step === 3 && (
                  <div className="space-y-6">
                     <label className="text-sm font-black uppercase tracking-widest text-muted-foreground block mb-4">Select Amenities</label>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {['Gas', 'Water', 'Lift', 'CCTV', 'Security', 'Generator', 'Parking', 'Gym', 'Pool'].map((amenity) => (
                           <div key={amenity} className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors cursor-pointer group">
                              <input 
                                type="checkbox" 
                                value={amenity} 
                                className="w-5 h-5 rounded-md border-primary text-primary focus:ring-primary"
                                onChange={(e) => {
                                   const current = form.getValues("amenities") || []
                                   if (e.target.checked) form.setValue("amenities", [...current, amenity])
                                   else form.setValue("amenities", current.filter(a => a !== amenity))
                                }}
                              />
                              <span className="text-sm font-bold">{amenity}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {step === 4 && (
                  <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Price Amount</label>
                           <Input placeholder="50,000" className="h-12 rounded-xl bg-muted/30 border-none" {...form.register("price")} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Price Unit</label>
                           <select className="flex h-12 w-full rounded-xl bg-muted/30 border-none px-3 py-2 text-sm font-bold" {...form.register("priceUnit")}>
                              <option value="TOTAL">Full Price (Sale)</option>
                              <option value="PER_MONTH">Per Month (Rent)</option>
                           </select>
                        </div>
                     </div>
                     
                     <div className="space-y-4">
                        <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Property Images</label>
                        <div className="border-2 border-dashed border-border/60 rounded-3xl p-12 text-center bg-muted/10 group hover:bg-muted/20 transition-all cursor-pointer">
                           <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4 group-hover:text-primary transition-colors" />
                           <p className="font-bold text-muted-foreground">Drag and drop images here, or click to browse</p>
                           <p className="text-xs text-muted-foreground/60 mt-2 font-medium">JPEG, PNG, WebP (Max 5MB per file)</p>
                        </div>
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest text-center mt-2 flex items-center justify-center gap-1.5">
                           <Info className="h-3 w-3" /> Minimum 1 cover photo required for activation
                        </p>
                     </div>
                  </div>
               )}

               <div className="flex gap-4 pt-8 border-t border-border/40">
                  {step > 1 && (
                     <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl font-black border-2" onClick={prevStep}>
                        <ChevronLeft className="mr-2 h-5 w-5" /> Back
                     </Button>
                  )}
                  {step < 4 ? (
                     <Button type="button" className="flex-1 h-14 rounded-2xl font-black shadow-xl shadow-primary/20" onClick={nextStep}>
                        Next Step <ChevronRight className="ml-2 h-5 w-5" />
                     </Button>
                  ) : (
                     <Button type="submit" disabled={isPending} className="flex-1 h-14 rounded-2xl font-black shadow-xl shadow-primary/20 bg-emerald-500 hover:bg-emerald-600">
                        {isPending ? 'Publishing...' : 'Publish Listing'}
                     </Button>
                  )}
               </div>
            </form>
         </CardContent>
      </Card>
      
    </div>
  )
}
