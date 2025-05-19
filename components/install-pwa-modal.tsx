// components/install-pwa-modal.tsx
"use client";

import { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowDown, Smartphone, Check } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function InstallPWAModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar se o app já está instalado (em standalone mode)
    const isInStandaloneMode = () => 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    setIsStandalone(isInStandaloneMode());

    // Detectar iOS
    const isIOSDevice = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    setIsIOS(isIOSDevice());

    // Capturar evento beforeinstallprompt para Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsOpen(false);
    });

    // Se não estiver em standalone mode e for mobile, mostrar modal
    const checkAndShowInstallPrompt = () => {
      if (!isInStandaloneMode() && (isIOSDevice() || deferredPrompt)) {
        setIsOpen(true);
      }
    };

    // Verificar após um pequeno delay para dar tempo aos eventos se registrarem
    const timer = setTimeout(checkAndShowInstallPrompt, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!isIOS && deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setIsOpen(false);
      }
      setDeferredPrompt(null);
    }
  };

  // Não mostrar o modal se já estiver instalado
  if (isStandalone || isInstalled) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Impedir que o modal seja fechado até que o app seja instalado
      if (!open && !isStandalone && !isInstalled) {
        return;
      }
      setIsOpen(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            Instale o Orbita no seu dispositivo
          </DialogTitle>
          <DialogDescription className="text-center">
            Para melhor experiência, instale o Orbita como um aplicativo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          {isIOS ? (
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <p className="font-medium mb-2">1. Toque no botão de compartilhamento</p>
                <div className="bg-slate-800 p-4 rounded-lg mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 6 12 2 8 6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                  </svg>
                </div>
                <motion.div 
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <ArrowDown className="text-cyan-400" />
                </motion.div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center"
              >
                <p className="font-medium mb-2">2. Selecione "Adicionar à Tela de Início"</p>
                <div className="bg-slate-800 p-3 rounded-lg flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                    <path d="M3 11l18-5v12L3 14v-3z"></path>
                    <path d="M11.6 16.8a1 1 0 1 1-1.2 1.6"></path>
                  </svg>
                  <span>Adicionar à Tela de Início</span>
                </div>
                <motion.div 
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                >
                  <ArrowDown className="text-cyan-400 mt-2" />
                </motion.div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col items-center"
              >
                <div className="flex items-center gap-2">
                  <Check className="text-green-500" />
                  <p className="font-medium">3. Pronto! Aproveite o Orbita como app</p>
                </div>
                <Smartphone className="mt-2 text-cyan-400 h-8 w-8" />
              </motion.div>
            </div>
          ) : (
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <p className="font-medium mb-2">1. Toque no menu de três pontos</p>
                <div className="bg-slate-800 p-2 rounded-lg mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="12" cy="5" r="1"></circle>
                    <circle cx="12" cy="19" r="1"></circle>
                  </svg>
                </div>
                <motion.div 
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <ArrowDown className="text-cyan-400" />
                </motion.div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center"
              >
                <p className="font-medium mb-2">2. Clique em "Instalar aplicativo"</p>
                <Button variant="default" className="mb-2" onClick={handleInstallClick}>
                  Instalar aplicativo
                </Button>
                <motion.div 
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                >
                  <ArrowDown className="text-cyan-400" />
                </motion.div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col items-center"
              >
                <div className="flex items-center gap-2">
                  <Check className="text-green-500" />
                  <p className="font-medium">3. Confirme a instalação quando solicitado</p>
                </div>
                <Smartphone className="mt-2 text-cyan-400 h-8 w-8" />
              </motion.div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <div className="w-full text-center">
            <p className="text-sm text-slate-400">
              {isIOS 
                ? "Por favor, siga as instruções acima para instalar o Orbita"
                : "Clique no botão acima para instalar o Orbita"}
            </p>
            {!isIOS && deferredPrompt && (
              <Button 
                className="mt-2 w-full" 
                onClick={handleInstallClick}
              >
                Instalar agora
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}