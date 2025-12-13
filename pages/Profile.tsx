
import React, { useState, useRef, useEffect } from 'react';
import { useApp, useNavigate } from '../context/AppContext';
import { Navigate } from '../context/AppContext';
import { Camera, Save, LogOut, ArrowLeft, Eye, Image as ImageIcon, X, Check, Upload, Edit3, Trash2, Rocket, Maximize } from 'lucide-react';
import PricingSection from '../components/PricingSection';

const Profile: React.FC = () => {
  const { user, updateProfile, logout } = useApp();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(user?.avatar || null);
  
  // New State for Image Handling
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if user context updates (only when not editing to prevent overwrite)
  useEffect(() => {
    if (user && !isEditing) {
        setName(user.name);
        setPreviewAvatar(user.avatar || null);
    }
  }, [user, isEditing]);

  if (!user) return <Navigate to="/login" replace />;

  const handleSaveProfile = () => {
    // If previewAvatar is null, explicitly pass undefined to clear it, or the string to set it
    updateProfile({ 
        name, 
        avatar: previewAvatar || undefined 
    });
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleImageClick = () => {
      if (isEditing) {
          // In Edit Mode, directly open file picker
          fileInputRef.current?.click();
      } else {
          // In View Mode, open menu
          setShowImageMenu(true);
      }
  };

  const handleViewPhoto = () => {
      setShowImageMenu(false);
      setShowImageViewer(true);
  };

  const handleChangePhoto = () => {
      setShowImageMenu(false);
      fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
      setPreviewAvatar(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          // Limit file size to 2MB for performance
          if (file.size > 2 * 1024 * 1024) {
              alert("Image size must be less than 2MB.");
              return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
              const result = reader.result as string;
              if (isEditing) {
                  // If editing, just update preview (no modal needed for simplicity in quick edit)
                  setPreviewAvatar(result);
              } else {
                  // If not editing (direct change), show confirmation modal with ZOOM options
                  setPendingImage(result);
                  setZoom(1); // Reset zoom
              }
          };
          reader.readAsDataURL(file);
      }
      // Reset input so same file can be selected again if cancelled
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  const confirmImageUpload = async () => {
      if (pendingImage) {
          try {
              // Create a canvas to crop and zoom the image
              const img = new Image();
              img.src = pendingImage;
              await new Promise((resolve) => { img.onload = resolve; });

              const canvas = document.createElement('canvas');
              const size = 400; // Standardize output size
              canvas.width = size;
              canvas.height = size;
              const ctx = canvas.getContext('2d');

              if (ctx) {
                  // Logic to simulate object-fit: cover + zoom
                  // 1. Calculate aspect ratio
                  const aspect = img.width / img.height;
                  let drawWidth, drawHeight;

                  // 2. Determine base 'cover' dimensions
                  if (aspect > 1) {
                      // Wider image
                      drawHeight = size;
                      drawWidth = size * aspect;
                  } else {
                      // Taller image
                      drawWidth = size;
                      drawHeight = size / aspect;
                  }

                  // 3. Apply Zoom Factor
                  drawWidth *= zoom;
                  drawHeight *= zoom;

                  // 4. Center the image
                  const x = (size - drawWidth) / 2;
                  const y = (size - drawHeight) / 2;

                  ctx.drawImage(img, x, y, drawWidth, drawHeight);
                  
                  const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
                  
                  setPreviewAvatar(croppedBase64);
                  updateProfile({ avatar: croppedBase64 });
                  setPendingImage(null);
                  alert("Profile picture updated!");
              }
          } catch (e) {
              console.error("Image processing error", e);
              // Fallback to original if processing fails
              setPreviewAvatar(pendingImage);
              updateProfile({ avatar: pendingImage });
              setPendingImage(null);
          }
      }
  };

  const cancelImageUpload = () => {
      setPendingImage(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 flex flex-col items-center relative">
      
      {/* Top User Section - Centered */}
      <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700 relative z-10">
          <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
          />
          
          <div 
            onClick={handleImageClick}
            className={`w-32 h-32 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-5xl font-bold text-white mb-4 relative group cursor-pointer overflow-hidden border-4 border-slate-800 shadow-2xl transition-transform ${isEditing ? 'hover:scale-105 ring-4 ring-pink-500/30' : ''}`}
          >
            {previewAvatar ? (
                <img src={previewAvatar} alt={name} className="w-full h-full object-cover" />
            ) : (
                user.name.charAt(0).toUpperCase()
            )}
            
            {/* Visual Cue Overlay */}
            <div className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center transition-opacity ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <Camera size={32} />
            </div>
          </div>

          {/* Edit Mode Hint */}
          {isEditing && (
              <p className="text-xs text-pink-400 mb-4 animate-pulse">Tap image to change</p>
          )}

          {/* Image Menu Modal (Only when NOT editing) */}
          {showImageMenu && !isEditing && (
              <div className="absolute top-28 z-50 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[200px] animate-in zoom-in duration-200">
                  <button onClick={handleViewPhoto} className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-center gap-2 text-sm text-white transition-colors border-b border-white/5">
                      <Eye size={16} className="text-blue-400" /> View Profile Picture
                  </button>
                  <button onClick={handleChangePhoto} className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-center gap-2 text-sm text-white transition-colors">
                      <Upload size={16} className="text-pink-400" /> Change Profile Picture
                  </button>
                  <button onClick={() => setShowImageMenu(false)} className="w-full text-center px-4 py-2 bg-slate-950 text-xs text-slate-500 hover:text-white transition-colors border-t border-white/5">
                      Cancel
                  </button>
              </div>
          )}

          {/* Image Menu Backdrop */}
          {showImageMenu && !isEditing && (
              <div className="fixed inset-0 z-40" onClick={() => setShowImageMenu(false)}></div>
          )}

          <div className="flex flex-col items-center gap-2 w-full">
              {isEditing ? (
                <div className="flex flex-col items-center gap-4 w-full max-w-sm animate-in fade-in zoom-in duration-300 bg-slate-900/80 p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-sm">
                    
                    <div className="flex gap-2 w-full justify-center mb-2">
                         <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-xs font-bold text-white flex items-center gap-2 transition-colors"
                         >
                            <Camera size={14} /> Change Photo
                         </button>
                         {previewAvatar && (
                             <button 
                                onClick={handleRemovePhoto}
                                className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-500/20 rounded-lg text-xs font-bold text-red-400 flex items-center gap-2 transition-colors"
                             >
                                <Trash2 size={14} /> Remove
                             </button>
                         )}
                    </div>

                    <div className="w-full h-px bg-white/5 my-1"></div>

                    <div className="w-full">
                        <label className="text-xs text-slate-400 font-bold ml-1 mb-1 block uppercase tracking-wider">Display Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white text-center focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
                            placeholder="Enter name"
                            autoFocus
                        />
                    </div>
                    <button 
                        onClick={handleSaveProfile} 
                        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 mt-2"
                    >
                        <Save size={18} /> Save Changes
                    </button>
                </div>
              ) : (
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    {user.name} 
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-cyan-400 font-normal transition-colors px-2 py-1 rounded hover:bg-white/5">
                        <Edit3 size={14} /> Edit Profile
                    </button>
                </h2>
              )}
              <p className="text-slate-400">{user.email}</p>
          </div>
      </div>

      {/* Enter Universe Button - Silver with Rainbow Text */}
      <div className="w-full flex justify-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <button
            onClick={() => navigate('/')}
            className="group relative px-12 py-5 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-400 border-2 border-gray-300 rounded-full shadow-[0_4px_25px_rgba(255,255,255,0.4)] hover:shadow-[0_0_35px_rgba(255,255,255,0.6)] transform hover:scale-105 transition-all flex items-center gap-3 overflow-hidden active:scale-95"
        >
            {/* Metallic Shimmer Effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-10"></span>
            
            <Rocket className="text-slate-800 z-20 group-hover:rotate-12 transition-transform" size={28} />
            
            <span className="relative z-20 text-xl font-black tracking-wider uppercase bg-gradient-to-r from-cyan-500 via-purple-600 via-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm">
                Enter the universe for free
            </span>
        </button>
      </div>

      {/* Full Screen Image Viewer */}
      {showImageViewer && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowImageViewer(false)}>
              <button 
                  onClick={() => setShowImageViewer(false)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 bg-white/10 rounded-full"
              >
                  <X size={24} />
              </button>
              <div className="max-w-4xl max-h-[80vh] relative" onClick={e => e.stopPropagation()}>
                  {previewAvatar ? (
                      <img src={previewAvatar} alt="Profile" className="max-w-full max-h-[80vh] rounded-xl shadow-2xl border border-white/10" />
                  ) : (
                      <div className="w-64 h-64 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-9xl font-bold text-white border-4 border-slate-800">
                          {user.name.charAt(0).toUpperCase()}
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Pending Image Confirmation Modal with Zoom */}
      {pendingImage && !isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in zoom-in duration-300">
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <h3 className="text-xl font-bold text-white mb-4">Edit Profile Picture</h3>
                  
                  <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-slate-800 shadow-xl mb-4 relative bg-black">
                      <img 
                        src={pendingImage} 
                        alt="Preview" 
                        className="w-full h-full object-cover transition-transform duration-100"
                        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }} 
                      />
                  </div>

                  <div className="mb-6 px-4">
                      <div className="flex justify-between text-xs text-slate-400 mb-1 font-bold uppercase tracking-wider">
                          <span>Zoom</span>
                          <span>{Math.round((zoom - 1) * 50)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="3" 
                        step="0.1" 
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                  </div>
                  
                  <div className="flex gap-3">
                      <button 
                          onClick={cancelImageUpload}
                          className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors border border-white/5"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={confirmImageUpload}
                          className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105"
                      >
                          Save
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Pricing Section - Full Width Centered */}
      <div className="w-full border-t border-white/10 pt-8 relative">
          <PricingSection />
      </div>

      {/* Footer Controls */}
      <div className="mt-12 flex justify-center w-full">
          <button onClick={logout} className="text-red-500 hover:text-red-400 flex items-center gap-2 transition-colors px-6 py-3 rounded-full hover:bg-white/5">
              <LogOut size={16} /> Sign Out
          </button>
      </div>

    </div>
  );
};

export default Profile;
