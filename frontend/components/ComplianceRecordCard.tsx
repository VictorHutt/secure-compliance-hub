"use client";

import { ComplianceRecord } from "./ComplianceForm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EncryptedField } from "./EncryptedField";
import { Calendar, User, Hash, AlertTriangle } from "lucide-react";

interface ComplianceRecordCardProps {
  record: ComplianceRecord;
}

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "low":
      return "bg-success/10 text-success border-success/20";
    case "medium":
      return "bg-warning/10 text-warning border-warning/20";
    case "high":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "critical":
      return "bg-encrypted/10 text-encrypted border-encrypted/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-success/10 text-success border-success/20";
    case "pending":
      return "bg-warning/10 text-warning border-warning/20";
    case "flagged":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const ComplianceRecordCard = ({ record }: ComplianceRecordCardProps) => {
  return (
    <Card className="border-border/50 hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
      <CardHeader className="pb-3 border-b bg-gradient-to-r from-background to-muted/20">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-sm font-semibold text-foreground">
                {record.id}
              </span>
              {record.onChainId !== undefined && (
                <span className="text-xs text-muted-foreground">
                  (Chain ID: {record.onChainId})
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={getRiskColor(record.riskLevel)}>
                <AlertTriangle className="w-3 h-3 mr-1" />
                {record.riskLevel.toUpperCase()}
              </Badge>
              <Badge variant="outline" className={getStatusColor(record.status)}>
                {record.status.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {new Date(record.date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              {record.inspector}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        <div className="grid gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Inspection ID
            </p>
            <p className="text-sm font-mono bg-muted/50 px-3 py-2 rounded-md">
              {record.inspectionId}
            </p>
          </div>

          <EncryptedField
            label="Violation Code"
            encryptedValue={record.violationCode}
            recordId={record.onChainId}
            fieldType="violationCode"
          />

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Wallet: <span className="font-mono">{record.walletAddress.slice(0, 6)}...{record.walletAddress.slice(-4)}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
