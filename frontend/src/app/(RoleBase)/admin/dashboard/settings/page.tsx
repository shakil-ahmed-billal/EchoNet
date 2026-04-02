"use client"

import { useStoryDuration, useUpdateStoryDuration } from "@/hooks/use-settings"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, Settings, Clock, Save, ShieldCheck, Activity } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export default function AdminSettingsPage() {
  const { data: currentDuration, isLoading } = useStoryDuration()
  const { mutate: updateDuration, isPending: isUpdating } = useUpdateStoryDuration()
  const [selectedDuration, setSelectedDuration] = useState<string>("")

  useEffect(() => {
    if (currentDuration) {
      setSelectedDuration(String(currentDuration))
    }
  }, [currentDuration])

  const handleSave = () => {
    if (selectedDuration) {
      updateDuration(selectedDuration)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary/50" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
             <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                <Settings className="size-6 text-primary" />
             </div>
             Platform <span className="text-primary italic">Settings.</span>
          </h1>
          <div className="text-sm font-medium text-muted-foreground flex items-center gap-2 mt-2">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Global Systems Configuration — Active Session
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <Card className="group relative overflow-hidden rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl transition-all duration-500 hover:shadow-xl hover:border-primary/20">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-700 pointer-events-none" />
            
            <CardHeader className="p-8 border-b border-border/10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-muted/30 flex items-center justify-center shadow-inner text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black tracking-tight">Story Retention Policy</CardTitle>
                  <CardDescription className="text-sm font-medium flex items-center gap-1.5">
                    <Activity className="size-3 text-emerald-500" /> Automated content purging system
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="duration" className="text-sm font-black tracking-tight text-muted-foreground/70 ml-1 uppercase">
                    Visibility Duration
                  </Label>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Select how long user stories remain discoverable in the shared network.</p>
                </div>
                
                <Select 
                  value={selectedDuration} 
                  onValueChange={(val) => setSelectedDuration(val || "2")}
                >
                  <SelectTrigger id="duration" className="h-14 rounded-2xl border-border/40 bg-muted/20 focus:ring-primary/20 focus:border-primary/40 transition-all font-bold text-base px-6">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/40 shadow-2xl p-2">
                    <SelectItem value="2" className="py-3 rounded-xl font-bold cursor-pointer focus:bg-primary/10 transition-colors">2 Days (Standard)</SelectItem>
                    <SelectItem value="7" className="py-3 rounded-xl font-bold cursor-pointer focus:bg-primary/10 transition-colors">7 Days (Weekly)</SelectItem>
                    <SelectItem value="15" className="py-3 rounded-xl font-bold cursor-pointer focus:bg-primary/10 transition-colors">15 Days (Bi-weekly)</SelectItem>
                    <SelectItem value="unlimited" className="py-3 rounded-xl font-black cursor-pointer text-primary bg-primary/5 focus:bg-primary/10 transition-colors">Unlimited (Permanent)</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="p-4 rounded-2xl bg-muted/10 border border-border/20 flex items-start gap-3 mt-4">
                  <ShieldCheck className="size-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-muted-foreground/80 leading-relaxed italic">
                    <span className="font-bold text-foreground block mb-0.5">Critical Notice:</span>
                    Retention modifications take immediate effect on all infrastructure layers, however, existing objects remain bound to their original timestamp metadata. Purge cycles execute every 24 hours.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={isUpdating || selectedDuration === String(currentDuration)}
                  className={cn(
                    "h-14 px-10 rounded-2xl font-black tracking-tight transition-all duration-300 shadow-lg flex items-center gap-3",
                    selectedDuration === String(currentDuration) 
                      ? "bg-muted text-muted-foreground opacity-50" 
                      : "bg-primary text-primary-foreground hover:scale-[1.02] hover:shadow-primary/25 active:scale-95"
                  )}
                >
                  {isUpdating ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Save className="size-5" />
                  )}
                  Apply New Retention Logic
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-3xl border border-dashed border-border/60 bg-muted/5 flex items-center justify-center p-12 h-full min-h-[300px]">
            <CardContent className="text-center space-y-4">
               <div className="size-16 rounded-3xl bg-muted/20 flex items-center justify-center mx-auto mb-4">
                  <Settings className="size-8 text-muted-foreground/30" />
               </div>
               <p className="text-xs font-bold text-muted-foreground/40 leading-relaxed max-w-[200px] mx-auto">
                  System expansion in progress. More advanced configuration modules are being operationalized.
               </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
