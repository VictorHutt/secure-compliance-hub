"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, FileText, AlertTriangle, Loader2 } from "lucide-react";
import { useSecureCompliance } from "@/hooks/useSecureCompliance";

export interface ComplianceRecord {
  id: string;
  inspectionId: string;
  date: string;
  inspector: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  violationCode: number;
  status: "pending" | "approved" | "flagged";
  walletAddress: string;
  onChainId?: number;
}

interface ComplianceFormProps {
  onSubmit: (record: ComplianceRecord) => void;
}

export const ComplianceForm = ({ onSubmit }: ComplianceFormProps) => {
  const { address, isConnected } = useAccount();
  const { createRecord, isCreating, isDeployed, error: hookError } = useSecureCompliance();
  const [formData, setFormData] = useState<{
    inspectionId: string;
    inspector: string;
    riskLevel: "low" | "medium" | "high" | "critical";
    violationCode: string;
  }>({
    inspectionId: "",
    inspector: "",
    riskLevel: "low",
    violationCode: "",
  });
  const [validationErrors, setValidationErrors] = useState<{
    inspectionId?: string;
    inspector?: string;
    violationCode?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};
    
    if (!formData.inspectionId.trim()) {
      errors.inspectionId = "Inspection ID is required";
    } else if (formData.inspectionId.length < 3) {
      errors.inspectionId = "Inspection ID must be at least 3 characters";
    }
    
    if (!formData.inspector.trim()) {
      errors.inspector = "Inspector name is required";
    } else if (formData.inspector.length < 2) {
      errors.inspector = "Inspector name must be at least 2 characters";
    }
    
    if (formData.violationCode && parseInt(formData.violationCode) < 0) {
      errors.violationCode = "Violation code must be a positive number";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    if (!isDeployed) {
      toast.error("Contract not deployed on this network");
      return;
    }

    try {
      // Convert risk level to number (0-3)
      const riskLevelMap: Record<string, number> = {
        low: 0,
        medium: 1,
        high: 2,
        critical: 3,
      };
      const riskLevelNum = riskLevelMap[formData.riskLevel];
      const violationCodeNum = parseInt(formData.violationCode) || 0;

      // Create record on-chain with encryption
      const onChainId = await createRecord(riskLevelNum, violationCodeNum);

      const record: ComplianceRecord = {
        id: `CMP-${Date.now()}`,
        date: new Date().toISOString(),
        status: formData.riskLevel === "critical" || formData.riskLevel === "high" ? "flagged" : "pending",
        walletAddress: address || "",
        inspectionId: formData.inspectionId,
        inspector: formData.inspector,
        riskLevel: formData.riskLevel,
        violationCode: violationCodeNum,
        onChainId,
      };

      onSubmit(record);
      
      // Reset form
      setFormData({
        inspectionId: "",
        inspector: "",
        riskLevel: "low",
        violationCode: "",
      });

      toast.success("Compliance record created and encrypted on-chain");
    } catch (error) {
      console.error("Failed to create record:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create encrypted record";
      toast.error(errorMessage);
    }
  };

  // Clear validation error when field changes
  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors({ ...validationErrors, [field]: undefined });
    }
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <CardTitle>New Compliance Record</CardTitle>
        </div>
        <CardDescription>
          All sensitive information will be encrypted and stored securely on-chain
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
                onChange={(e) => handleFieldChange("inspectionId", e.target.value)}
                required
                className={validationErrors.inspectionId ? "border-destructive" : ""}
              />
              {validationErrors.inspectionId && (
                <p className="text-xs text-destructive">{validationErrors.inspectionId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inspector">Inspector Name *</Label>
              <Input
                id="inspector"
                placeholder="John Doe"
                value={formData.inspector}
                onChange={(e) => handleFieldChange("inspector", e.target.value)}
                required
                className={validationErrors.inspector ? "border-destructive" : ""}
              />
              {validationErrors.inspector && (
                <p className="text-xs text-destructive">{validationErrors.inspector}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="riskLevel" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risk Classification
            </Label>
            <Select
              value={formData.riskLevel}
              onValueChange={(value: "low" | "medium" | "high" | "critical") => 
                setFormData({ ...formData, riskLevel: value })
              }
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
            <Label htmlFor="violationCode" className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-encrypted" />
              Violation Code (Encrypted)
            </Label>
            <Input
              id="violationCode"
              type="number"
              placeholder="Enter violation code (e.g., 1001)"
              value={formData.violationCode}
              onChange={(e) => handleFieldChange("violationCode", e.target.value)}
              className={validationErrors.violationCode ? "border-destructive" : ""}
              min="0"
            />
            {validationErrors.violationCode && (
              <p className="text-xs text-destructive">{validationErrors.violationCode}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This value will be encrypted using FHE before storing on-chain
            </p>
          </div>
          
          {hookError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{hookError}</p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            disabled={!isConnected || isCreating || !isDeployed}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Encrypting & Submitting...
              </>
            ) : isConnected ? (
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
