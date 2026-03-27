"use client"

import { useCreateProperty } from "@/hooks/use-property"
import { PropertyForm, PropertyFormValues } from "@/components/property/property-form"
import { useRouter } from "next/navigation"

export default function NewPropertyPage() {
  const router = useRouter()
  const { mutate: createProperty, isPending } = useCreateProperty()
  
  const onSubmit = (values: FormData) => {
    createProperty(values, {
      onSuccess: () => {
        router.push("/my-properties")
      }
    })
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-20">
      <div className="text-center space-y-2">
         <h1 className="text-3xl font-bold tracking-tight">List Your Property</h1>
         <p className="text-muted-foreground font-medium text-sm">Earn more by listing your property on EchoNet's trusted network.</p>
      </div>

      <PropertyForm 
        onSubmit={onSubmit}
        isPending={isPending}
        title="List New Property"
        description="Fill in the details to list your property."
      />
    </div>
  )
}
