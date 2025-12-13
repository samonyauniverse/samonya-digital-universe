
import React, { useRef, useState, useEffect } from 'react';
import { Camera, Radio, Mic, Video, VideoOff, MicOff, Bell, BellOff, Circle, AlertTriangle, Heart, MessageSquare, Send, Users, Download, FileText } from 'lucide-react';
import Teleprompter from '../components/Teleprompter';
import { useApp, Navigate } from '../context/AppContext';

interface LiveComment {
  id: string;
  user: string;
  text: string;
  color: string;
}

const Live: React.FC = () => {
  const { user } = useApp();
  
  // Access Control
  if (!user) {
      return <Navigate to="/login" replace />;
  }

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasVideo, setHasVideo] = useState(true);
  const [hasAudio, setHasAudio] = useState(true);
  const [notifications, setNotifications] = useState(false);
  
  // Use Ref for recording data to prevent closure staleness and ensure all chunks are captured
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]); 
  const [hasRecordedData, setHasRecordedData] = useState(false); // State just for UI button visibility

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // New Features State
  const [isMultiHost, setIsMultiHost] = useState(false);
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [loveCount, setLoveCount] = useState(0);

  // Teleprompter State
  const [showPrompter, setShowPrompter] = useState(false);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Critical: Attach stream to video element whenever stream or isStreaming changes
  useEffect(() => {
    if (isStreaming && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error("Error playing video:", e));
    }
  }, [isStreaming, stream]);

  const playSweetSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      osc.connect(gain);

      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.3); // Pitch up
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      
      osc.start();
      osc.stop(now + 0.5);
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  const triggerNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  const startStream = async () => {
    setErrorMessage(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage("Media devices not supported. Please use a modern browser.");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      // 1. Set the stream state
      setStream(mediaStream);
      
      // 2. Enable streaming mode (this triggers re-render, showing the <video> tag)
      setIsStreaming(true);
      
      // 3. Send notification
      triggerNotification("You are Live!", "Your broadcast on Samonya Live has started.");
      
      // Add initial welcome comment
      setComments([{
        id: 'welcome',
        user: 'System',
        text: 'Welcome to the live stream! Say hello!',
        color: 'bg-red-500'
      }]);

    } catch (err: any) {
      console.error("Error accessing media devices", err);
      let msg = "Could not access camera or microphone.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = "Permission dismissed. Please allow camera and microphone access.";
      }
      setErrorMessage(msg);
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsRecording(false);
    setIsMultiHost(false);
    setShowPrompter(false);
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setHasVideo(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setHasAudio(audioTrack.enabled);
      }
    }
  };

  const toggleNotifications = () => {
    if (!notifications) {
       // Request permission
       if (!("Notification" in window)) {
           alert("This browser does not support desktop notifications");
           return;
       }

       Notification.requestPermission().then(permission => {
           if (permission === 'granted') {
               setNotifications(true);
               new Notification("Notifications Enabled", { 
                   body: "You will now receive alerts for live events.", 
                   icon: '/favicon.ico' 
               });
           } else {
               alert("Notifications were denied. Please enable them in your browser settings to receive updates.");
               setNotifications(false);
           }
       });
    } else {
        setNotifications(false);
    }
  };

  const startRecording = () => {
    if (stream) {
        recordedChunksRef.current = []; // Reset chunks ref
        setHasRecordedData(false);

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
           if (event.data.size > 0) {
               recordedChunksRef.current.push(event.data);
               setHasRecordedData(true);
           }
        };
        
        mediaRecorder.start();
        setIsRecording(true);
        triggerNotification("Recording Started", "Your live session is being recorded.");
    }
  };

  const stopRecording = () => {
     if (mediaRecorderRef.current && isRecording) {
         mediaRecorderRef.current.stop();
         setIsRecording(false);
         // Auto-save logic can be triggered here or user can manually save
         alert("Recording stopped. You can now save the video.");
     }
  };

  const saveRecording = () => {
      if (recordedChunksRef.current.length === 0) {
          alert("No recording data available.");
          return;
      }
      
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `samonya_live_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Optional: Clear chunks after save
      // recordedChunksRef.current = [];
      // setHasRecordedData(false);
  };

  const handleSendComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentInput.trim()) return;

      const colors = ['bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500'];
      const newComment: LiveComment = {
          id: Date.now().toString(),
          user: 'You',
          text: commentInput,
          color: colors[Math.floor(Math.random() * colors.length)]
      };
      
      setComments(prev => [...prev, newComment]);
      setCommentInput('');
  };

  const handleLove = () => {
      setLoveCount(prev => prev + 1);
      playSweetSound();
  };

  return (
    <div className="min-h-screen bg-red-950 text-white pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
              <h1 className="text-4xl font-extrabold flex items-center gap-3 text-red-100">
                  <Radio className="text-red-500 animate-pulse" size={40} />
                  SAMONYA LIVE
              </h1>
              <p className="text-red-300 mt-2">Broadcast your talent to the universe.</p>
          </div>
          <button 
            onClick={toggleNotifications}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${notifications ? 'bg-white text-red-900 border-white font-bold' : 'bg-transparent border-red-300 text-red-100'}`}
          >
             {notifications ? <Bell size={18} /> : <BellOff size={18} />}
             {notifications ? 'Notifications On' : 'Enable Notifications'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Video Area */}
            <div className="flex-1">
                <div className="bg-black/60 rounded-3xl overflow-hidden border border-red-500/30 shadow-2xl relative aspect-video flex flex-col justify-center">
                {!isStreaming ? (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-24 h-24 rounded-full bg-red-600/20 flex items-center justify-center mb-6 animate-pulse">
                            <Camera size={48} className="text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Ready to Go Live?</h3>
                        <p className="text-slate-400 mb-8 max-w-md">Start streaming to connect with fans worldwide. Ensure you have good lighting and a stable connection.</p>
                        
                        {errorMessage && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-3 text-left max-w-md">
                            <AlertTriangle className="text-red-500 flex-shrink-0" size={24} />
                            <span className="text-sm text-red-200">{errorMessage}</span>
                        </div>
                        )}

                        <button 
                            onClick={startStream}
                            className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full transition-all shadow-lg shadow-red-600/40 flex items-center gap-2"
                        >
                            <Video size={20} /> Start Camera
                        </button>
                    </div>
                ) : (
                    <div className={`relative w-full h-full ${isMultiHost ? 'grid grid-cols-2 gap-1 p-1' : ''}`}>
                        
                        {/* Host Stream */}
                        <div className="relative w-full h-full bg-slate-900 overflow-hidden">
                            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs z-10">Host</div>
                        </div>

                        {/* Guest Stream Simulation */}
                        {isMultiHost && (
                            <div className="relative w-full h-full bg-slate-800 flex items-center justify-center border-l border-red-500/30">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto mb-2 flex items-center justify-center animate-pulse">
                                        <Users className="text-slate-500" />
                                    </div>
                                    <p className="text-xs text-slate-400">Waiting for guest...</p>
                                </div>
                                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs z-10">Co-Host</div>
                            </div>
                        )}

                        {/* TELEPROMPTER OVERLAY */}
                        {showPrompter && (
                            <Teleprompter onClose={() => setShowPrompter(false)} />
                        )}
                        
                        {/* Live Indicator Overlay (If prompter not editing covering top) */}
                        <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 rounded text-xs font-bold flex items-center gap-2 z-10 shadow-lg pointer-events-none">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> LIVE
                        </div>
                        
                        {/* Viewer Count Sim */}
                        <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 rounded text-xs font-bold flex items-center gap-2 backdrop-blur-md z-10 pointer-events-none">
                            <Users size={14} /> 1.2k
                        </div>

                        {/* Floating Hearts */}
                        <div className="absolute bottom-24 right-4 flex flex-col items-center z-10 pointer-events-none">
                             {loveCount > 0 && (
                                 <div className="animate-bounce mb-2">
                                     <Heart className="text-red-500 fill-red-500 drop-shadow-lg" size={32} />
                                     <span className="text-xs font-bold shadow-black drop-shadow-md">+{loveCount}</span>
                                 </div>
                             )}
                        </div>
                    </div>
                )}
                </div>

                {/* Controls Bar */}
                {isStreaming && (
                    <div className="mt-6 flex flex-wrap justify-center items-center gap-4 bg-black/40 p-4 rounded-2xl border border-red-500/20 backdrop-blur-sm">
                        <button onClick={toggleVideo} className={`p-3 rounded-full transition-colors ${hasVideo ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500 text-white'}`} title="Toggle Video">
                            {hasVideo ? <Video size={20} /> : <VideoOff size={20} />}
                        </button>
                        <button onClick={toggleAudio} className={`p-3 rounded-full transition-colors ${hasAudio ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500 text-white'}`} title="Toggle Audio">
                            {hasAudio ? <Mic size={20} /> : <MicOff size={20} />}
                        </button>
                        
                        <div className="h-8 w-px bg-white/10 mx-2"></div>

                        {isRecording ? (
                            <button onClick={stopRecording} className="p-3 rounded-full bg-white text-red-600 font-bold px-6 flex items-center gap-2 hover:bg-slate-200 animate-pulse">
                                <div className="w-3 h-3 bg-red-600 rounded-sm"></div> Stop Rec
                            </button>
                        ) : (
                            <button onClick={startRecording} className="p-3 rounded-full bg-red-600/20 border border-red-500 text-white font-bold px-6 flex items-center gap-2 hover:bg-red-600 hover:border-transparent transition-all">
                                <Circle size={12} fill="currentColor" /> Record
                            </button>
                        )}

                        <div className="h-8 w-px bg-white/10 mx-2"></div>

                        <button 
                            onClick={() => setShowPrompter(!showPrompter)} 
                            className={`p-3 rounded-full transition-colors flex items-center gap-2 px-4 font-semibold ${showPrompter ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-white/10 hover:bg-white/20'}`}
                            title="Open Teleprompter"
                        >
                            <FileText size={18} /> Prompter
                        </button>

                        <button 
                            onClick={() => setIsMultiHost(!isMultiHost)} 
                            className={`p-3 rounded-full transition-colors flex items-center gap-2 px-4 font-semibold ${isMultiHost ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}
                        >
                            <Users size={18} /> {isMultiHost ? 'Co-host' : 'Co-host'}
                        </button>

                        <div className="h-8 w-px bg-white/10 mx-2"></div>

                        <button onClick={stopStream} className="p-3 rounded-full bg-red-900/80 hover:bg-red-900 text-white border border-red-500/50 px-6 font-bold">
                            End Stream
                        </button>

                        {/* Download Button (shows if chunks exist but not recording) */}
                        {!isRecording && hasRecordedData && (
                            <button onClick={saveRecording} className="ml-auto p-3 rounded-full bg-green-600 hover:bg-green-500 text-white flex items-center gap-2 px-4 animate-bounce">
                                <Download size={18} /> Save Video
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Live Chat & Interaction Sidebar */}
            {isStreaming && (
                <div className="lg:w-80 w-full h-[500px] lg:h-auto bg-black/60 rounded-3xl border border-red-500/30 flex flex-col overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-white/10 bg-red-900/20">
                        <h3 className="font-bold flex items-center gap-2 text-red-200">
                            <MessageSquare size={18} /> Live Chat
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {comments.length === 0 ? (
                            <p className="text-slate-500 text-center text-sm italic mt-10">Be the first to say hello!</p>
                        ) : (
                            comments.map(c => (
                                <div key={c.id} className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${c.color} text-white`}>
                                            {c.user.charAt(0)}
                                        </span>
                                        <span className="text-xs font-bold text-slate-300">{c.user}</span>
                                    </div>
                                    <p className="text-sm text-white ml-6 mt-0.5 break-words">{c.text}</p>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-3 border-t border-white/10 bg-black/40">
                         {/* Quick Love Button */}
                        <div className="flex justify-end mb-2">
                            <button 
                                onClick={handleLove}
                                className="p-2 rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-500 hover:text-red-400 transition-all hover:scale-110 active:scale-90"
                                title="Send Love"
                            >
                                <Heart size={24} fill="currentColor" />
                            </button>
                        </div>

                        <form onSubmit={handleSendComment} className="flex gap-2">
                            <input 
                                type="text" 
                                value={commentInput}
                                onChange={e => setCommentInput(e.target.value)}
                                placeholder="Say something..."
                                className="flex-1 bg-slate-800 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                            />
                            <button 
                                type="submit" 
                                disabled={!commentInput.trim()}
                                className="p-2 bg-red-600 rounded-full text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
        
        {/* Info Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black/20 p-6 rounded-xl border border-red-500/20 hover:border-red-500/50 transition-colors">
                <h3 className="text-xl font-bold mb-2 text-red-300">Studio Tools</h3>
                <p className="text-sm opacity-80 text-red-100">
                    Use the toolbar to manage your stream. You can record your session, use the <span className="text-white font-bold">Pro Teleprompter</span> for scripts, invite co-hosts, and interact with your audience.
                </p>
            </div>
             <div className="bg-black/20 p-6 rounded-xl border border-red-500/20 hover:border-red-500/50 transition-colors">
                <h3 className="text-xl font-bold mb-2 text-red-300">Audience Interaction</h3>
                <p className="text-sm opacity-80 text-red-100">
                    Viewers can send "Love" which plays a sweet sound and animated hearts. Comments appear instantly in the chat sidebar. Notifications are sent to subscribers when you go live.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Live;
