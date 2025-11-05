"use client";

import { useState } from "react";
import { ComplianceRecord } from "./ComplianceForm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EncryptedField } from "./EncryptedField";
import { Calendar, User, Hash, AlertTriangle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

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
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };
  
  const { date: formattedDate, time: formattedTime } = formatTimestamp(record.date);

  return (
    <Card className="border-border/50 hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
      <CardHeader className="pb-3 border-b bg-gradient-to-r from-background to-muted/20">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-sm font-semibold text-foreground">
                {record.id}
              </span>
              {record.onChainId !== undefined && (
                <Badge variant="outline" className="text-xs">
                  Chain ID: {record.onChainId}
                </Badge>
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
              <div className="flex flex-col items-end">
                <span>{formattedDate}</span>
                <span className="text-[10px]">{formattedTime}</span>
              </div>
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

          {isExpanded && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Risk Level
                  </p>
                  <Badge variant="outline" className={getRiskColor(record.riskLevel)}>
                    {record.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Status
                  </p>
                  <Badge variant="outline" className={getStatusColor(record.status)}>
                    {record.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <EncryptedField
                label="Violation Code"
                encryptedValue={record.violationCode}
                recordId={record.onChainId}
                fieldType="violationCode"
              />
            </>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                Wallet: <span className="font-mono">{record.walletAddress.slice(0, 6)}...{record.walletAddress.slice(-4)}</span>
              </p>
              {record.walletAddress && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => {
                    navigator.clipboard.writeText(record.walletAddress);
                  }}
                  title="Copy wallet address"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 text-xs"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Show More
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
