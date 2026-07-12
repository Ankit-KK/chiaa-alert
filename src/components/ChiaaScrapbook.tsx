import React, { useEffect, useState, useMemo } from 'react';

// Types
interface VariantDonation {
  name?: string;
  amount: number;
  currency?: string;
  message?: string;
  media_url?: string | null;
  media_type?: string | null;
  voice_message_url?: string | null;
  hypersound_url?: string | null;
  is_hyperemote?: boolean;
}

interface AlertProps {
  donation: VariantDonation;
  brandColor: string;
}

// Helper functions
const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  };
  return symbols[currency] || currency;
};

const fmt = (d: VariantDonation) =>
  `${getCurrencySymbol(d.currency || 'INR')}${d.amount.toLocaleString('en-IN')}`;

const kindLabel = (d: VariantDonation): 'TEXT' | 'VOICE' | 'SOUND' | 'MEDIA' => {
  if (d.voice_message_url) return 'VOICE';
  if (d.hypersound_url || d.is_hyperemote) return 'SOUND';
  if (d.media_url) return 'MEDIA';
  return 'TEXT';
};

// Full stylesheet
const CSS = `
/* ============ TOKENS ============ */
.chiaa {
  --c-blush:       #FADADD;
  --c-rose:        #E8B4BC;
  --c-cherry:      #FFB7C5;
  --c-petal:       #FFC4D6;
  --c-cream:       #FFF8F0;
  --c-ivory:       #F5E6D3;
  --c-paper:       #FFFDF7;
  --c-burgundy:    #8B4557;
  --c-deep-rose:   #C45B6F;
  --c-ink:         #5E2A36;
  --c-tape:        rgba(255, 205, 216, 0.55);
  --c-shadow:      rgba(139, 69, 87, 0.12);

  --font-script:   'Caveat', cursive;
  --font-serif:    'Cormorant Garamond', 'Playfair Display', serif;
  --font-hand:     'Kalam', 'Shadows Into Light', cursive;
  --font-label:    'Patrick Hand', cursive;

  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  pointer-events: none;
  font-family: var(--font-hand);
  color: var(--c-ink);
}

.chiaa *, .chiaa *::before, .chiaa *::after { box-sizing: border-box; }

/* ============ PETALS LAYER ============ */
.chiaa-petals {
  position: absolute;
  inset: -80px;
  pointer-events: none;
  z-index: 1;
  overflow: visible;
}

.chiaa-petal {
  position: absolute;
  width: 14px;
  height: 14px;
  background: radial-gradient(ellipse at 30% 30%, #FFE4EC 0%, var(--c-petal) 55%, var(--c-cherry) 100%);
  border-radius: 60% 10% 60% 10%;
  opacity: 0;
  filter: drop-shadow(0 1px 2px rgba(196, 91, 111, 0.25));
  transform-origin: center;
}

.chiaa.entering .chiaa-petal { animation: caPetalFall linear infinite; }

.chiaa-petal:nth-child(1)  { left:  8%; top:-20px; animation-duration: 9s;  animation-delay: 0.0s; width:12px; height:12px; }
.chiaa-petal:nth-child(2)  { left: 22%; top:-20px; animation-duration:11s;  animation-delay: 1.2s; width:16px; height:16px; }
.chiaa-petal:nth-child(3)  { left: 38%; top:-20px; animation-duration: 8s;  animation-delay: 0.5s; }
.chiaa-petal:nth-child(4)  { left: 52%; top:-20px; animation-duration:12s;  animation-delay: 2.0s; width:10px; height:10px; }
.chiaa-petal:nth-child(5)  { left: 66%; top:-20px; animation-duration:10s;  animation-delay: 0.8s; width:18px; height:18px; }
.chiaa-petal:nth-child(6)  { left: 80%; top:-20px; animation-duration: 9s;  animation-delay: 1.6s; }
.chiaa-petal:nth-child(7)  { left: 92%; top:-20px; animation-duration:13s;  animation-delay: 2.4s; width:11px; height:11px; }
.chiaa-petal:nth-child(8)  { left: 15%; top:-20px; animation-duration:10s;  animation-delay: 3.0s; width:15px; height:15px; }
.chiaa-petal:nth-child(9)  { left: 45%; top:-20px; animation-duration:11s;  animation-delay: 3.8s; }
.chiaa-petal:nth-child(10) { left: 72%; top:-20px; animation-duration: 9s;  animation-delay: 4.2s; width:13px; height:13px; }
.chiaa-petal:nth-child(11) { left: 30%; top:-20px; animation-duration:12s;  animation-delay: 5.0s; width:17px; height:17px; }
.chiaa-petal:nth-child(12) { left: 60%; top:-20px; animation-duration:10s;  animation-delay: 5.6s; }

@keyframes caPetalFall {
  0%   { transform: translate(0, 0) rotate(0deg);            opacity: 0; }
  8%   { opacity: 0.9; }
  50%  { transform: translate(40px, 400px) rotate(220deg);   opacity: 0.85; }
  92%  { opacity: 0.6; }
  100% { transform: translate(-20px, 900px) rotate(540deg);  opacity: 0; }
}

/* ============ STAGE (paper stack) ============ */
.chiaa-stage {
  position: relative;
  width: 880px;
  max-width: 96vw;
  padding-bottom: 420px;
}

.chiaa-paper {
  position: absolute;
  left: 50%;
  top: 0;
  width: 860px;
  max-width: 94vw;
  height: 300px;
  border-radius: 10px;
  background: var(--c-paper);
  box-shadow: 0 6px 24px var(--c-shadow);
  transform: translateX(-50%);
  opacity: 0;
}

.chiaa-paper::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(232,180,188,0.06) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(255,183,197,0.05) 0%, transparent 45%);
  pointer-events: none;
}

.chiaa-paper-3 {
  width: 820px; height: 280px;
  transform: translateX(calc(-50% + 6px)) translateY(14px) rotate(1.6deg);
  background: #FDF1F3;
  z-index: 1;
}
.chiaa-paper-2 {
  width: 840px; height: 290px;
  transform: translateX(calc(-50% - 4px)) translateY(7px) rotate(-0.9deg);
  background: #FEF6F2;
  z-index: 2;
}
.chiaa-paper-1 {
  z-index: 3;
}

.chiaa.entering .chiaa-paper-3 { animation: caPaperUnfold3 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.25s forwards; }
.chiaa.entering .chiaa-paper-2 { animation: caPaperUnfold2 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.40s forwards; }
.chiaa.entering .chiaa-paper-1 { animation: caPaperUnfold1 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.55s forwards; }

@keyframes caPaperUnfold3 {
  0%   { opacity: 0; transform: translateX(calc(-50% + 6px)) translateY(40px) rotate(0deg) scale(0.9); }
  100% { opacity: 1; transform: translateX(calc(-50% + 6px)) translateY(14px) rotate(1.6deg) scale(1); }
}
@keyframes caPaperUnfold2 {
  0%   { opacity: 0; transform: translateX(calc(-50% - 4px)) translateY(40px) rotate(0deg) scale(0.9); }
  100% { opacity: 1; transform: translateX(calc(-50% - 4px)) translateY(7px) rotate(-0.9deg) scale(1); }
}
@keyframes caPaperUnfold1 {
  0%   { opacity: 0; transform: translateX(-50%) translateY(40px) scale(0.9); }
  100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
}

.chiaa.idle .chiaa-stage { animation: caBreathe 7s ease-in-out infinite; }
@keyframes caBreathe {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.004); }
}

/* ============ MAIN CARD ============ */
.chiaa-card {
  position: absolute;
  left: 50%;
  top: 0;
  width: 860px;
  max-width: 94vw;
  height: 300px;
  transform: translateX(-50%);
  z-index: 4;

  border-radius: 12px;
  padding: 34px 44px 34px 180px;

  background:
    repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 33px,
      rgba(232, 180, 188, 0.10) 33px,
      rgba(232, 180, 188, 0.10) 34px
    ),
    linear-gradient(135deg, rgba(255, 253, 247, 0.96) 0%, rgba(255, 248, 240, 0.94) 100%);
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);

  box-shadow:
    0 1px 0 rgba(255,255,255,0.7) inset,
    0 -1px 0 rgba(139,69,87,0.05) inset,
    0 20px 50px -12px rgba(139, 69, 87, 0.22);

  opacity: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.chiaa.entering .chiaa-card { animation: caCardOpen 1s cubic-bezier(0.22, 1, 0.36, 1) 0.7s forwards; }
@keyframes caCardOpen {
  0%   { opacity: 0; transform: translateX(-50%) scale(0.92); }
  60%  { opacity: 1; }
  100% { opacity: 1; transform: translateX(-50%) scale(1); }
}

.chiaa-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 40%);
  pointer-events: none;
}

/* ============ POLAROID AVATAR ============ */
.chiaa-polaroid {
  position: absolute;
  left: 28px;
  top: 50%;
  width: 138px;
  background: #FFFDF8;
  padding: 10px 10px 34px;
  border-radius: 3px;
  box-shadow:
    0 2px 4px rgba(139,69,87,0.08),
    0 14px 30px -6px rgba(139, 69, 87, 0.28);
  transform: translateY(-50%) rotate(-5deg);
  opacity: 0;
  z-index: 6;
}

.chiaa-polaroid-inner {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: linear-gradient(135deg, var(--c-blush), var(--c-rose));
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.chiaa-polaroid-inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: saturate(1.05) contrast(1.02);
}

.chiaa-polaroid-caption {
  position: absolute;
  bottom: 6px;
  left: 0;
  right: 0;
  text-align: center;
  font-family: var(--font-script);
  font-size: 20px;
  color: var(--c-burgundy);
  letter-spacing: 0.5px;
}

.chiaa.entering .chiaa-polaroid {
  animation: caPolaroidDrop 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 1.1s forwards;
}
@keyframes caPolaroidDrop {
  0%   { opacity: 0; transform: translateY(-120%) rotate(-14deg); }
  60%  { opacity: 1; transform: translateY(-48%) rotate(-3deg); }
  80%  { transform: translateY(-52%) rotate(-6deg); }
  100% { opacity: 1; transform: translateY(-50%) rotate(-5deg); }
}

.chiaa.idle .chiaa-polaroid { animation: caSway 5s ease-in-out infinite; }
@keyframes caSway {
  0%, 100% { transform: translateY(-50%) rotate(-5deg); }
  50%      { transform: translateY(-50%) rotate(-3.5deg); }
}

/* ============ PUSHPIN ============ */
.chiaa-pin {
  position: absolute;
  left: 82px;
  top: 18px;
  width: 22px;
  height: 22px;
  z-index: 8;
  opacity: 0;
}
.chiaa-pin::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #FF8A9C 0%, #E74C6F 45%, #B33050 100%);
  box-shadow:
    0 2px 4px rgba(0,0,0,0.35),
    inset 0 -2px 3px rgba(0,0,0,0.25),
    inset 0 2px 2px rgba(255,255,255,0.4);
}
.chiaa-pin::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 22px;
  width: 16px;
  height: 4px;
  border-radius: 50%;
  background: rgba(139, 69, 87, 0.25);
  filter: blur(2px);
}

.chiaa.entering .chiaa-pin { animation: caPinDrop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.6s forwards; }
@keyframes caPinDrop {
  0%   { opacity: 0; transform: translateY(-30px) scale(0.6); }
  70%  { opacity: 1; transform: translateY(2px) scale(1.05); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* ============ CONTENT ============ */
.chiaa-content {
  position: relative;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.chiaa-name {
  font-family: var(--font-script);
  font-size: 60px;
  font-weight: 700;
  line-height: 1;
  color: var(--c-burgundy);
  letter-spacing: 0.5px;
  position: relative;
  display: inline-block;
  clip-path: inset(0 100% 0 0);
  text-shadow: 0 1px 0 rgba(255,255,255,0.5);
}
.chiaa-name::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4px;
  height: 3px;
  background: linear-gradient(90deg, var(--c-deep-rose), transparent);
  border-radius: 2px;
  transform: scaleX(0);
  transform-origin: left;
}

.chiaa.entering .chiaa-name { animation: caWriteName 1.1s cubic-bezier(0.22, 1, 0.36, 1) 1.8s forwards; }
.chiaa.entering .chiaa-name::after { animation: caUnderline 0.7s ease-out 2.7s forwards; }

@keyframes caWriteName {
  0%   { clip-path: inset(0 100% 0 0); }
  100% { clip-path: inset(0 0% 0 0); }
}
@keyframes caUnderline {
  to { transform: scaleX(1); }
}

.chiaa-amount-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 4px;
}

.chiaa-amount {
  font-family: var(--font-serif);
  font-size: 46px;
  font-weight: 600;
  color: var(--c-deep-rose);
  letter-spacing: 1px;
  line-height: 1;
  display: inline-flex;
  position: relative;
}

.chiaa-amount .digit {
  display: inline-block;
  opacity: 0;
  transform: translateY(6px);
  filter: blur(3px);
}
.chiaa.entering .chiaa-amount .digit { animation: caDigitIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

.chiaa-amount::before {
  content: '';
  position: absolute;
  inset: -10px -18px;
  background: radial-gradient(ellipse at center, rgba(255,183,197,0.45) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0;
  z-index: -1;
  filter: blur(8px);
}
.chiaa.entering .chiaa-amount::before { animation: caBloom 1s ease-out 3.1s forwards; }

@keyframes caDigitIn {
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}
@keyframes caBloom {
  0%   { opacity: 0; transform: scale(0.6); }
  60%  { opacity: 1; }
  100% { opacity: 0.75; transform: scale(1); }
}

.chiaa-badge {
  font-family: var(--font-label);
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 2px;
  color: var(--c-burgundy);
  padding: 5px 16px;
  position: relative;
  opacity: 0;
  transform: rotate(-2deg) scale(0.8);
  background:
    repeating-linear-gradient(
      45deg,
      rgba(255,255,255,0.35) 0px,
      rgba(255,255,255,0.35) 3px,
      transparent 3px,
      transparent 7px
    ),
    linear-gradient(135deg, rgba(255, 205, 216, 0.75), rgba(255, 183, 197, 0.75));
  border-radius: 1px;
  box-shadow: 0 1px 2px rgba(139,69,87,0.12);
  clip-path: polygon(
    0% 10%, 3% 0%, 8% 12%, 14% 2%, 20% 10%, 28% 0%, 35% 8%, 42% 0%, 50% 10%, 58% 0%,
    65% 8%, 72% 0%, 80% 10%, 88% 2%, 94% 12%, 100% 0%,
    100% 90%, 96% 100%, 90% 88%, 84% 100%, 76% 90%, 68% 100%, 60% 92%, 52% 100%, 44% 90%,
    36% 100%, 28% 92%, 20% 100%, 12% 90%, 6% 100%, 0% 92%
  );
}
.chiaa.entering .chiaa-badge { animation: caBadgeStick 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 2.9s forwards; }
@keyframes caBadgeStick {
  0%   { opacity: 0; transform: rotate(-12deg) scale(0.5) translateY(-10px); }
  70%  { opacity: 1; transform: rotate(-1deg) scale(1.05) translateY(0); }
  100% { opacity: 1; transform: rotate(-2deg) scale(1); }
}

.chiaa-message {
  margin-top: 10px;
  font-family: var(--font-hand);
  font-size: 21px;
  line-height: 34px;
  color: var(--c-ink);
  padding: 6px 14px 6px 14px;
  position: relative;
  opacity: 0;
  max-width: 100%;
  word-wrap: break-word;
}

.chiaa-message::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1.5px;
  background: rgba(196, 91, 111, 0.35);
}

.chiaa.entering .chiaa-message { animation: caMessageIn 0.9s ease-out 3.2s forwards; }
@keyframes caMessageIn {
  0%   { opacity: 0; transform: translateY(8px); filter: blur(2px); }
  100% { opacity: 1; transform: translateY(0); filter: blur(0); }
}

/* ============ DECORATIONS ============ */
.chiaa-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 7;
  overflow: visible;
}

.chiaa-flower {
  position: absolute;
  width: 34px;
  height: 34px;
  opacity: 0;
}
.chiaa-flower::before, .chiaa-flower::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, #FFD1DC 0%, var(--c-cherry) 60%, transparent 72%);
}
.chiaa-flower::after {
  transform: rotate(45deg) scale(0.8);
  background: radial-gradient(circle at 50% 50%, #FFE4EC 0%, var(--c-petal) 55%, transparent 70%);
}
.chiaa-flower-1 { top: -14px; right: 60px; transform: rotate(12deg); }
.chiaa-flower-2 { bottom: -10px; left: 220px; transform: rotate(-20deg) scale(0.75); }
.chiaa-flower-3 { top: 40px; right: -10px; transform: rotate(40deg) scale(0.6); }

.chiaa.entering .chiaa-flower { animation: caFlowerIn 0.8s ease-out forwards; }
.chiaa.entering .chiaa-flower-1 { animation-delay: 3.4s; }
.chiaa.entering .chiaa-flower-2 { animation-delay: 3.6s; }
.chiaa.entering .chiaa-flower-3 { animation-delay: 3.8s; }
@keyframes caFlowerIn {
  0%   { opacity: 0; transform: scale(0.3) rotate(0deg); }
  100% { opacity: 0.9; }
}

.chiaa-sparkle {
  position: absolute;
  width: 8px;
  height: 8px;
  opacity: 0;
  pointer-events: none;
}
.chiaa-sparkle::before, .chiaa-sparkle::after {
  content: '';
  position: absolute;
  background: #FFF6A8;
  box-shadow: 0 0 6px #FFE08A;
  border-radius: 1px;
}
.chiaa-sparkle::before { left: 50%; top: 0; width: 2px; height: 100%; transform: translateX(-50%); }
.chiaa-sparkle::after  { top: 50%; left: 0; height: 2px; width: 100%; transform: translateY(-50%); }

.chiaa-sparkle-1 { top: 20%;  right: 14%; }
.chiaa-sparkle-2 { top: 70%;  right: 22%; width: 6px; height: 6px; }
.chiaa-sparkle-3 { top: 30%;  left: 42%;  width: 10px; height: 10px; }
.chiaa-sparkle-4 { bottom: 18%; left: 52%; width: 6px; height: 6px; }

.chiaa.idle .chiaa-sparkle { animation: caSparkle 3.5s ease-in-out infinite; }
.chiaa.idle .chiaa-sparkle-1 { animation-delay: 0.0s; }
.chiaa.idle .chiaa-sparkle-2 { animation-delay: 1.1s; }
.chiaa.idle .chiaa-sparkle-3 { animation-delay: 2.0s; }
.chiaa.idle .chiaa-sparkle-4 { animation-delay: 0.6s; }
@keyframes caSparkle {
  0%, 100% { opacity: 0; transform: scale(0.4) rotate(0deg); }
  15%      { opacity: 1; transform: scale(1.1) rotate(20deg); }
  35%      { opacity: 0.6; transform: scale(0.9) rotate(45deg); }
  55%      { opacity: 0; transform: scale(0.4) rotate(60deg); }
}

/* ============ MEDIA POLAROID (below) ============ */
.chiaa-media-wrap {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 720px;
  max-width: 90vw;
  transform: translateX(-50%) translateY(40px);
  opacity: 0;
  z-index: 3;
  background: #FFFDF8;
  padding: 14px 14px 56px;
  border-radius: 3px;
  box-shadow:
    0 2px 4px rgba(139,69,87,0.08),
    0 20px 50px -10px rgba(139, 69, 87, 0.30);
}

.chiaa-media-inner {
  width: 100%;
  height: 380px;
  background: linear-gradient(135deg, var(--c-cream), var(--c-ivory));
  border-radius: 2px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chiaa-media-inner img,
.chiaa-media-inner video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.chiaa-media-caption {
  position: absolute;
  bottom: 14px;
  left: 0;
  right: 0;
  text-align: center;
  font-family: var(--font-script);
  font-size: 22px;
  color: var(--c-burgundy);
  letter-spacing: 0.5px;
}

.chiaa.entering .chiaa-media-wrap { animation: caMediaSlide 1s cubic-bezier(0.34, 1.56, 0.64, 1) 1.4s forwards; }
@keyframes caMediaSlide {
  0%   { opacity: 0; transform: translateX(-50%) translateY(80px) scale(0.94); }
  70%  { opacity: 1; transform: translateX(-50%) translateY(-6px) scale(1.01); }
  100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
}

.chiaa.idle .chiaa-media-wrap { animation: caMediaIdle 8s ease-in-out infinite; }
@keyframes caMediaIdle {
  0%, 100% { transform: translateX(-50%) rotate(0deg); }
  50%      { transform: translateX(-50%) rotate(0.3deg); }
}

/* ============ EXIT ============ */
.chiaa.exiting .chiaa-pin        { animation: caPinExit 0.5s ease-in forwards; }
.chiaa.exiting .chiaa-polaroid   { animation: caPolaroidExit 0.7s ease-in 0.2s forwards; }
.chiaa.exiting .chiaa-card,
.chiaa.exiting .chiaa-paper      { animation: caFoldExit 0.8s ease-in 0.4s forwards; }
.chiaa.exiting .chiaa-media-wrap { animation: caMediaExit 0.7s ease-in 0.3s forwards; }
.chiaa.exiting .chiaa-petals     { animation: caPetalsExit 1.2s ease-in forwards; }

@keyframes caPinExit      { to { opacity: 0; transform: translateY(-30px) scale(0.6); } }
@keyframes caPolaroidExit { to { opacity: 0; transform: translateY(-50%) rotate(-5deg) translateY(40px); } }
@keyframes caFoldExit     { to { opacity: 0; transform: translateX(-50%) scale(0.92); filter: blur(4px); } }
@keyframes caMediaExit    { to { opacity: 0; transform: translateX(-50%) translateY(60px) scale(0.94); } }
@keyframes caPetalsExit   { to { opacity: 0; } }

/* ============ RESPONSIVE ============ */
@media (max-width: 760px) {
  .chiaa-card { padding: 24px 20px 24px 24px; height: auto; min-height: 260px; }
  .chiaa-polaroid { position: relative; left: auto; top: auto; transform: rotate(-5deg); margin-bottom: 12px; width: 110px; }
  .chiaa-card { padding-left: 24px; }
  .chiaa-name { font-size: 42px; }
  .chiaa-amount { font-size: 34px; }
  .chiaa-message { font-size: 18px; line-height: 30px; }
  .chiaa-stage { padding-bottom: 340px; }
  .chiaa-media-wrap { width: 92vw; }
  .chiaa-media-inner { height: 280px; }
}
`;

