"use client";

import { useState } from "react";
import { Lock, Unlock, Loader2, ShieldCheck } from "lucide-react";
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
    <div className="space-y-2 p-4 rounded-xl bg-encrypted/5 border border-encrypted/20">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-encrypted/10 flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-encrypted" />
          </div>
          {label}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-encrypted/10 text-encrypted font-medium">
            FHE Encrypted
          </span>
        </label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => isRevealed ? setIsRevealed(false) : handleDecrypt()}
          disabled={isDecrypting}
          className="h-8 text-xs rounded-lg border-encrypted/30 hover:bg-encrypted/10 hover:border-encrypted/50 text-encrypted"
        >
          {isDecrypting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Decrypting...
            </>
          ) : isRevealed ? (
            <>
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              Hide
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5 mr-1.5" />
              Decrypt
            </>
          )}
        </Button>
      </div>
      
      <div className={`
        relative p-4 rounded-xl border-2 transition-all duration-300
        ${!isRevealed 
          ? 'bg-gradient-to-r from-encrypted/5 to-encrypted/10 border-encrypted/20 border-dashed' 
          : 'bg-card border-primary/30 shadow-soft'
        }
      `}>
        {!isRevealed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-encrypted/10 flex items-center justify-center animate-pulse-soft">
              <Lock className="w-4 h-4 text-encrypted" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-mono text-encrypted/50 tracking-wider">
                ●●●●●●●●●●●●●●●●●●●●
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Click decrypt to reveal value
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {formatValue(decryptedValue)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Decrypted value
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
