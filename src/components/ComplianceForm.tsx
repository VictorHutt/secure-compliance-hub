import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, FileText, AlertTriangle } from "lucide-react";

interface ComplianceFormProps {
  onSubmit: (record: ComplianceRecord) => void;
}

export interface ComplianceRecord {
  id: string;
  inspectionId: string;
  date: string;
  inspector: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  violationNotes: string;
  documentation: string;
  status: "pending" | "approved" | "flagged";
  walletAddress: string;
}

export const ComplianceForm = ({ onSubmit }: ComplianceFormProps) => {
  const { address, isConnected } = useAccount();
  const [formData, setFormData] = useState<{
    inspectionId: string;
    inspector: string;
    riskLevel: "low" | "medium" | "high" | "critical";
    violationNotes: string;
    documentation: string;
  }>({
    inspectionId: "",
    inspector: "",
    riskLevel: "low",
    violationNotes: "",
    documentation: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!formData.inspectionId || !formData.inspector) {
      toast.error("Please fill in all required fields");
      return;
    }

    const record: ComplianceRecord = {
      id: `CMP-${Date.now()}`,
      date: new Date().toISOString(),
      status: formData.riskLevel === "critical" || formData.riskLevel === "high" ? "flagged" : "pending",
      walletAddress: address || "",
      ...formData,
    };

    onSubmit(record);
    
    // Reset form
    setFormData({
      inspectionId: "",
      inspector: "",
      riskLevel: "low",
      violationNotes: "",
      documentation: "",
    });

    toast.success("Compliance record created and encrypted");
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <CardTitle>New Compliance Record</CardTitle>
        </div>
        <CardDescription>
          All sensitive information will be encrypted and stored securely
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inspectionId">Inspection ID *</Label>
              <Input
                id="inspectionId"
                placeholder="INS-2024-001"
                value={formData.inspectionId}
                onChange={(e) => setFormData({ ...formData, inspectionId: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inspector">Inspector Name *</Label>
              <Input
                id="inspector"
                placeholder="John Doe"
                value={formData.inspector}
                onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="riskLevel" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risk Classification
            </Label>
            <Select
              value={formData.riskLevel}
              onValueChange={(value: any) => setFormData({ ...formData, riskLevel: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    Low Risk
                  </span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-warning" />
                    Medium Risk
                  </span>
                </SelectItem>
                <SelectItem value="high">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    High Risk
                  </span>
                </SelectItem>
                <SelectItem value="critical">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-encrypted" />
                    Critical
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="violationNotes" className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-encrypted" />
              Violation Notes (Encrypted)
            </Label>
            <Textarea
              id="violationNotes"
              placeholder="Enter any compliance violations or concerns..."
              value={formData.violationNotes}
              onChange={(e) => setFormData({ ...formData, violationNotes: e.target.value })}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentation" className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-encrypted" />
              Documentation References (Encrypted)
            </Label>
            <Textarea
              id="documentation"
              placeholder="Enter references to supporting documentation..."
              value={formData.documentation}
              onChange={(e) => setFormData({ ...formData, documentation: e.target.value })}
              rows={3}
              className="resize-none"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            disabled={!isConnected}
          >
            {isConnected ? (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Create Encrypted Record
              </>
            ) : (
              "Connect Wallet to Continue"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