let injected = false;
const ensureStyles = () => {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const style = document.createElement('style');
  style.setAttribute('data-chiaa-scrapbook', '1');
  style.textContent = CSS;
  document.head.appendChild(style);

  if (!document.querySelector('link[data-chiaa-fonts]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Cormorant+Garamond:wght@500;600;700&family=Kalam:wght@400;700&family=Patrick+Hand&display=swap';
    link.setAttribute('data-chiaa-fonts', '1');
    document.head.appendChild(link);
  }
};

// Component
const ChiaaScrapbook: React.FC<AlertProps> = ({ donation }) => {
  useEffect(ensureStyles, []);

  const [phase, setPhase] = useState<'idle' | 'entering' | 'exiting'>('idle');

  useEffect(() => {
    const t = window.setTimeout(() => setPhase('entering'), 60);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== 'entering') return;
    const t = window.setTimeout(() => setPhase('idle'), 4200);
    return () => window.clearTimeout(t);
  }, [phase]);

  const badge = kindLabel(donation);
  const mediaUrl = donation.media_url;
  const isVideo = (donation.media_type || '').toLowerCase().includes('video');
  const showMedia = Boolean(mediaUrl);

  const amountStr = fmt(donation);
  const amountDigits = useMemo(
    () =>
      amountStr.split('').map((ch, i) => (
        <span
          key={i}
          className="digit"
          style={{ animationDelay: \`\${2.5 + i * 0.06}s\` }}
        >
          {ch === ' ' ? '\\u00A0' : ch}
        </span>
      )),
    [amountStr]
  );

  const rootClass = \`chiaa \${phase}\`;

  // Use a placeholder image if no logo is available
  const logoUrl = "https://images.unsplash.com/photo-1610824352934-c10d87b4550d?w=200&h=200&fit=crop";

  return (
    <div className={rootClass}>
      <div className="chiaa-petals">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="chiaa-petal" />
        ))}
      </div>

      <div className="chiaa-stage">
        <div className="chiaa-paper chiaa-paper-3" />
        <div className="chiaa-paper chiaa-paper-2" />
        <div className="chiaa-paper chiaa-paper-1" />

        <div className="chiaa-card">
          <div className="chiaa-polaroid">
            <div className="chiaa-polaroid-inner">
              <img
                src={logoUrl}
                alt="Chiaa"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="chiaa-polaroid-caption">Chiaa ♡</div>
          </div>

          <div className="chiaa-pin" />

          <div className="chiaa-content">
            <div className="chiaa-name">
              {(donation.name || 'Anonymous').trim()}
            </div>

            <div className="chiaa-amount-row">
              <div className="chiaa-amount">{amountDigits}</div>
              <div className="chiaa-badge">{badge}</div>
            </div>

            {donation.message && (
              <div className="chiaa-message">"{donation.message}"</div>
            )}
          </div>

          <div className="chiaa-decor">
            <div className="chiaa-flower chiaa-flower-1" />
            <div className="chiaa-flower chiaa-flower-2" />
            <div className="chiaa-flower chiaa-flower-3" />

            <div className="chiaa-sparkle chiaa-sparkle-1" />
            <div className="chiaa-sparkle chiaa-sparkle-2" />
            <div className="chiaa-sparkle chiaa-sparkle-3" />
            <div className="chiaa-sparkle chiaa-sparkle-4" />
          </div>
        </div>
      </div>

      {showMedia && (
        <div className="chiaa-media-wrap">
          <div className="chiaa-media-inner">
            {isVideo ? (
              <video src={mediaUrl} autoPlay loop muted playsInline />
            ) : (
              <img src={mediaUrl} alt="donation media" />
            )}
          </div>
          <div className="chiaa-media-caption">a little memory ~ {badge.toLowerCase()}</div>
        </div>
      )}
    </div>
  );
};

export default ChiaaScrapbook;
