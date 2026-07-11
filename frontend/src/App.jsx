import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Chat from './components/Chat';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load profile from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('fitness_buddy_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Failed to parse fitness profile", e);
      }
    }
  }, []);

  const handleOnboardingComplete = async (userProfile) => {
    setLoading(true);
    try {
      // Opt: inform backend about onboarding
      const response = await fetch(`${API_BASE_URL}/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfile),
      });

      if (!response.ok) {
        throw new Error('Onboarding network response was not ok');
      }

      const data = await response.json();
      console.log('Backend onboard response:', data);

      // Save locally
      localStorage.setItem('fitness_buddy_profile', JSON.stringify(userProfile));
      setProfile(userProfile);
      
      // Inject welcome message
      setMessages([
        {
          sender: 'bot',
          text: `Welcome! Profile saved. I'm your Fitness Buddy Coach. I've tailored my parameters to your goals. How can I help you today?`,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error during backend onboarding:', error);
      // Fallback: save profile anyway so user can interact
      localStorage.setItem('fitness_buddy_profile', JSON.stringify(userProfile));
      setProfile(userProfile);
      setMessages([
        {
          sender: 'bot',
          text: `Hi! Your profile is set up. Note: I couldn't sync with the backend, but I am ready to help you locally. What is on your mind?`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text) => {
    const userMsg = {
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          profile: profile
        }),
      });

      if (!response.ok) {
        throw new Error('Chat API returned an error');
      }

      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: data.response || "I didn't receive a response. Please try again.",
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: "I'm having trouble connecting to the backend. Please ensure the FastAPI server is running on http://localhost:8000.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetProfile = () => {
    if (window.confirm("Are you sure you want to reset your profile details? Your chat history will also clear.")) {
      localStorage.removeItem('fitness_buddy_profile');
      setProfile(null);
      setMessages([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between py-10 px-4 md:px-8 bg-slate-950 relative overflow-hidden">
      {/* Decorative backdrop blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <header className="max-w-6xl w-full mx-auto mb-8 flex justify-between items-center relative z-10 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🌱</span>
          <span className="font-bold text-lg text-slate-100 tracking-tight">Fitness Buddy</span>
        </div>
        <div className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
          Agentic AI Health Coach
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center relative z-10">
        {!profile ? (
          <Onboarding onComplete={handleOnboardingComplete} />
        ) : (
          <Chat
            profile={profile}
            messages={messages}
            onSendMessage={handleSendMessage}
            onResetProfile={handleResetProfile}
            loading={loading}
          />
        )}
      </main>

      <footer className="max-w-6xl w-full mx-auto mt-8 text-center text-xs text-slate-600 relative z-10 border-t border-slate-900 pt-4">
        Fitness Buddy &copy; 2026. Built with React, Tailwind CSS, FastAPI, and IBM Granite.
      </footer>
    </div>
  );
}

export default App;
