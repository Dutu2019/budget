import { useState, useEffect, useRef } from "react";
import { type Goal } from "../types";
import { TargetIcon, TrashIcon, PlusIcon, CheckIcon, XIcon } from "./Icons";
import confetti from 'canvas-confetti';

interface GoalCardProps {
  goal: Goal;
  label?: string;
  onAddClick?: () => void;
  onDelete?: () => void;
  onAddFunds?: (amount: number) => void;
}

// Synth-style sound effect using Web Audio API
const playCelebrationSound = () => {
  try {
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    // Arpeggio effect
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
    osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.3); // C6

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  label = "Primary Goal",
  onAddClick,
  onDelete,
  onAddFunds,
}) => {
  const percentage = Math.min(
    100,
    Math.round((goal.currentAmount / goal.targetAmount) * 100)
  );
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [fundAmount, setFundAmount] = useState("");

  // Track previous amount to detect WHEN completion happens
  const prevAmountRef = useRef(goal.currentAmount);
  useEffect(() => {
    const prevAmount = prevAmountRef.current;
    // If we just crossed the threshold (and weren't already there)
    if (
      prevAmount < goal.targetAmount &&
      goal.currentAmount >= goal.targetAmount
    ) {
      // Trigger Celebration
      playCelebrationSound();

      const colors = ["#6366f1", "#ec4899", "#06b6d4"]; // Theme colors

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors,
      });

      // Second burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });
      }, 200);
    }
    prevAmountRef.current = goal.currentAmount;
  }, [goal.currentAmount, goal.targetAmount]);

  const handleFundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(fundAmount);
    if (val > 0 && onAddFunds) {
      onAddFunds(val);
      setFundAmount("");
      setIsAddingFunds(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface border border-white/5 py-6 px-10 shadow-xl hover:border-white/10 transition-colors group h-full flex flex-col justify-between">
      {/* Background glow effect */}
      <div
        className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${goal.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity pointer-events-none`}
      ></div>

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <h3
            className="text-xl font-bold text-white mt-1 line-clamp-1"
            title={goal.name}
          >
            {goal.name}
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDelete}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-all cursor-pointer"
            title="Delete Goal"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onAddClick}
            className="p-2 rounded-full bg-slate-800 text-white hover:bg-indigo-500/20 hover:text-indigo-400 transition-all cursor-pointer shadow-lg shadow-black/20"
            title="Create New Goal"
          >
            <TargetIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6 relative z-10">
        <div className="flex justify-between items-end mb-2">
          <span className="text-3xl font-bold text-white">
            ${goal.currentAmount.toLocaleString()}
          </span>
          <span className="text-sm font-medium text-slate-400">
            of ${goal.targetAmount.toLocaleString()}
          </span>
        </div>

        <div className="relative h-3 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${goal.color}`}
            style={{ width: `${percentage}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>

        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>{percentage}% Complete</span>
          <span>Target: {goal.deadline}</span>
        </div>

        {/* Add Funds Mini-Form */}
        <div className="mt-4 pt-4 border-t border-white/5">
          {!isAddingFunds ? (
            <button
              onClick={() => setIsAddingFunds(true)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-300 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Add Funds
            </button>
          ) : (
            <form
              onSubmit={handleFundSubmit}
              className="flex gap-2 animate-[fadeIn_0.2s_ease-out]"
            >
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  $
                </span>
                <input
                  autoFocus
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg py-2 pl-6 pr-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Amount"
                />
              </div>
              <button
                type="submit"
                className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors"
              >
                <CheckIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsAddingFunds(false)}
                className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
