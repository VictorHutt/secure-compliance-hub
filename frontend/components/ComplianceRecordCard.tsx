"use client";

import { useState } from "react";
import { ComplianceRecord } from "./ComplianceForm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EncryptedField } from "./EncryptedField";
import { Calendar, User, Hash, AlertTriangle, ChevronDown, ChevronUp, ExternalLink, Shield } from "lucide-react";

interface ComplianceRecordCardProps {
  record: ComplianceRecord;
}

const getRiskStyles = (risk: string) => {
  switch (risk) {
    case "low":
      return { badge: "bg-primary/10 text-primary border-primary/20", border: "border-l-primary" };
    case "medium":
      return { badge: "bg-warning/10 text-warning border-warning/20", border: "border-l-warning" };
    case "high":
      return { badge: "bg-destructive/10 text-destructive border-destructive/20", border: "border-l-destructive" };
    case "critical":
      return { badge: "bg-encrypted/10 text-encrypted border-encrypted/20", border: "border-l-encrypted" };
    default:
      return { badge: "bg-muted text-muted-foreground", border: "border-l-muted" };
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-primary/10 text-primary border-primary/20";
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
  const riskStyles = getRiskStyles(record.riskLevel);
  
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };
  
  const { date: formattedDate, time: formattedTime } = formatTimestamp(record.date);

  return (
    <Card className={`border-border/30 shadow-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-hover border-l-4 ${riskStyles.border}`}>
      <CardHeader className="pb-4 bg-gradient-to-r from-card via-card to-muted/10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Hash className="w-4 h-4 text-primary" />
              </div>
              <span className="font-mono text-sm font-semibold text-foreground">
                {record.id}
              </span>
              {record.onChainId !== undefined && (
                <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">
                  <Shield className="w-3 h-3 mr-1" />
                  Chain #{record.onChainId}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={riskStyles.badge}>
                <AlertTriangle className="w-3 h-3 mr-1" />
                {record.riskLevel.toUpperCase()}
              </Badge>
              <Badge variant="outline" className={getStatusColor(record.status)}>
                {record.status.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="text-right space-y-2 bg-card/80 rounded-xl px-3 py-2 border border-border/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <div className="flex flex-col items-end">
                <span className="font-medium">{formattedDate}</span>
                <span className="text-[10px] text-muted-foreground/70">{formattedTime}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium">{record.inspector}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-4">
        <div className="grid gap-4">
          <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              Inspection ID
            </p>
            <p className="text-sm font-mono font-medium text-foreground">
              {record.inspectionId}
            </p>
          </div>

          {isExpanded && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Risk Level
                  </p>
                  <Badge variant="outline" className={riskStyles.badge}>
                    {record.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
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

          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                Wallet: <span className="font-mono font-medium">{record.walletAddress.slice(0, 6)}...{record.walletAddress.slice(-4)}</span>
              </p>
              {record.walletAddress && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-lg hover:bg-primary/10"
                  onClick={() => {
                    navigator.clipboard.writeText(record.walletAddress);
                  }}
                  title="Copy wallet address"
                >
                  <ExternalLink className="w-3 h-3 text-primary" />
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 text-xs rounded-lg hover:bg-primary/10 text-primary"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 mr-1" />
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
