"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ComplianceForm, ComplianceRecord } from "@/components/ComplianceForm";
import { ComplianceRecordCard } from "@/components/ComplianceRecordCard";
import { WalletGuard } from "@/components/WalletGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, List } from "lucide-react";

const STORAGE_KEY = "compliance_records";

export default function Home() {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load records from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecords(parsed);
      }
    } catch (error) {
      console.error("Failed to load records from storage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save records to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      } catch (error) {
        console.error("Failed to save records to storage:", error);
      }
    }
  }, [records, isLoading]);

  const handleSubmitRecord = (record: ComplianceRecord) => {
    setRecords([record, ...records]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <WalletGuard>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Create Record
              </TabsTrigger>
              <TabsTrigger value="view" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                View Records ({records.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="max-w-3xl mx-auto">
              <ComplianceForm onSubmit={handleSubmitRecord} />
            </TabsContent>

            <TabsContent value="view" className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading records...</p>
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed border-border">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No Records Yet
                    </h3>
                    <p className="text-muted-foreground">
                      Create your first compliance record to get started
                    </p>
                  </div>
                ) : (
                  records.map((record) => (
                    <ComplianceRecordCard key={record.id} record={record} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </WalletGuard>
      </main>
    </div>
  );
}
