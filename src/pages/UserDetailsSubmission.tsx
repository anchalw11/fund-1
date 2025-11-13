import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Upload, Video, Image, Check, AlertCircle, Loader, 
  Instagram, Twitter, Youtube, Linkedin, Facebook,
  FileText, Sparkles, ArrowRight, X
} from 'lucide-react';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/db';

export default function UserDetailsSubmission() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const videoRef = useRef<HTMLInputElement>(null);
  const screenshotRef = useRef<HTMLInputElement>(null);

  // Get hasAddOn from location state
  const hasAddOn = location.state?.hasAddOn || false;

  const [formData, setFormData] = useState({
    instagram: '',
    twitter: '',
    youtube: '',
    linkedin: '',
    facebook: '',
    otherSocial: '',
    videoIntro: null as File | null,
    writtenIntro: '',
    question1: '',
    question2: '',
    question3: '',
    question4: '',
    screenshots: [] as File[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'screenshots') => {
    const files = e.target.files;
    if (!files) return;

    if (type === 'video') {
      const file = files[0];
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        setErrors(prev => ({ ...prev, video: 'Video must be under 100MB' }));
        return;
      }
      setFormData(prev => ({ ...prev, videoIntro: file }));
      setErrors(prev => ({ ...prev, video: '' }));
    } else {
      const fileArray = Array.from(files);
      setFormData(prev => {
        const newScreenshots = [...prev.screenshots, ...fileArray];
        // Check if we now have at least 2 screenshots
        if (newScreenshots.length >= 2) {
          setErrors(prevErrors => ({ ...prevErrors, screenshots: '' }));
        }
        return { ...prev, screenshots: newScreenshots };
      });
    }
  };

  const removeScreenshot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      // At least one social media link is required
      const hasSocial = formData.instagram || formData.twitter || formData.youtube || 
                        formData.linkedin || formData.facebook || formData.otherSocial;
      if (!hasSocial) {
        newErrors.social = 'Please provide at least one social media link';
      }
    }

    if (stepNumber === 2) {
      // Screenshots are required (can't skip)
      if (formData.screenshots.length < 2) {
        newErrors.screenshots = 'Please upload at least 2 proof screenshots (REQUIRED)';
      }
    }

    if (stepNumber === 3) {
      // Video OR written intro required
      const combinedQuestions = (formData.question1 || '') + (formData.question2 || '') + (formData.question3 || '') + (formData.question4 || '');
      if (!formData.videoIntro && !combinedQuestions.trim()) {
        newErrors.intro = 'Please provide either a video introduction or answer the written questions';
      }
      if (!formData.videoIntro && combinedQuestions.length < 100) {
        newErrors.intro = 'Written answers must total at least 100 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setUploadProgress(0);

    try {
      const user = await getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Upload files via backend API
      const formDataToSend = new FormData();

      // Add screenshots
      formData.screenshots.forEach((file, index) => {
        formDataToSend.append('files', file);
      });

      // Add video if provided
      if (formData.videoIntro) {
        formDataToSend.append('files', formData.videoIntro);
      }

      // Get session for access token
      if (!supabase) {
        throw new Error('Database not initialized');
      }
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      // Upload via backend API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload/competition-proof`, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${accessToken || ''}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const uploadResult = await response.json();
      setUploadProgress(50);

      // Parse uploaded URLs
      const allUrls = uploadResult.urls || [];
      const screenshotUrls: string[] = [];
      let videoUrl = '';

      // Separate screenshots and video URLs based on file type
      allUrls.forEach((url: string) => {
        if (url.includes('/videos/') || formData.videoIntro) {
          videoUrl = url;
        } else {
          screenshotUrls.push(url);
        }
      });

      setUploadProgress(75);

      // Combine separate questions into written intro
      const combinedWrittenIntro = formData.question1 || formData.question2 || formData.question3 || formData.question4
        ? `1. Why should you win this competition?\n${formData.question1 || ''}\n\n2. Why should we hire you?\n${formData.question2 || ''}\n\n3. What makes you a great trader?\n${formData.question3 || ''}\n\n4. What are your goals?\n${formData.question4 || ''}`
        : null;

      // Save to database
      const { error: dbError } = await supabase
        .from('competition_user_details')
        .insert({
          user_id: user.id,
          instagram: formData.instagram || null,
          twitter: formData.twitter || null,
          youtube: formData.youtube || null,
          linkedin: formData.linkedin || null,
          facebook: formData.facebook || null,
          other_social: formData.otherSocial || null,
          video_intro_url: videoUrl || null,
          written_intro: combinedWrittenIntro,
          proof_screenshots: screenshotUrls,
          has_addon: hasAddOn,
          submitted_at: new Date().toISOString(),
        });

      if (dbError) throw dbError;

      // Navigate to contract signing
      navigate('/contract-signing');
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: 'Failed to submit. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 via-cyber-purple/5 to-neon-pink/5" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-electric-blue/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyber-purple/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-electric-blue/10 to-cyber-purple/10 backdrop-blur-xl border border-electric-blue/30 rounded-full">
              <Sparkles className="w-4 h-4 text-electric-blue animate-pulse" />
              <span className="text-sm font-bold tracking-wider text-electric-blue">STEP {step} OF 3</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-electric-blue via-cyber-purple to-neon-pink bg-clip-text text-transparent">
              Complete Your Profile
            </span>
          </h1>
          <p className="text-xl text-gray-400">Help us verify your participation and understand your trading journey</p>
        </div>

        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-500
                  ${step >= s 
                    ? 'bg-gradient-to-r from-electric-blue to-cyber-purple border-electric-blue text-white' 
                    : 'border-gray-600 text-gray-600'
                  }
                `}>
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`
                    flex-1 h-1 mx-2 rounded-full transition-all duration-500
                    ${step > s ? 'bg-gradient-to-r from-electric-blue to-cyber-purple' : 'bg-gray-700'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 text-xs text-center text-gray-400 mt-2">
            <span>Social Media</span>
            <span>Proof Screenshots</span>
            <span>Introduction</span>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-gradient-to-br from-black/80 via-black/60 to-transparent backdrop-blur-2xl border-2 border-electric-blue/30 rounded-3xl p-8 mb-8">
          {/* Step 1: Social Media Links */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-2 text-white">Connect Your Socials</h2>
                <p className="text-gray-400">Provide at least one social media profile for verification</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Instagram */}
                <div className="group">
                  <label className="flex items-center space-x-2 text-sm font-bold mb-2 text-gray-300">
                    <Instagram className="w-4 h-4 text-pink-500" />
                    <span>Instagram</span>
                  </label>
                  <input
                    type="url"
                    value={formData.instagram}
                    onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="https://instagram.com/yourprofile"
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-electric-blue focus:outline-none transition-all group-hover:border-gray-600"
                  />
                </div>

                {/* Twitter */}
                <div className="group">
                  <label className="flex items-center space-x-2 text-sm font-bold mb-2 text-gray-300">
                    <Twitter className="w-4 h-4 text-blue-400" />
                    <span>Twitter / X</span>
                  </label>
                  <input
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                    placeholder="https://twitter.com/yourprofile"
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-electric-blue focus:outline-none transition-all group-hover:border-gray-600"
                  />
                </div>

                {/* YouTube */}
                <div className="group">
                  <label className="flex items-center space-x-2 text-sm font-bold mb-2 text-gray-300">
                    <Youtube className="w-4 h-4 text-red-500" />
                    <span>YouTube</span>
                  </label>
                  <input
                    type="url"
                    value={formData.youtube}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtube: e.target.value }))}
                    placeholder="https://youtube.com/@yourchannel"
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-electric-blue focus:outline-none transition-all group-hover:border-gray-600"
                  />
                </div>

                {/* LinkedIn */}
                <div className="group">
                  <label className="flex items-center space-x-2 text-sm font-bold mb-2 text-gray-300">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                    <span>LinkedIn</span>
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-electric-blue focus:outline-none transition-all group-hover:border-gray-600"
                  />
                </div>

                {/* Facebook */}
                <div className="group">
                  <label className="flex items-center space-x-2 text-sm font-bold mb-2 text-gray-300">
                    <Facebook className="w-4 h-4 text-blue-500" />
                    <span>Facebook</span>
                  </label>
                  <input
                    type="url"
                    value={formData.facebook}
                    onChange={(e) => setFormData(prev => ({ ...prev, facebook: e.target.value }))}
                    placeholder="https://facebook.com/yourprofile"
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-electric-blue focus:outline-none transition-all group-hover:border-gray-600"
                  />
                </div>

                {/* Other */}
                <div className="group">
                  <label className="flex items-center space-x-2 text-sm font-bold mb-2 text-gray-300">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>Other</span>
                  </label>
                  <input
                    type="url"
                    value={formData.otherSocial}
                    onChange={(e) => setFormData(prev => ({ ...prev, otherSocial: e.target.value }))}
                    placeholder="Any other social profile"
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-electric-blue focus:outline-none transition-all group-hover:border-gray-600"
                  />
                </div>
              </div>

              {errors.social && (
                <div className="flex items-center space-x-2 text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.social}</span>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Proof Screenshots */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-2 text-white">Upload Proof Screenshots</h2>
                <p className="text-gray-400">
                  <span className="text-red-400 font-bold">⚠️ REQUIRED - CAN'T SKIP:</span> Upload screenshots showing you've followed us on social media
                </p>
              </div>

              <div
                onClick={() => screenshotRef.current?.click()}
                className="group relative border-2 border-dashed border-electric-blue/50 rounded-2xl p-12 text-center cursor-pointer hover:border-electric-blue hover:bg-electric-blue/5 transition-all duration-300"
              >
                <input
                  ref={screenshotRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'screenshots')}
                  className="hidden"
                />
                
                <Upload className="w-16 h-16 mx-auto mb-4 text-electric-blue group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Upload Screenshots</h3>
                <p className="text-gray-400 mb-4">Click to browse or drag & drop</p>
                <p className="text-sm text-gray-500">
                  PNG, JPG up to 10MB each • Minimum 2 screenshots required
                </p>
              </div>

              {/* Preview uploaded screenshots */}
              {formData.screenshots.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.screenshots.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-40 object-cover rounded-xl border-2 border-electric-blue/30"
                      />
                      <button
                        onClick={() => removeScreenshot(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {errors.screenshots && (
                <div className="flex items-center space-x-2 text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.screenshots}</span>
                </div>
              )}

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-yellow-400 text-sm font-semibold mb-2">📸 What to Include:</p>
                <ul className="text-gray-300 text-sm space-y-1 ml-4">
                  <li>• Screenshot of you following @fund8r on Instagram/Twitter</li>
                  <li>• Screenshot showing your username clearly</li>
                  <li>• Any other proof of engagement with our brand</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 3: Video/Written Introduction */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-2 text-white">Tell Us About Yourself</h2>
                <p className="text-gray-400">Video intro preferred, but written explanation is also accepted</p>
              </div>

              {/* Video Upload */}
              <div className="space-y-4">
                <div
                  onClick={() => videoRef.current?.click()}
                  className="group relative border-2 border-dashed border-cyber-purple/50 rounded-2xl p-12 text-center cursor-pointer hover:border-cyber-purple hover:bg-cyber-purple/5 transition-all duration-300"
                >
                  <input
                    ref={videoRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    className="hidden"
                  />
                  
                  <Video className="w-16 h-16 mx-auto mb-4 text-cyber-purple group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2">
                    {formData.videoIntro ? formData.videoIntro.name : 'Upload Video Introduction (Optional)'}
                  </h3>
                  <p className="text-gray-400 mb-4">Click to browse or drag & drop</p>
                  <p className="text-sm text-gray-500">
                    MP4, MOV, AVI up to 100MB
                  </p>
                </div>

                {formData.videoIntro && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-semibold">Video uploaded: {formData.videoIntro.name}</span>
                    </div>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, videoIntro: null }))}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="text-center text-gray-400 font-bold">- OR -</div>

              {/* Written Introduction - Separate Columns */}
              <div className="space-y-6">
                <div className="text-center">
                  <label className="block text-sm font-bold text-gray-300 mb-4">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Written Introduction (Required if no video)
                  </label>
                  <p className="text-gray-400 text-sm">Please answer each question below</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Question 1 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-cyber-purple">
                      1. Why should you win this competition?
                    </label>
                    <textarea
                      value={formData.question1 || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, question1: e.target.value }))}
                      placeholder="Explain why you deserve to win..."
                      rows={4}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-cyber-purple focus:outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Question 2 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-cyber-purple">
                      2. Why should we hire you?
                    </label>
                    <textarea
                      value={formData.question2 || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, question2: e.target.value }))}
                      placeholder="What makes you a great fit for Fund8r..."
                      rows={4}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-cyber-purple focus:outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Question 3 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-cyber-purple">
                      3. What makes you a great trader?
                    </label>
                    <textarea
                      value={formData.question3 || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, question3: e.target.value }))}
                      placeholder="Describe your trading skills and experience..."
                      rows={4}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-cyber-purple focus:outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Question 4 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-cyber-purple">
                      4. What are your goals?
                    </label>
                    <textarea
                      value={formData.question4 || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, question4: e.target.value }))}
                      placeholder="What do you hope to achieve..."
                      rows={4}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:border-cyber-purple focus:outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm text-gray-500">
                    Total characters: {((formData.question1 || '') + (formData.question2 || '') + (formData.question3 || '') + (formData.question4 || '')).length} / 100 minimum
                  </div>
                </div>
              </div>

              {errors.intro && (
                <div className="flex items-center space-x-2 text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.intro}</span>
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-blue-400 text-sm font-semibold mb-2">💡 Pro Tips:</p>
                <ul className="text-gray-300 text-sm space-y-1 ml-4">
                  <li>• Be authentic and genuine</li>
                  <li>• Highlight your unique trading style</li>
                  <li>• Explain your passion for trading</li>
                  <li>• Show why you'd be a great fit for Fund8r</li>
                </ul>
              </div>
            </div>
          )}

          {/* Error messages */}
          {errors.submit && (
            <div className="mt-6 flex items-center space-x-2 text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Upload progress */}
          {loading && uploadProgress > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Uploading files...</span>
                <span className="text-sm font-bold text-electric-blue">{uploadProgress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-electric-blue to-cyber-purple transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              disabled={loading}
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              ← Back
            </button>
          )}
          
          <div className={step === 1 ? 'ml-auto' : ''}>
            <button
              onClick={handleNext}
              disabled={loading}
              className="group relative px-12 py-4 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-electric-blue via-cyber-purple to-neon-pink" />
              <div className="relative flex items-center space-x-3 text-white">
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{step === 3 ? 'Submit & Continue' : 'Next Step'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
