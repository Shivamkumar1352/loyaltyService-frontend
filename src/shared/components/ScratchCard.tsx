import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Shield } from 'lucide-react';

const ScratchCard = ({ 
  isOpen, 
  onClose, 
  reward, 
  onScratchComplete,
  isRedeeming,
  userTier 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [autoRedeemTriggered, setAutoRedeemTriggered] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  const [redemptionData, setRedemptionData] = useState(null);

  // Check if user meets tier requirement
  const meetsTierRequirement = () => {
    if (!reward?.tierRequired) return true;
    
    const tierLevels = { SILVER: 1, GOLD: 2, PLATINUM: 3 };
    const userTierLevel = tierLevels[userTier] || 1;
    const requiredTierLevel = tierLevels[reward.tierRequired] || 1;
    
    return userTierLevel >= requiredTierLevel;
  };

  // Initialize canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;
    
    // Set canvas size - larger square
    const size = Math.min(window.innerWidth - 48, 340);
    canvas.width = size;
    canvas.height = size;
    
    // Draw scratch layer
    drawScratchLayer();
    
    // Reset states when modal opens
    setIsRevealed(false);
    setScratchProgress(0);
    setAutoRedeemTriggered(false);
    setRedemptionSuccess(false);
    setLastPosition(null);
    setRedemptionData(null);
    
  }, [isOpen, reward, userTier]);

  const drawScratchLayer = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx) return;
    
    // Green themed scratch layer
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#10b981');
    gradient.addColorStop(0.5, '#059669');
    gradient.addColorStop(1, '#047857');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add texture pattern
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#34d399';
    for (let i = 0; i < 200; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 2 + 0.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    // Add "Hover to Scratch" text
    ctx.font = `bold ${canvas.width * 0.07}px "Inter", system-ui`;
    ctx.fillStyle = '#ffffffcc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ SCRATCH ✨', canvas.width / 2, canvas.height / 2 - 15);
    ctx.font = `${canvas.width * 0.045}px "Inter", system-ui`;
    ctx.fillStyle = '#ffffffaa';
    ctx.fillText('to reveal reward', canvas.width / 2, canvas.height / 2 + 25);
    
    // Add sparkle effects
    ctx.fillStyle = '#fbbf24';
    for (let i = 0; i < 80; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  };

  const scratch = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx || isRevealed || !meetsTierRequirement()) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = (x - rect.left) * scaleX;
    const canvasY = (y - rect.top) * scaleY;
    
    if (canvasX < 0 || canvasX > canvas.width || canvasY < 0 || canvasY > canvas.height) return;
    
    // Double brush size
    ctx.globalCompositeOperation = 'destination-out';
    const radius = canvas.width * 0.16;
    
    const gradient = ctx.createRadialGradient(canvasX, canvasY, radius * 0.2, canvasX, canvasY, radius);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(0.5, 'rgba(0,0,0,0.9)');
    gradient.addColorStop(0.8, 'rgba(0,0,0,0.5)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Connect with last position for smoother scratching
    if (lastPosition) {
      const distance = Math.hypot(canvasX - lastPosition.x, canvasY - lastPosition.y);
      if (distance < radius * 2) {
        const steps = Math.ceil(distance / (radius * 0.5));
        for (let i = 1; i < steps; i++) {
          const t = i / steps;
          const interpX = lastPosition.x + (canvasX - lastPosition.x) * t;
          const interpY = lastPosition.y + (canvasY - lastPosition.y) * t;
          
          ctx.beginPath();
          ctx.arc(interpX, interpY, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    
    setLastPosition({ x: canvasX, y: canvasY });
    
    // Calculate scratch progress (silently, no display)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let scratchedPixels = 0;
    let totalPixels = 0;
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      totalPixels++;
      if (imageData.data[i + 3] === 0) {
        scratchedPixels++;
      }
    }
    
    const progress = (scratchedPixels / totalPixels) * 100;
    setScratchProgress(progress);
    
    // Auto-reveal when 30% scratched (no percentage display)
    if (progress >= 30 && !isRevealed) {
      revealAndRedeem();
    }
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    if (!isHovering || isRevealed || !meetsTierRequirement()) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    // Check if mouse is within canvas bounds
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      scratch(x, y);
    }
  };

  const handleMouseEnter = () => {
    if (!isRevealed && meetsTierRequirement()) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setLastPosition(null);
  };

  const revealAndRedeem = () => {
    if (isRevealed) return;
    setIsRevealed(true);
    
    // Animate canvas clearing
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx) return;
    
    let progress = 0;
    const animateScratch = () => {
      progress += 0.05;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0,0,0,${Math.min(1, progress)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      if (progress < 1) {
        requestAnimationFrame(animateScratch);
      } else {
        // Show loading state while redeeming
        ctx.globalCompositeOperation = 'source-over';
        drawLoadingState();
        
        // Auto-redeem immediately
        if (!autoRedeemTriggered) {
          setAutoRedeemTriggered(true);
          handleAutoRedeem();
        }
      }
    };
    
    animateScratch();
  };

  const drawLoadingState = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx) return;
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#10b981');
    gradient.addColorStop(1, '#059669');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Loading spinner
    ctx.font = `${canvas.width * 0.08}px "Inter", system-ui`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⏳', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = `${canvas.width * 0.045}px "Inter", system-ui`;
    ctx.fillStyle = '#ffffffcc';
    ctx.fillText('Redeeming...', canvas.width / 2, canvas.height / 2 + 30);
  };

  const drawRewardDetails = (cashbackAmount) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx || !reward) return;
    
    // Green gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#10b981');
    gradient.addColorStop(1, '#059669');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add confetti effect
    ctx.fillStyle = '#fbbf24';
    for (let i = 0; i < 150; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    // Prize icon
    ctx.font = `${canvas.width * 0.12}px "Inter", system-ui`;
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎉', canvas.width / 2, canvas.height / 2 - 50);
    
    // "You got" text
    ctx.font = `${canvas.width * 0.055}px "Inter", system-ui`;
    ctx.fillStyle = '#fff';
    ctx.fillText('You got!', canvas.width / 2, canvas.height / 2 - 5);
    
    // Cashback amount - prominently displayed
    ctx.font = `bold ${canvas.width * 0.1}px "Inter", system-ui`;
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`₹${cashbackAmount}`, canvas.width / 2, canvas.height / 2 + 45);
    
    // Reward name
    ctx.font = `${canvas.width * 0.04}px "Inter", system-ui`;
    ctx.fillStyle = '#ffffffcc';
    ctx.fillText(reward.name, canvas.width / 2, canvas.height / 2 + 90);
  };

  const drawSuccessState = (cashbackAmount) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx || !reward) return;
    
    // Green success gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#10b981');
    gradient.addColorStop(1, '#059669');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Checkmark
    ctx.font = `${canvas.width * 0.12}px "Inter", system-ui`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✓', canvas.width / 2, canvas.height / 2 - 40);
    
    // Success text
    ctx.font = `bold ${canvas.width * 0.055}px "Inter", system-ui`;
    ctx.fillStyle = '#fff';
    ctx.fillText('Redeemed!', canvas.width / 2, canvas.height / 2 + 10);
    
    // Cashback amount
    ctx.font = `${canvas.width * 0.07}px "Inter", system-ui`;
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`₹${cashbackAmount}`, canvas.width / 2, canvas.height / 2 + 60);
    
    // Added to wallet
    ctx.font = `${canvas.width * 0.035}px "Inter", system-ui`;
    ctx.fillStyle = '#ffffffcc';
    ctx.fillText('Added to your wallet', canvas.width / 2, canvas.height - 25);
  };

  const handleAutoRedeem = async () => {
    try {
      const response = await onScratchComplete(reward);
      
      // Extract cashback amount from response
      const cashbackAmount = response?.data?.cashbackAmount || response?.cashbackAmount;
      
      if (cashbackAmount) {
        setRedemptionData({ cashbackAmount });
        setRedemptionSuccess(true);
        
        // Update canvas to show reward details
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (ctx) {
          drawRewardDetails(cashbackAmount);
          
          // After 2 seconds, show success state
          setTimeout(() => {
            if (ctx) {
              drawSuccessState(cashbackAmount);
            }
          }, 2000);
        }
      } else {
        // Fallback if no cashback amount
        setRedemptionSuccess(true);
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (ctx) {
          drawRewardDetails(reward?.pointsRequired || 0);
          setTimeout(() => {
            if (ctx) {
              drawSuccessState(reward?.pointsRequired || 0);
            }
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Auto-redeem failed:', err);
      // Show error on canvas
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      if (ctx) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${canvas.width * 0.05}px "Inter", system-ui`;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Redemption failed', canvas.width / 2, canvas.height / 2);
      }
    }
  };

  // Check tier requirement and show appropriate UI
  const canScratch = meetsTierRequirement();
  const tierRequired = reward?.tierRequired;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-sm w-full">
        {/* Curved square card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="relative p-5 text-center border-b border-white/20">
            <button
              onClick={onClose}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
              disabled={isRedeeming}
            >
              ✕
            </button>
            <div className="flex items-center justify-center gap-2">
              <Sparkles size={18} className="text-yellow-300" />
              <h2 className="text-lg font-bold text-white">Scratch & Win</h2>
              <Sparkles size={18} className="text-yellow-300" />
            </div>
            <p className="text-xs text-white/70 mt-1">
              Hover over the card to scratch
            </p>
          </div>

          {/* Card Content */}
          <div className="p-6">
            {/* Tier Requirement Warning */}
            {!canScratch && tierRequired && (
              <div className="mb-4 bg-orange-500/20 border border-orange-500/30 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Shield size={16} className="text-orange-400" />
                  <span className="text-sm font-semibold text-orange-300">Tier Required</span>
                </div>
                <p className="text-xs text-white/80">
                  {tierRequired} tier required to redeem this reward
                </p>
                <p className="text-xs text-white/60 mt-1">
                  Upgrade your tier by earning more points!
                </p>
              </div>
            )}

            {/* Scratch Canvas */}
            <div className="relative flex justify-center">
              <canvas
                ref={canvasRef}
                className={`rounded-xl shadow-lg transition-all ${canScratch && !isRevealed ? 'cursor-crosshair' : 'cursor-not-allowed'} ${canScratch && !isRevealed && 'hover:scale-[1.01]'}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                style={{ 
                  touchAction: 'none', 
                  width: '100%', 
                  height: 'auto',
                  filter: !canScratch ? 'grayscale(0.5)' : 'none'
                }}
              />
              
              {/* Scratch hint - no percentage display */}
              {!isRevealed && scratchProgress === 0 && canScratch && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 animate-pulse">
                    <span className="text-white text-sm flex items-center gap-1">
                      🖱️ Hover to scratch
                    </span>
                  </div> */}
                </div>
              )}

              {/* Tier locked overlay */}
              {!canScratch && tierRequired && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔒</div>
                    <p className="text-white text-xs font-medium">Requires {tierRequired} Tier</p>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions - Hover based */}
            {!isRevealed && scratchProgress === 0 && canScratch && (
              <div className="mt-4 text-center">
                <p className="text-xs text-white/60">
                  💫 Simply hover your mouse over the card to scratch
                </p>
              </div>
            )}

            {/* Success message - final state */}
            {redemptionSuccess && (
              <div className="mt-4 text-center animate-slide-up">
                <button
                  onClick={onClose}
                  className="mt-2 w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 rounded-lg transition-all text-sm"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ScratchCard;
