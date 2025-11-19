import { useState } from "react";
import { Lock, Unlock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { toast } from "sonner";

interface EncryptedFieldProps {
  label: string;
  value: string;
  isEncrypted?: boolean;
  onDecrypt?: () => void;
}

export const EncryptedField = ({ 
  label, 
  value, 
  isEncrypted = true,
  onDecrypt 
}: EncryptedFieldProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const { isConnected } = useAccount();

  const handleDecrypt = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to decrypt");
      return;
    }
    if (onDecrypt) {
      onDecrypt();
    }
    setIsRevealed(true);
    toast.success("Field decrypted successfully");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          {label}
          {isEncrypted && (
            <Lock className="w-3 h-3 text-encrypted" />
          )}
        </label>
        {isEncrypted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => isRevealed ? setIsRevealed(false) : handleDecrypt()}
            className="h-7 text-xs"
          >
            {isRevealed ? (
              <>
                <EyeOff className="w-3 h-3 mr-1" />
                Hide
              </>
            ) : (
              <>
                <Unlock className="w-3 h-3 mr-1" />
                Decrypt
              </>
            )}
          </Button>
        )}
      </div>
      
      <div className={`
        relative p-3 rounded-lg border transition-all
        ${isEncrypted && !isRevealed 
          ? 'bg-encrypted/5 border-encrypted/30 backdrop-blur-sm' 
          : 'bg-card border-border'
        }
      `}>
        {isEncrypted && !isRevealed ? (
          <div className="flex items-center gap-2 text-encrypted/70">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-mono">
              ████████████████████████
            </span>
          </div>
        ) : (
          <p className="text-sm text-foreground break-words">{value}</p>
        )}
      </div>
    </div>
  );
};
