"use client"

import { useProperty, useUpdateProperty } from "@/hooks/use-property"
import { PropertyForm, PropertyFormValues } from "@/components/property/property-form"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function EditPropertyPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: property, isLoading } = useProperty(id as string)
  const { mutate: updateProperty, isPending } = useUpdateProperty(id as string)
  
  const onSubmit = (values: PropertyFormValues) => {
    updateProperty(values, {
      onSuccess: () => {
        router.push("/my-properties")
      }
    })
  }

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Property not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-20">
      <div className="text-center space-y-2">
         <h1 className="text-3xl font-bold tracking-tight">Edit Property</h1>
         <p className="text-muted-foreground font-medium text-sm">Update your property information and images.</p>
      </div>

      <PropertyForm 
        initialData={property}
        onSubmit={onSubmit}
        isPending={isPending}
        title="Edit Property"
        description="Modify the details of your property listing."
      />
    </div>
  )
}
