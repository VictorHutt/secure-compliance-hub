"use client";

import { Shield, Github, Twitter, ExternalLink } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Description */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-soft">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Secure Compliance Hub</h3>
              <p className="text-xs text-muted-foreground">Powered by Zama FHE</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://docs.zama.ai/fhevm"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Documentation</span>
            </a>
            <a
              href="https://github.com/zama-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <a
              href="https://twitter.com/zaboris"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Twitter className="w-4 h-4" />
              <span>Twitter</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-xs text-muted-foreground text-center md:text-right">
            <p>© 2024 Secure Compliance Hub</p>
            <p className="mt-1">Built with FHE Technology</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
