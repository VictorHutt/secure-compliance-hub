"use client";

import { useState } from "react";
import { Lock, Unlock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { useSecureCompliance } from "@/hooks/useSecureCompliance";

interface EncryptedFieldProps {
  label: string;
  encryptedValue: number;
  recordId?: number;
  fieldType: "riskLevel" | "status" | "violationCode";
}

export const EncryptedField = ({ 
  label, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  encryptedValue,
  recordId,
  fieldType
}: EncryptedFieldProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [decryptedValue, setDecryptedValue] = useState<number | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const { isConnected } = useAccount();
  const { decryptField } = useSecureCompliance();

  const handleDecrypt = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to decrypt");
      return;
    }

    if (recordId === undefined) {
      toast.error("Record not found on chain");
      return;
    }

    setIsDecrypting(true);
    try {
      const value = await decryptField(recordId, fieldType);
      setDecryptedValue(value);
      setIsRevealed(true);
      toast.success("Field decrypted successfully");
    } catch (error) {
      console.error("Decryption failed:", error);
      toast.error("Failed to decrypt field");
    } finally {
      setIsDecrypting(false);
    }
  };

  const formatValue = (value: number | null) => {
    if (value === null) return "Unknown";
    if (fieldType === "riskLevel") {
      const levels = ["Low", "Medium", "High", "Critical"];
      return levels[value] || `Level ${value}`;
    }
    if (fieldType === "status") {
      const statuses = ["Pending", "Approved", "Flagged"];
      return statuses[value] || `Status ${value}`;
    }
    return String(value);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          {label}
          <Lock className="w-3 h-3 text-encrypted" />
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => isRevealed ? setIsRevealed(false) : handleDecrypt()}
          disabled={isDecrypting}
          className="h-7 text-xs"
        >
          {isDecrypting ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Decrypting...
            </>
          ) : isRevealed ? (
            <>
              <Lock className="w-3 h-3 mr-1" />
              Hide
            </>
          ) : (
            <>
              <Unlock className="w-3 h-3 mr-1" />
              Decrypt
            </>
          )}
        </Button>
      </div>
      
      <div className={`
        relative p-3 rounded-lg border transition-all
        ${!isRevealed 
          ? 'bg-encrypted/5 border-encrypted/30 backdrop-blur-sm' 
          : 'bg-card border-border'
        }
      `}>
        {!isRevealed ? (
          <div className="flex items-center gap-2 text-encrypted/70">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-mono">
              ████████████████████████
            </span>
          </div>
        ) : (
          <p className="text-sm text-foreground break-words">
            {formatValue(decryptedValue)}
          </p>
        )}
      </div>
    </div>
  );
};
