"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ComplianceForm, ComplianceRecord } from "@/components/ComplianceForm";
import { ComplianceRecordCard } from "@/components/ComplianceRecordCard";
import { WalletGuard } from "@/components/WalletGuard";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, List, Shield } from "lucide-react";

const STORAGE_KEY = "compliance_records";

export default function Home() {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecords(JSON.parse(stored));
    } catch (error) {
      console.error("Failed to load records:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      } catch (error) {
        console.error("Failed to save records:", error);
      }
    }
  }, [records, isLoading]);

  const handleSubmitRecord = (record: ComplianceRecord) => {
    setRecords([record, ...records]);
  };

  return (
    <div className="min-h-screen bg-page">
      <Header />
      <Hero />
      
      <main className="container mx-auto px-4 py-8 -mt-8 relative z-10">
        <WalletGuard>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-card shadow-soft p-1 rounded-xl">
              <TabsTrigger value="create" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                <FileText className="w-4 h-4" />
                Create Record
              </TabsTrigger>
              <TabsTrigger value="view" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
                <List className="w-4 h-4" />
                Records ({records.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="max-w-3xl mx-auto animate-fade-up">
              <ComplianceForm onSubmit={handleSubmitRecord} />
            </TabsContent>

            <TabsContent value="view" className="max-w-4xl mx-auto animate-fade-up">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-16">
                    <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading records...</p>
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center py-16 bg-card rounded-2xl border-2 border-dashed border-border shadow-soft">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Records Yet</h3>
                    <p className="text-muted-foreground text-sm">Create your first compliance record to get started</p>
                  </div>
                ) : (
                  records.map((record, index) => (
                    <div key={record.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-up">
                      <ComplianceRecordCard record={record} />
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </WalletGuard>
      </main>
      
      <Footer />
    </div>
  );
}
