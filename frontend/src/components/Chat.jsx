import React, { useState, useRef, useEffect } from 'react';

const PRESET_PROMPTS = [
  { text: '🏃 20-min home cardio workout', value: 'Can you recommend a quick 20-minute home cardio workout tailored to my fitness profile?' },
  { text: '🥗 Healthy high-protein meal ideas', value: 'What are some healthy, high-protein meal options that match my dietary preferences?' },
  { text: '⚡ Kickstart my motivation', value: 'I am struggling to start my workout today. Can you give me an AI motivational boost?' }
];

export default function Chat({ profile, messages, onSendMessage, onResetProfile, loading }) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  // Auto scroll to bottom when messages list updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const getGoalName = (goalId) => {
    const goalsMap = {
      weight_loss: 'Weight Loss 🔥',
      muscle_gain: 'Muscle Gain 💪',
      endurance: 'Endurance 🏃',
      general_health: 'General Health 🧘'
    };
    return goalsMap[goalId] || goalId;
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-6 min-h-[75vh]">
      {/* 1. Profile Panel (Left) */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div className="glassmorphism p-6 rounded-2xl flex flex-col justify-between h-full min-h-[300px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight text-gradient">Your Coach Profile</h2>
              <span className="bg-purple-500/20 text-purple-300 text-xs px-2.5 py-1 rounded-full font-semibold border border-purple-500/30 uppercase tracking-wide">
                {profile.fitnessLevel}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Selected Goals</div>
                <div className="flex flex-wrap gap-2">
                  {profile.goals.map(g => (
                    <span key={g} className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium px-3 py-1 rounded-lg">
                      {getGoalName(g)}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dietary Preference</div>
                <span className="inline-block bg-emerald-950/40 text-emerald-300 border border-emerald-500/20 text-xs font-medium px-3 py-1 rounded-lg capitalize">
                  {profile.dietaryPreference}
                </span>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Health Restrictions</div>
                <p className="text-slate-300 text-sm bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 italic min-h-[50px]">
                  {profile.limitations || "No reported limitations or restrictions."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/80">
            <button
              onClick={onResetProfile}
              className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 text-sm font-semibold py-3 px-4 rounded-xl transition duration-200"
            >
              🔄 Reset Fitness Profile
            </button>
          </div>
        </div>
      </div>

      {/* 2. Chat Panel (Right) */}
      <div className="flex-1 glassmorphism flex flex-col rounded-2xl h-[75vh] overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="w-3 h-3 bg-emerald-500 rounded-full absolute bottom-0 right-0 border-2 border-slate-950"></span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-base">
                FB
              </div>
            </div>
            <div>
              <h3 className="font-bold text-slate-200">Fitness Buddy Coach</h3>
              <p className="text-xs text-slate-400">IBM Granite Intelligence</p>
            </div>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-3xl mb-4 animate-bounce">
                🤖
              </div>
              <h4 className="text-lg font-bold text-slate-200 mb-1">Your Agent Coach is Ready!</h4>
              <p className="text-slate-400 text-sm mb-6">
                Ask about workout routines, nutrition planning, or tell me if you need an energy boost. I will auto-align plans to your profile.
              </p>
              <div className="w-full space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Suggested Prompts</div>
                {PRESET_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => onSendMessage(p.value)}
                    className="w-full p-3 text-left text-xs bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 rounded-xl text-slate-300 transition duration-200"
                  >
                    {p.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => {
                const isUser = m.sender === 'user';
                return (
                  <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-[0_4px_12px_rgba(99,102,241,0.15)]'
                          : 'bg-slate-900 border border-slate-800/80 text-slate-100 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {/* Render text with markdown-like break support */}
                      <p className="whitespace-pre-line">{m.text}</p>
                      <span className="block text-[10px] text-slate-400 text-right mt-1.5">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800/80 text-slate-300 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/20">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Fitness Buddy..."
              disabled={loading}
              className="flex-1 bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 transition duration-200"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 text-white disabled:text-slate-600 border border-indigo-500/20 disabled:border-slate-850 px-5 py-3 rounded-xl transition duration-200 flex items-center justify-center font-bold"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
