import React, { useState } from 'react';

const FITNESS_LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'New to workouts or returning after a break' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Active 2-3 times a week with good form' },
  { id: 'advanced', label: 'Advanced', desc: 'Training consistently, looking to push limits' },
];

const GOALS = [
  { id: 'weight_loss', label: 'Weight Loss', icon: '🔥' },
  { id: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
  { id: 'endurance', label: 'Endurance & Cardio', icon: '🏃' },
  { id: 'general_health', label: 'General Health & Mobility', icon: '🧘' },
];

const DIETARY_PREFS = [
  { id: 'balanced', label: 'Balanced / No Restriction' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'keto', label: 'Keto' },
  { id: 'paleo', label: 'Paleo' },
];

export default function Onboarding({ onComplete }) {
  const [level, setLevel] = useState('beginner');
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [limitations, setLimitations] = useState('');
  const [diet, setDiet] = useState('balanced');

  const toggleGoal = (goalId) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedGoals.length === 0) {
      alert('Please select at least one fitness goal.');
      return;
    }
    onComplete({
      fitnessLevel: level,
      goals: selectedGoals,
      limitations: limitations.trim(),
      dietaryPreference: diet,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto glassmorphism p-8 rounded-2xl shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow"></div>

      <div className="relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-center mb-2">
          <span className="text-gradient">Welcome to Fitness Buddy</span>
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Let's tailor your workout and nutrition experience. Complete your profile onboarding below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Fitness Level */}
          <div>
            <label className="block text-sm font-semibold tracking-wider uppercase text-slate-300 mb-3">
              1. What is your fitness level?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {FITNESS_LEVELS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLevel(item.id)}
                  className={`p-4 rounded-xl text-left border transition-all duration-300 ${
                    level === item.id
                      ? 'bg-purple-600/30 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)] text-white'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-base mb-1">{item.label}</div>
                  <div className="text-xs text-slate-400 leading-normal">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Fitness Goals */}
          <div>
            <label className="block text-sm font-semibold tracking-wider uppercase text-slate-300 mb-3">
              2. Choose your goals (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {GOALS.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleGoal(goal.id)}
                    className={`p-3 rounded-xl flex flex-col items-center justify-center border text-center transition-all duration-300 ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.25)] text-white'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="text-2xl mb-1">{goal.icon}</span>
                    <span className="text-xs font-semibold">{goal.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Dietary Preferences */}
          <div>
            <label className="block text-sm font-semibold tracking-wider uppercase text-slate-300 mb-3">
              3. Dietary Preference
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {DIETARY_PREFS.map((pref) => (
                <button
                  key={pref.id}
                  type="button"
                  onClick={() => setDiet(pref.id)}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all duration-300 ${
                    diet === pref.id
                      ? 'bg-emerald-600/30 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)] text-white'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  {pref.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Limitations */}
          <div>
            <label htmlFor="limitations" className="block text-sm font-semibold tracking-wider uppercase text-slate-300 mb-2">
              4. Any injuries, physical limitations, or health restrictions?
            </label>
            <textarea
              id="limitations"
              value={limitations}
              onChange={(e) => setLimitations(e.target.value)}
              placeholder="e.g. Lower back pain, bad knees, asthmatic, food allergies, none..."
              className="w-full bg-slate-900/60 border border-slate-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded-xl p-3 text-slate-200 placeholder-slate-600 transition duration-200 min-h-[80px]"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-0.5 shadow-lg shadow-indigo-500/20 active:translate-y-0"
            >
              Get Started with Fitness Buddy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
