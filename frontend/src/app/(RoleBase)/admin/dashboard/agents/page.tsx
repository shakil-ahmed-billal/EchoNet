"use client"

import { useAgents, useVerifyAgent } from "@/hooks/use-property"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, BadgeCheck, FileText, Briefcase, Mail, Phone, Loader2, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export default function AdminAgentsPage() {
  const { data: agents, isLoading } = useAgents({ isVerified: false })
  const { mutate: verify, isPending: isVerifying } = useVerifyAgent()

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Agent Verification</h1>
          <p className="text-muted-foreground mt-1 font-medium italic">Review documents and approve verified real estate professionals.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search applicants..." className="pl-9 rounded-2xl bg-card border-none" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
           <Loader2 className="h-12 w-12 text-primary animate-spin opacity-20" />
        </div>
      ) : agents?.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-4">
          {agents.map((agent: any) => (
            <Card key={agent.id} className="rounded-[40px] border-none shadow-sm overflow-hidden hover:shadow-2xl transition-all bg-card/50 backdrop-blur-sm border border-border/40">
              <CardContent className="p-10 flex flex-col md:flex-row gap-10">
                <div className="flex flex-col items-center md:items-start shrink-0 text-center md:text-left md:w-1/3 border-b md:border-b-0 md:border-r border-border/20 pb-8 md:pb-0 md:pr-10">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-black mb-6 mx-auto md:mx-0 shadow-inner relative overflow-hidden ring-4 ring-primary/5">
                    {agent.user?.avatarUrl ? (
                       <Image src={agent.user.avatarUrl} alt="" fill className="object-cover" />
                    ) : agent.user?.name?.[0]}
                  </div>
                  <h3 className="font-black text-xl mb-1">{agent.user?.name}</h3>
                  <p className="text-[10px] font-bold text-orange-500 tracking-widest uppercase mb-6 bg-orange-500/10 px-3 py-1 rounded-full">Pending Review</p>
                  
                  <div className="flex flex-col gap-3 w-full">
                     <p className="flex items-center justify-center md:justify-start gap-2.5 text-xs font-bold text-muted-foreground break-all">
                        <Mail className="w-4 h-4 text-primary" /> {agent.user?.email}
                     </p>
                     <p className="flex items-center justify-center md:justify-start gap-2.5 text-xs font-bold text-muted-foreground">
                        <Phone className="w-4 h-4 text-primary" /> {agent.phone || 'N/A'}
                     </p>
                  </div>
                </div>

                <div className="flex flex-col flex-1 justify-between">
                  <div>
                     <h4 className="font-black text-[10px] text-muted-foreground/60 mb-6 flex items-center gap-2">
                        <FileText className="h-3 w-3" /> Verification Documents
                     </h4>
                     <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between bg-muted/20 px-5 py-4 rounded-2xl border border-border/40 hover:bg-muted/40 transition-colors cursor-pointer group">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm border border-border/40">
                                 <Briefcase className="w-5 h-5" />
                              </div>
                              <span className="text-sm font-black">Agency License</span>
                           </div>
                           <Badge variant="outline" className="text-[10px] font-black border-2">PDF</Badge>
                        </div>
                        <div className="flex items-center justify-between bg-muted/20 px-5 py-4 rounded-2xl border border-border/40 hover:bg-muted/40 transition-colors cursor-pointer group">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm border border-border/40">
                                 <FileText className="w-5 h-5" />
                              </div>
                              <span className="text-sm font-black">National ID / Passport</span>
                           </div>
                           <Badge variant="outline" className="text-[10px] font-black border-2">JPG</Badge>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex gap-4 mt-10">
                    <Button 
                      disabled={isVerifying}
                      onClick={() => verify(agent.id)}
                      className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg transition-all hover:scale-[1.05] active:scale-95 shadow-xl shadow-primary/20"
                    >
                      <BadgeCheck className="w-5 h-5 mr-2" /> Verify Agent
                    </Button>
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl text-red-500 hover:text-red-500 hover:bg-red-50 border-2 border-red-100 font-black">
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-muted/5 rounded-[40px] border border-dashed border-border/60">
           <BadgeCheck className="h-16 w-16 text-primary mb-6 opacity-20" />
           <h3 className="text-2xl font-black mb-2">No verification requests</h3>
           <p className="text-muted-foreground font-medium text-center max-w-sm">All agent applications have been processed. New requests will appear here.</p>
        </div>
      )}
    </div>
  )
}
