import React, { useState, useEffect, useMemo } from 'react';
import { useSorareSocket } from './hooks/useSorareSocket';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { formatTimeAgo, cn } from './lib/utils';
import { Activity, BellRing, Filter, Search, ShieldAlert, Sparkles, Wifi, WifiOff, Lock, Key, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TokenOffer } from './types';

export default function App() {
  const { isConnected, isAuthenticated, marketEvents, authenticate, subscribe, unsubscribe, clearEvents } = useSorareSocket();
  const [isScanning, setIsScanning] = useState(false);
  
  // Auth Settings
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Scanner Settings
  const [targetPlayer, setTargetPlayer] = useState('');
  const [maxPriceEth, setMaxPriceEth] = useState('');

  // Alerts logic
  const checkAlert = (offer: TokenOffer) => {
    if (!targetPlayer || !maxPriceEth) return false;
    
    const playerName = offer.token.player.displayName.toLowerCase();
    const isPlayerMatch = playerName.includes(targetPlayer.toLowerCase());
    const isPriceMatch = parseFloat(offer.price) <= parseFloat(maxPriceEth);
    
    return isPlayerMatch && isPriceMatch;
  };

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleAuthenticate = async () => {
    if (email && password) {
      setIsAuthenticating(true);
      setAuthError('');
      const success = await authenticate({ email, password });
      setIsAuthenticating(false);
      if (!success) {
        setAuthError('Authentication failed. Please check your credentials.');
      }
    }
  };

  const handleStartScan = () => {
    if (isScanning) {
      unsubscribe();
      setIsScanning(false);
    } else {
      clearEvents();
      subscribe({ player: targetPlayer, maxPrice: maxPriceEth });
      setIsScanning(true);
    }
  };

  const getRarityVariant = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'limited': return 'limited';
      case 'rare': return 'rare';
      case 'super rare': return 'superrare';
      case 'unique': return 'unique';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-[var(--color-background-header)] border-b border-[var(--color-border-card)] sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--color-text-primary)] text-white p-2 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-[var(--color-text-primary)] tracking-tight">Sorare Market Scanner</h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-muted)]">Version 1.0.5</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="success" className="gap-1.5 px-3 py-1">
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Connected</span>
              </Badge>
            ) : (
              <Badge variant="danger" className="gap-1.5 px-3 py-1">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Offline</span>
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 mt-8 space-y-6">
        
        {/* JWT Authentication */}
        <Card className="border-[var(--color-border-default)] shadow-sm">
          <CardHeader className="bg-gray-50/50">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[var(--color-text-secondary)]" />
                Sorare API Login
              </div>
              {isAuthenticated && (
                <Badge variant="success" className="gap-1 px-2.5 py-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Authenticated
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4 space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <Key className="w-4 h-4" /> Email
                </label>
                <Input 
                  type="email" 
                  placeholder="your.email@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isAuthenticated || !isConnected}
                />
              </div>
              <div className="md:col-span-5 space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <Lock className="w-4 h-4" /> Password
                </label>
                <Input 
                  type="password" 
                  placeholder="Your Sorare password..." 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isAuthenticated || !isConnected}
                />
              </div>
              <div className="md:col-span-3">
                <Button 
                  className="w-full h-10 shadow-sm"
                  variant={isAuthenticated ? "secondary" : "primary"}
                  onClick={handleAuthenticate}
                  disabled={isAuthenticated || !isConnected || !email || !password || isAuthenticating}
                >
                  {isAuthenticated ? "Session Active" : isAuthenticating ? "Logging in..." : "Login"}
                </Button>
              </div>
            </div>
            {authError && <p className="text-sm font-medium text-red-500 mt-2">{authError}</p>}
            <p className="text-xs text-[var(--color-text-muted)] mt-3">
              Uses Sorare's salt + bcrypt authentication flow to securely obtain a JWT token for real-time GraphQL Subscriptions.
            </p>
          </CardContent>
        </Card>

        {/* Filter / Scanner Configuration */}
        <Card className={cn(
          "border-[var(--color-border-default)] shadow-sm transition-opacity duration-300",
          !isAuthenticated ? "opacity-50 pointer-events-none" : "opacity-100"
        )}>
          <CardHeader className="bg-gray-50/50">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="w-4 h-4 text-[var(--color-text-secondary)]" />
              Alert Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5 space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <Search className="w-4 h-4" /> Target Player
                </label>
                <Input 
                  type="text" 
                  placeholder="e.g. Mitoma, Mbappe..." 
                  value={targetPlayer}
                  onChange={(e) => setTargetPlayer(e.target.value)}
                  disabled={isScanning || !isAuthenticated}
                />
              </div>
              <div className="md:col-span-4 space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Max Price (ETH)
                </label>
                <Input 
                  type="number" 
                  step="0.001" 
                  placeholder="e.g. 0.05" 
                  value={maxPriceEth}
                  onChange={(e) => setMaxPriceEth(e.target.value)}
                  disabled={isScanning || !isAuthenticated}
                />
              </div>
              <div className="md:col-span-3">
                <Button 
                  className="w-full h-10 shadow-sm"
                  variant={isScanning ? "secondary" : "primary"}
                  onClick={handleStartScan}
                  disabled={!isAuthenticated || !isConnected}
                >
                  {isScanning ? "Stop Scanning" : "Start Scanning"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Feed Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Live Listings Feed</h2>
            {isScanning && (
              <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-accent-primary)] bg-pink-50 px-3 py-1 rounded-full">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-primary)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-accent-primary)]"></span>
                </span>
                Listening...
              </span>
            )}
          </div>

          <div className="min-h-[400px]">
            {!isAuthenticated ? (
              <div className="h-64 flex flex-col items-center justify-center text-[var(--color-text-muted)] border-2 border-dashed border-[var(--color-border-card)] rounded-[var(--radius-xl)] bg-gray-50/30">
                <Lock className="w-8 h-8 mb-3 opacity-20" />
                <p>Please authenticate to access real-time market data.</p>
              </div>
            ) : marketEvents.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-[var(--color-text-muted)] border-2 border-dashed border-[var(--color-border-card)] rounded-[var(--radius-xl)] bg-gray-50/30">
                <Activity className="w-8 h-8 mb-3 opacity-20" />
                <p>{isScanning ? "Waiting for new market offers..." : "Start scanning to view real-time market data."}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <AnimatePresence initial={false}>
                  {marketEvents.map((event) => {
                    const isAlert = checkAlert(event);
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: -20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className={cn(
                            "overflow-hidden transition-all", 
                            isAlert ? "border-[var(--color-accent-primary)] shadow-md ring-1 ring-[var(--color-accent-primary)]/20 shadow-[var(--color-accent-primary)]/10" : "hover:border-[var(--color-border-default)]"
                          )}>
                          <div className={cn(
                            "p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
                            isAlert && "bg-pink-50/30"
                          )}>
                            
                            <div className="flex items-start gap-4">
                              <div className="pt-1">
                                {isAlert ? (
                                  <div className="bg-[var(--color-accent-primary)] p-2 rounded-full text-white shadow-sm">
                                    <BellRing className="w-5 h-5" />
                                  </div>
                                ) : (
                                  <div className="bg-gray-100 p-2 rounded-full text-gray-400">
                                    <Activity className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <h3 className="font-semibold text-[var(--color-text-primary)] text-lg leading-tight flex items-center gap-2">
                                  {event.token.player.displayName}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm">
                                  <Badge variant={getRarityVariant(event.token.rarity) as any}>
                                    {event.token.rarity}
                                  </Badge>
                                  <span className="text-[var(--color-text-secondary)] font-mono text-xs">
                                    {formatTimeAgo(event.timestamp)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-[var(--color-border-card)] sm:border-0">
                              <div className={cn(
                                "font-mono font-bold text-xl tracking-tight",
                                isAlert ? "text-[var(--color-accent-primary)]" : "text-[var(--color-text-primary)]"
                              )}>
                                {event.price} <span className="text-sm font-sans font-medium text-[var(--color-text-secondary)]">ETH</span>
                              </div>
                              {isAlert && (
                                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent-primary)] mt-1 flex items-center gap-1">
                                  <ShieldAlert className="w-3.5 h-3.5" /> Target Hit
                                </div>
                              )}
                            </div>
                            
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

