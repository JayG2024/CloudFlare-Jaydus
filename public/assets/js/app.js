const { useState, useRef, useEffect } = React;

// Production logging - only log in development
const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
const log = isDev ? console.log : () => {};
const logError = isDev ? console.error : (error) => {
    // In production, still capture critical errors but don't expose details
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: error.message || 'Unknown error',
            fatal: false
        });
    }
};

// Icons replaced with emoji fallbacks for stability
const Icon = ({ name, size = 16, ...props }) => {
    const iconSVGs = {
        'messageCircle': `<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>`,
        'barChart3': `<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>`,
        'search': `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>`,
        'code': `<polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/>`,
        'bot': `<rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="m12 7 0 4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>`,
        'image': `<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>`,
        'video': `<path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>`,
        'mic': `<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>`,
        'zap': `<polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>`,
        'settings': `<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>`,
        'helpCircle': `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
        'users': `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
        'creditCard': `<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>`,
        'send': `<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>`,
        'plus': `<path d="M5 12h14"/><path d="M12 5v14"/>`,
        'history': `<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>`,
        'micOff': `<line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12l1.76 1.76c-.5.43-1.05.79-1.66 1.07"/><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-7.07 7"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>`,
        'user': `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
        'play': `<polygon points="5,3 19,12 5,21"/>`,
        'pause': `<rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/>`,
        'download': `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>`,
        'upload': `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>`,
        'trash2': `<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>`,
        'edit': `<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>`,
        'eye': `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`,
        'copy': `<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>`,
        'star': `<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>`,
        'volume2': `<polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/>`,
        'headphones': `<path d="M3 14h3a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h3"/>`,
        'userPlus': `<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>`,
        'crown': `<path d="M2 20h20l-2-6-4 2-4-4-4 4-4-2L2 20Z"/><path d="M6 6l4 4 4-4 4 4"/>`,
        'shield': `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
        'check': `<polyline points="20,6 9,17 4,12"/>`,
        'x': `<path d="m18 6-12 12"/><path d="m6 6 12 12"/>`,
        'alertTriangle': `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
        'info': `<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>`,
        'chevronRight': `<polyline points="9,18 15,12 9,6"/>`,
        'filter': `<polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>`,
        'sortAsc': `<path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><rect width="4" height="6" x="15" y="4"/><rect width="4" height="6" x="15" y="14"/>`,
        'brain': `<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>`,
        'link': `<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>`,
        'externalLink': `<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>`,
        'share2': `<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>`,
        'clock': `<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>`
    };
    
    const svgPath = iconSVGs[name];
    if (!svgPath) {
        return React.createElement('div', { 
            style: { 
                width: size, 
                height: size, 
                display: 'inline-block',
                backgroundColor: 'currentColor',
                borderRadius: '2px'
            }
        });
    }
    
    return React.createElement('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        style: { display: 'inline-block' },
        ...props,
        dangerouslySetInnerHTML: { __html: svgPath }
    });
};

// Use relative URLs for better dev/staging support
const API_BASE = window.location.origin;

function JaydusAI() {
    // Authentication State - Production mode (no auth required)
    const [user, setUser] = useState({ id: 'prod-user', email: 'user@jaydus.ai', fullName: 'User' });
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [showAuthForm, setShowAuthForm] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login', 'register', or 'reset'
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');
    
    // Auth form data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    
    // App State
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedModel, setSelectedModel] = useState('fast');
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentResponse, setCurrentResponse] = useState('');
    const [availableModels, setAvailableModels] = useState([]);
    
    // Conversation Management
    const [conversations, setConversations] = useState([]);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [showConversationHistory, setShowConversationHistory] = useState(false);
    
    // Image Generation
    const [imagePrompt, setImagePrompt] = useState('');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [imageError, setImageError] = useState('');
    const [imageHistory, setImageHistory] = useState([]);
    const [selectedImageModel, setSelectedImageModel] = useState('photon-flash');
    
    // Voice Features
    const [isRecording, setIsRecording] = useState(false);
    const [voiceText, setVoiceText] = useState('');
    const [codeQuery, setCodeQuery] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('alloy');
    const [generatedAudio, setGeneratedAudio] = useState(null);
    const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
    const [voiceMode, setVoiceMode] = useState('tts'); // 'tts' or 'stt'
    
    // Assistants
    const [assistants, setAssistants] = useState([]);
    const [newAssistant, setNewAssistant] = useState({ name: '', description: '', prompt: '' });
    const [isCreatingAssistant, setIsCreatingAssistant] = useState(false);
    
    // Team Management
    const [teamMembers, setTeamMembers] = useState([
        { id: 1, name: 'Jason Gordon', email: 'jason@jaydus.ai', role: 'Owner', status: 'online', joinDate: '2025-08-07' }
    ]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');
    
    // Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Voice Input
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const [voiceError, setVoiceError] = useState('');
    
    
    const messagesEndRef = useRef(null);

    const models = {
        fast: { name: 'Jaydus Fast', icon: '/assets/images/jaydus-logo.webp', description: 'Quick responses', badge: 'Fast', color: '#10b981', actual: 'openai/gpt-4o-mini' },
        pro: { name: 'Jaydus Pro', icon: '/assets/images/jaydus-logo.webp', description: 'Versatile intelligence', badge: 'Pro', color: '#3b82f6', actual: 'openai/gpt-4o' },
        max: { name: 'Jaydus Max', icon: '/assets/images/jaydus-logo.webp', description: 'Peak performance', badge: 'Max', color: '#8b5cf6', actual: 'anthropic/claude-3.5-sonnet' }
    };

    const voices = [
        { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced tone' },
        { id: 'echo', name: 'Echo', description: 'Calm, professional' },
        { id: 'fable', name: 'Fable', description: 'Warm, friendly' },
        { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative' },
        { id: 'nova', name: 'Nova', description: 'Young, energetic' },
        { id: 'shimmer', name: 'Shimmer', description: 'Bright, cheerful' }
    ];

    // Voice Recognition Setup
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = false;
            recognitionInstance.lang = 'en-US';
            
            setRecognition(recognitionInstance);
        } else {
            setVoiceError('Voice recognition not supported in this browser');
        }
    }, []);

    // Voice Input Functions
    const startVoiceRecognition = (callback) => {
        if (!recognition) {
            setVoiceError('Voice recognition not available');
            return;
        }

        setIsListening(true);
        setVoiceError('');

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            callback(transcript);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            logError(new Error('Speech recognition error: ' + event.error));
            setVoiceError(`Voice recognition error: ${event.error}`);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        try {
            recognition.start();
        } catch (error) {
            logError(error);
            setVoiceError('Could not start voice recognition');
            setIsListening(false);
        }
    };

    const stopVoiceRecognition = () => {
        if (recognition && isListening) {
            recognition.stop();
            setIsListening(false);
        }
    };

    // Reusable Voice Input Button Component
    const VoiceInputButton = ({ onTranscript, style = {}, size = 16, className = "" }) => (
        <button
            onClick={() => {
                if (isListening) {
                    stopVoiceRecognition();
                } else {
                    startVoiceRecognition(onTranscript);
                }
            }}
            className={`voice-input-btn ${className}`}
            style={{
                background: isListening ? '#ef4444' : 'transparent',
                border: `1px solid ${isListening ? '#ef4444' : '#e2e8f0'}`,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                color: isListening ? 'white' : '#64748b',
                animation: isListening ? 'pulse 1.5s ease-in-out infinite' : 'none',
                ...style
            }}
            title={isListening ? "Stop recording" : "Voice input"}
            disabled={voiceError}
        >
            <Icon name={isListening ? "micOff" : "mic"} size={size} />
        </button>
    );

    // Voice Input Wrapper Component (for chat inputs, forms, etc.)
    const VoiceInputWrapper = ({ children, onTranscript, position = "right" }) => (
        <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
            {children}
            <VoiceInputButton
                onTranscript={onTranscript}
                style={{
                    position: 'absolute',
                    [position]: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '32px',
                    height: '32px',
                    zIndex: 10
                }}
                size={14}
            />
        </div>
    );

    // Example usage for chat input:
    // <VoiceInputWrapper onTranscript={(text) => setMessage(text)}>
    //     <input 
    //         value={message} 
    //         onChange={(e) => setMessage(e.target.value)}
    //         placeholder="Type your message..."
    //         style={{ paddingRight: '50px' }}
    //     />
    // </VoiceInputWrapper>
    //
    // Example usage for image prompt:
    // <VoiceInputWrapper onTranscript={(text) => setImagePrompt(text)}>
    //     <textarea
    //         value={imagePrompt}
    //         onChange={(e) => setImagePrompt(e.target.value)}
    //         placeholder="Describe the image you want to generate..."
    //         style={{ paddingRight: '50px' }}
    //     />
    // </VoiceInputWrapper>

    // Voice Error Display Component
    const VoiceErrorDisplay = () => {
        if (!voiceError) return null;
        
        return (
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                zIndex: 9999,
                maxWidth: '300px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon name="alertTriangle" size={16} />
                    <span>{voiceError}</span>
                    <button 
                        onClick={() => setVoiceError('')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            marginLeft: 'auto'
                        }}
                    >
                        <Icon name="x" size={14} />
                    </button>
                </div>
            </div>
        );
    };

    useEffect(() => {
        // Initialize app (authentication bypassed for production)
        loadModels();
        loadSampleAssistants();
        scrollToBottom();
        
        // Generate session token if not exists
        const existingToken = localStorage.getItem('jaydus_token');
        if (!existingToken) {
            const sessionToken = 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('jaydus_token', sessionToken);
        }
    }, []);


    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, currentResponse]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadModels = async () => {
        // Skip loading external models and use local ones for now
        log('Using local models configuration');
        setAvailableModels([
            { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
            { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4' },
            { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4' },
            { id: 'openai/gpt-4o', name: 'GPT-4O' },
            { id: 'google/gemini-pro', name: 'Gemini Pro' }
        ]);
        
    };

    const loadSampleAssistants = () => {
        setAssistants([
            {
                id: 1,
                name: 'Code Reviewer',
                description: 'Expert at reviewing and improving code quality',
                prompt: 'You are an expert code reviewer. Analyze code for bugs, performance issues, and best practices.',
                model: 'anthropic/claude-sonnet-4',
                created: '2025-08-07'
            },
            {
                id: 2,
                name: 'Marketing Assistant',
                description: 'Creative marketing content and strategy expert',
                prompt: 'You are a marketing expert specializing in creative content and growth strategies.',
                model: 'openai/gpt-4o',
                created: '2025-08-06'
            },
            {
                id: 3,
                name: 'Data Analyst',
                description: 'Analytical expert for data insights and visualization',
                prompt: 'You are a data analyst expert. Help analyze data, create insights, and suggest visualizations.',
                model: 'anthropic/claude-3.5-sonnet',
                created: '2025-08-05'
            }
        ]);
    };

    const sendMessage = async (userMessage) => {
        log('sendMessage called with:', userMessage);
        const modelId = models[selectedModel]?.actual || 'anthropic/claude-3.5-sonnet';
        log('Using model:', modelId);
        
        try {
            setIsStreaming(true);
            setCurrentResponse('');

            // Production API call
            try {
                log('API call to:', `${API_BASE}/api/chat`);
                const headers = { 'Content-Type': 'application/json' };
                const token = localStorage.getItem('jaydus_token');
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
                
                const response = await fetch(`${API_BASE}/api/chat`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        messages: [
                            ...chatHistory.map(msg => ({ role: msg.role, content: msg.content })),
                            { role: 'user', content: userMessage }
                        ],
                        model: modelId,
                        stream: false,
                        conversationId: currentConversationId
                    })
                });

                log('API Response status:', response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    log('API Response data:', data);
                    
                    if (data.choices && data.choices[0]) {
                        const assistantMessage = data.choices[0].message.content;
                        
                        for (let i = 0; i < assistantMessage.length; i++) {
                            await new Promise(resolve => setTimeout(resolve, 7));
                            setCurrentResponse(prev => prev + assistantMessage[i]);
                        }
                        
                        setIsStreaming(false);
                        setChatHistory(prev => [...prev, 
                            { role: 'user', content: userMessage },
                            { role: 'assistant', content: assistantMessage, model: modelId }
                        ]);
                        setCurrentResponse('');
                        
                        // Save conversation to database
                        await saveConversationToDB([
                            ...chatHistory,
                            { role: 'user', content: userMessage },
                            { role: 'assistant', content: assistantMessage, model: modelId }
                        ]);
                        return;
                    }
                } else {
                    const errorText = await response.text();
                    logError(new Error(`API Error: ${response.status} ${errorText}`));
                }
            } catch (apiError) {
                logError(apiError);
            }

            // If API fails, show error message
            const errorMessage = `I apologize, but I'm currently unable to process your request due to a temporary service issue. Please try again in a moment.`;
            
            // Show error message with typing effect
            for (let i = 0; i < errorMessage.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 8));
                setCurrentResponse(prev => prev + errorMessage[i]);
            }
            
            setIsStreaming(false);
            setChatHistory(prev => [...prev, 
                { role: 'user', content: userMessage },
                { role: 'assistant', content: errorMessage, model: modelId }
            ]);
            setCurrentResponse('');
            
            // Save conversation to database
            await saveConversationToDB([
                ...chatHistory,
                { role: 'user', content: userMessage },
                { role: 'assistant', content: errorMessage, model: modelId }
            ]);
        } catch (error) {
            logError(error);
            setIsStreaming(false);
            setCurrentResponse('');
            setChatHistory(prev => [...prev, 
                { role: 'user', content: userMessage },
                { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
            ]);
        }
    };

    const handleSend = async () => {
        if (!message.trim() || isStreaming) return;
        const userMessage = message;
        setMessage('');
        setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
        await sendMessage(userMessage);
    };

    const generateImage = async () => {
        if (!imagePrompt.trim() || isGeneratingImage) return;
        
        setIsGeneratingImage(true);
        setImageError('');
        setGeneratedImage(null);

        try {
            const response = await fetch(`${API_BASE}/api/images`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: imagePrompt,
                    aspectRatio: '16:9',
                    model: selectedImageModel
                })
            });

            const data = await response.json();
            
            let imageUrl = null;
            if (data.data && data.data[0] && data.data[0].url) {
                imageUrl = data.data[0].url;
            } else if (data.url) {
                imageUrl = data.url;
            } else {
                throw new Error('No image URL received from API');
            }
            
            setGeneratedImage(imageUrl);
            
            // Save to image history
            const modelNames = {
                'photon-flash': 'Photon Flash',
                'photon-2': 'Photon-2',
                'flux-1-kontext-pro': 'Flux-1 Kontext Pro',
                'seedream-3-0': 'SeeDream 3.0'
            };
            const newImage = {
                id: Date.now(),
                url: imageUrl,
                prompt: imagePrompt,
                timestamp: new Date().toISOString(),
                model: modelNames[selectedImageModel] || 'Unknown'
            };
            setImageHistory(prev => [newImage, ...prev].slice(0, 20)); // Keep last 20 images
        } catch (error) {
            logError(error);
            setImageError('Failed to generate image. Please try again.');
            setGeneratedImage(null);
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const generateVoice = async () => {
        if (!voiceText.trim() || isGeneratingVoice) return;
        
        setIsGeneratingVoice(true);
        try {
            const response = await fetch(`${API_BASE}/api/voice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'text-to-speech',
                    text: voiceText,
                    voice: selectedVoice
                })
            });

            if (response.ok) {
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                setGeneratedAudio(audioUrl);
            } else {
                throw new Error('No audio data received from API');
            }
        } catch (error) {
            logError(error);
        } finally {
            setIsGeneratingVoice(false);
        }
    };

    const createAssistant = () => {
        if (!newAssistant.name.trim()) return;
        
        const assistant = {
            id: Date.now(),
            ...newAssistant,
            model: models[selectedModel]?.actual || 'anthropic/claude-3.5-sonnet',
            created: new Date().toISOString().split('T')[0]
        };
        
        setAssistants(prev => [assistant, ...prev]);
        setNewAssistant({ name: '', description: '', prompt: '' });
        setIsCreatingAssistant(false);
    };

    const inviteTeamMember = () => {
        if (!inviteEmail.trim()) return;
        
        const member = {
            id: Date.now(),
            name: inviteEmail.split('@')[0],
            email: inviteEmail,
            role: inviteRole,
            status: 'invited',
            joinDate: new Date().toISOString().split('T')[0]
        };
        
        setTeamMembers(prev => [...prev, member]);
        setInviteEmail('');
    };

    const performSearch = async () => {
        if (!searchQuery.trim() || isSearching) return;
        
        setIsSearching(true);
        
        try {
            const token = localStorage.getItem('jaydus_token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${API_BASE}/api/search`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ query: searchQuery })
            });
            
            const data = await response.json();
            
            if (data.synthesizedResponse) {
                // Store the complete search response with synthesis and sources
                setSearchResults({
                    query: data.query,
                    synthesizedResponse: data.synthesizedResponse,
                    sources: data.sources || [],
                    relatedQuestions: data.relatedQuestions || [],
                    searchPerformed: data.searchPerformed
                });
            } else {
                // Fallback to demo data if API fails
                setSearchResults({
                    query: searchQuery,
                    synthesizedResponse: `**Direct Answer**: Based on available information, here's what we know about "${searchQuery}".\n\n**Detailed Explanation**: This appears to be a query requiring real-time search capabilities. The AI search system is designed to provide comprehensive, well-researched answers by searching the web and synthesizing information from multiple sources.\n\n**Additional Context**: For the most accurate and up-to-date information, please ensure you have an active internet connection and try your search again.`,
                    sources: [
                        {
                            index: 1,
                            title: `AI Development Best Practices for "${searchQuery}"`,
                            url: "https://example.com/ai-best-practices",
                            domain: "example.com",
                            snippet: `Comprehensive guide to implementing AI solutions related to ${searchQuery}. Learn about modern frameworks, optimization techniques, and industry standards.`
                        }
                    ],
                    relatedQuestions: [
                        `What are the latest trends in ${searchQuery}?`,
                        `How to implement ${searchQuery} effectively?`,
                        `What are the best practices for ${searchQuery}?`
                    ]
                });
            }
        } catch (error) {
            logError(error);
            // Fallback to demo data
            setSearchResults({
                query: searchQuery,
                synthesizedResponse: `**Search Error**: Unable to perform search at this time.\n\n**Status**: The search service is temporarily unavailable or experiencing issues.\n\n**Suggested Actions**:\n- Check your internet connection\n- Try rephrasing your search query\n- Wait a few moments and try again\n\n**Note**: This is a demo response while the search service is being restored.`,
                sources: [
                    {
                        index: 1,
                        title: `AI Development Best Practices for "${searchQuery}"`,
                        url: "https://example.com/ai-best-practices",
                        domain: "example.com",
                        snippet: `Comprehensive guide to implementing AI solutions related to ${searchQuery}. Demo content while search is unavailable.`
                    }
                ],
                relatedQuestions: [
                    `What are the latest trends in ${searchQuery}?`,
                    `How to implement ${searchQuery} effectively?`,
                    `What are the best practices for ${searchQuery}?`
                ]
            });
        } finally {
            setIsSearching(false);
        }
    };


    // Authentication functions
    const handleAuth = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError('');
        setResetSuccess('');
        
        let endpoint, body;
        if (authMode === 'register') {
            endpoint = '/api/auth/register';
            body = { email, password, fullName };
        } else if (authMode === 'reset') {
            endpoint = '/api/auth/reset-password';
            body = { email };
        } else {
            endpoint = '/api/auth/login';
            body = { email, password };
        }
        
        try {
            log('Attempting auth:', authMode, 'to endpoint:', `${API_BASE}${endpoint}`);
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                body: JSON.stringify(body)
            });
            
            log('Auth response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Network error' }));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            log('Auth successful:', data);
            
            if (authMode === 'reset') {
                setResetSuccess('Password reset email sent! Check your inbox for further instructions.');
                setEmail('');
            } else {
                setUser(data.user);
                setIsAuthenticated(true);
                setShowAuthForm(false);
                localStorage.setItem('jaydus_token', data.token);
            }
        } catch (error) {
            logError(error);
            setAuthError(error.message || 'Network error. Please try again.');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setShowAuthForm(true);
        setConversations([]);
        setCurrentConversationId(null);
        setChatHistory([]);
        localStorage.removeItem('jaydus_token');
    };

    // Conversation Management Functions
    const loadConversations = async () => {
        const token = localStorage.getItem('jaydus_token');
        if (!token) return;
        
        setLoadingConversations(true);
        try {
            const response = await fetch(`${API_BASE}/api/conversations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setConversations(data.conversations || []);
            }
        } catch (error) {
            logError(error);
        } finally {
            setLoadingConversations(false);
        }
    };

    const loadConversation = async (conversationId) => {
        const token = localStorage.getItem('jaydus_token');
        if (!token) return;
        
        try {
            const response = await fetch(`${API_BASE}/api/conversations/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setCurrentConversationId(conversationId);
                setChatHistory(data.messages || []);
                setSelectedModel(data.conversation?.model || 'fast');
                setShowConversationHistory(false); // Close the history sidebar
            }
        } catch (error) {
            logError(error);
        }
    };

    const startNewConversation = async () => {
        const token = localStorage.getItem('jaydus_token');
        if (!token) {
            // For anonymous users, just clear the current chat
            setChatHistory([]);
            setCurrentConversationId(null);
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE}/api/conversations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: 'New Conversation',
                    model: models[selectedModel]?.actual || 'anthropic/claude-3.5-sonnet'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                setCurrentConversationId(data.conversationId);
                setChatHistory([]);
                await loadConversations(); // Refresh the list
            }
        } catch (error) {
            logError(error);
            // Fallback to local mode
            setChatHistory([]);
            setCurrentConversationId(null);
        }
    };

    const deleteConversation = async (conversationId) => {
        const token = localStorage.getItem('jaydus_token');
        if (!token) return;
        
        if (!confirm('Are you sure you want to delete this conversation?')) return;
        
        try {
            const response = await fetch(`${API_BASE}/api/conversations/${conversationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                // Remove from local state
                setConversations(prev => prev.filter(c => c.id !== conversationId));
                
                // If this is the current conversation, clear it
                if (currentConversationId === conversationId) {
                    setChatHistory([]);
                    setCurrentConversationId(null);
                }
            }
        } catch (error) {
            logError(error);
        }
    };

    const saveConversationToDB = async (messages) => {
        const token = localStorage.getItem('jaydus_token');
        if (!token || !isAuthenticated) return; // Skip saving if not authenticated
        
        try {
            // If no current conversation, create one
            if (!currentConversationId) {
                const newConvResponse = await fetch(`${API_BASE}/api/conversations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title: messages.find(m => m.role === 'user')?.content?.slice(0, 50) || 'New Conversation',
                        model: models[selectedModel]?.actual || 'anthropic/claude-3.5-sonnet'
                    })
                });
                
                if (newConvResponse.ok) {
                    const newConvData = await newConvResponse.json();
                    setCurrentConversationId(newConvData.conversationId);
                } else {
                    return; // Failed to create conversation, skip saving
                }
            }
            
            // Save messages to the conversation
            const response = await fetch(`${API_BASE}/api/conversations/${currentConversationId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    messages: messages
                })
            });
            
            if (response.ok) {
                await loadConversations(); // Refresh conversations list
            }
        } catch (error) {
            logError(error);
        }
    };

    // Load conversations when user logs in
    useEffect(() => {
        if (isAuthenticated) {
            loadConversations();
        }
    }, [isAuthenticated]);

    const sidebarItems = [
        { id: 'dashboard', icon: 'barChart3', label: 'Dashboard' },
        { id: 'chat', icon: 'messageCircle', label: 'AI Chat' },
        { id: 'search', icon: 'search', label: 'AI Search' },
        { id: 'assistants', icon: 'bot', label: 'Custom Assistants' },
        { id: 'image', icon: 'image', label: 'Image Creator' },
        { id: 'voice', icon: 'mic', label: 'Voice Creator' },
    ];

    const bottomItems = [
        { id: 'integrations', icon: 'zap', label: 'Integrations' },
        { id: 'settings', icon: 'settings', label: 'Settings' },
        { id: 'help', icon: 'helpCircle', label: 'Help Center' },
        { id: 'team', icon: 'users', label: 'Teams' },
        { id: 'billing', icon: 'creditCard', label: 'Billing' },
    ];

    // Search suggestions for getting started
    const searchSuggestions = [
        "What are the latest AI developments in 2025?",
        "How does quantum computing work?", 
        "Best practices for web development",
        "Climate change solutions and innovations",
        "Latest trends in cryptocurrency",
        "How to build a successful startup"
    ];

    // Search functions
    const handleSearchSubmit = async (query) => {
        if (!query.trim() || isSearching) return;
        
        setIsSearching(true);
        setSearchResults([]);
        
        try {
            const response = await fetch(`${API_BASE}/api/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: query.trim() })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Search failed');
            }
            
            setSearchResults([data]);
        } catch (error) {
            logError(error);
            setSearchResults([{
                query: query.trim(),
                synthesizedResponse: `**Error**: ${error.message}\n\nPlease try again or check if the search service is properly configured.`,
                sources: [],
                relatedQuestions: []
            }]);
        } finally {
            setIsSearching(false);
        }
    };

    // Perplexity-style search interface
    const renderAISearch = () => (
        <div className="search-page">
            {/* Header */}
            <div className="search-header">
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '24px 32px',
                    textAlign: 'center'
                }}>
                    <h1 className="search-title" style={{ marginBottom: '8px' }}>
                        AI Web Search
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>
                        Search the web with AI-powered comprehensive answers
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="search-content">
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
                    
                    {/* Center Search Bar (Perplexity style) */}
                    {searchResults.length === 0 && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '40vh',
                            textAlign: 'center'
                        }}>
                            {/* Search Input */}
                            <div className="search-input-wrapper" style={{
                                position: 'relative',
                                width: '100%',
                                maxWidth: '600px',
                                marginBottom: '32px'
                            }}>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit(searchQuery)}
                                    placeholder="Ask anything..."
                                    className="search-input"
                                    style={{
                                        width: '100%',
                                        padding: '16px 60px 16px 20px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        background: 'white',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    disabled={isSearching}
                                />
                                
                                {/* Voice Input Button */}
                                <VoiceInputButton
                                    onTranscript={(transcript) => {
                                        setSearchQuery(transcript);
                                        handleSearchSubmit(transcript);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        right: '50px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '36px',
                                        height: '36px'
                                    }}
                                    size={16}
                                    className="search-voice-btn"
                                />
                                
                                {/* Search Button */}
                                <button
                                    onClick={() => handleSearchSubmit(searchQuery)}
                                    disabled={isSearching || !searchQuery.trim()}
                                    className="search-btn"
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '36px',
                                        height: '36px',
                                        background: searchQuery.trim() ? 'linear-gradient(135deg, #10b981, #059669)' : '#e2e8f0',
                                        color: searchQuery.trim() ? 'white' : '#64748b',
                                        border: 'none',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: searchQuery.trim() ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {isSearching ? (
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            border: '2px solid transparent',
                                            borderTop: '2px solid currentColor',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                    ) : (
                                        <Icon name="search" size={16} />
                                    )}
                                </button>
                            </div>

                            {/* Search Suggestions */}
                            <div style={{ width: '100%', maxWidth: '600px' }}>
                                <p style={{ 
                                    color: '#64748b', 
                                    fontSize: '14px', 
                                    fontWeight: '500',
                                    marginBottom: '12px'
                                }}>
                                    Try asking about:
                                </p>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                    gap: '8px'
                                }}>
                                    {searchSuggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setSearchQuery(suggestion);
                                                handleSearchSubmit(suggestion);
                                            }}
                                            className="search-suggestion"
                                            style={{
                                                padding: '12px 16px',
                                                background: 'white',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                fontSize: '14px',
                                                color: '#374151',
                                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                            }}
                                            onMouseOver={(e) => {
                                                e.target.style.borderColor = '#10b981';
                                                e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.target.style.borderColor = '#e2e8f0';
                                                e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                                            }}
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="search-results">
                            {searchResults.map((result, index) => (
                                <div key={index}>
                                    {/* Query Display */}
                                    <div className="search-summary">
                                        <div className="search-query">
                                            <Icon name="search" size={18} />
                                            <span>{result.query}</span>
                                        </div>
                                        
                                        {/* Answer */}
                                        <div 
                                            className="search-response"
                                            dangerouslySetInnerHTML={{ 
                                                __html: result.synthesizedResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                                            }} 
                                        />
                                    </div>

                                    {/* Sources */}
                                    {result.sources && result.sources.length > 0 && (
                                        <div className="search-sources">
                                            <div className="sources-title">
                                                <Icon name="link" size={16} />
                                                Sources
                                            </div>
                                            <div className="sources-list">
                                                {result.sources.map((source, sourceIndex) => (
                                                    <div key={sourceIndex} className="source-item">
                                                        <Icon name="externalLink" size={14} />
                                                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="source-link">
                                                            {source.title}
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Related Questions */}
                                    {result.relatedQuestions && result.relatedQuestions.length > 0 && (
                                        <div className="related-questions">
                                            <div className="related-title">
                                                <Icon name="helpCircle" size={16} />
                                                Related Questions
                                            </div>
                                            <div className="related-list">
                                                {result.relatedQuestions.map((question, qIndex) => (
                                                    <button
                                                        key={qIndex}
                                                        onClick={() => {
                                                            setSearchQuery(question);
                                                            handleSearchSubmit(question);
                                                        }}
                                                        className="related-question"
                                                    >
                                                        <Icon name="chevronRight" size={14} />
                                                        {question}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* New Search */}
                            <div style={{
                                marginTop: '32px',
                                padding: '24px',
                                background: '#f8fafc',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <div className="search-input-wrapper" style={{
                                    position: 'relative',
                                    maxWidth: '500px',
                                    margin: '0 auto'
                                }}>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit(searchQuery)}
                                        placeholder="Ask a follow-up question..."
                                        className="search-input"
                                        style={{
                                            width: '100%',
                                            padding: '12px 50px 12px 16px',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            background: 'white'
                                        }}
                                        disabled={isSearching}
                                    />
                                    <button
                                        onClick={() => handleSearchSubmit(searchQuery)}
                                        disabled={isSearching || !searchQuery.trim()}
                                        className="search-btn"
                                        style={{
                                            position: 'absolute',
                                            right: '4px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: '32px',
                                            height: '32px',
                                            background: searchQuery.trim() ? 'linear-gradient(135deg, #10b981, #059669)' : '#e2e8f0',
                                            color: searchQuery.trim() ? 'white' : '#64748b',
                                            border: 'none',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: searchQuery.trim() ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        {isSearching ? (
                                            <div style={{
                                                width: '14px',
                                                height: '14px',
                                                border: '2px solid transparent',
                                                borderTop: '2px solid currentColor',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }} />
                                        ) : (
                                            <Icon name="search" size={14} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Dashboard Component
    const renderDashboard = () => (
        <div className="dashboard-container" style={{padding: '24px'}}>
            <h1 style={{fontSize: '28px', fontWeight: '600', marginBottom: '24px'}}>Welcome to Jaydus AI</h1>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px'}}>
                <div className="dashboard-card" style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
                        <Icon name="messageCircle" size={24} />
                        <h3 style={{marginLeft: '12px', fontSize: '18px', fontWeight: '600'}}>AI Chat</h3>
                    </div>
                    <p style={{color: '#64748b', marginBottom: '16px'}}>Chat with GPT-4o for instant assistance</p>
                    <button onClick={() => setActiveTab('chat')} className="btn-primary" style={{width: '100%'}}>
                        Start Chatting
                    </button>
                </div>
                
                <div className="dashboard-card" style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
                        <Icon name="search" size={24} />
                        <h3 style={{marginLeft: '12px', fontSize: '18px', fontWeight: '600'}}>AI Search</h3>
                    </div>
                    <p style={{color: '#64748b', marginBottom: '16px'}}>Search the web with AI-powered insights</p>
                    <button onClick={() => setActiveTab('search')} className="btn-primary" style={{width: '100%'}}>
                        Start Searching
                    </button>
                </div>
                
                <div className="dashboard-card" style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
                        <Icon name="image" size={24} />
                        <h3 style={{marginLeft: '12px', fontSize: '18px', fontWeight: '600'}}>Image Generation</h3>
                    </div>
                    <p style={{color: '#64748b', marginBottom: '16px'}}>Create stunning images with AI</p>
                    <button onClick={() => setActiveTab('image')} className="btn-primary" style={{width: '100%'}}>
                        Create Images
                    </button>
                </div>
            </div>
            
            <div style={{background: '#f8fafc', padding: '20px', borderRadius: '12px'}}>
                <h2 style={{fontSize: '20px', fontWeight: '600', marginBottom: '12px'}}>Quick Stats</h2>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px'}}>
                    <div>
                        <p style={{color: '#64748b', fontSize: '14px'}}>Total Chats</p>
                        <p style={{fontSize: '24px', fontWeight: '600'}}>{chatHistory.length}</p>
                    </div>
                    <div>
                        <p style={{color: '#64748b', fontSize: '14px'}}>Images Created</p>
                        <p style={{fontSize: '24px', fontWeight: '600'}}>{imageHistory.length}</p>
                    </div>
                    <div>
                        <p style={{color: '#64748b', fontSize: '14px'}}>Active Model</p>
                        <p style={{fontSize: '24px', fontWeight: '600'}}>GPT-4o</p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Chat Component
    const renderChat = () => (
        <div className="chat-container">
            <div className="chat-messages">
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                        <Icon name={msg.role === 'user' ? 'user' : 'bot'} size={20} />
                        <div className="message-content">{msg.content}</div>
                    </div>
                ))}
                {isStreaming && currentResponse && (
                    <div className="message assistant">
                        <Icon name="bot" size={20} />
                        <div className="message-content">{currentResponse}</div>
                    </div>
                )}
            </div>
            <div className="chat-input-container">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="chat-input"
                />
                <button onClick={handleSend} className="btn-primary">
                    <Icon name="send" size={16} />
                </button>
            </div>
        </div>
    );

    // Custom Assistants Component
    const renderCustomAssistants = () => (
        <div style={{padding: '24px'}}>
            <h2 style={{fontSize: '24px', fontWeight: '600', marginBottom: '20px'}}>AI Assistants</h2>
            <div className="assistants-grid">
                {assistants.map(assistant => (
                    <div key={assistant.id} className="assistant-card" style={{
                        background: 'white', padding: '20px', borderRadius: '12px', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer'
                    }}>
                        <div style={{fontSize: '32px', marginBottom: '12px'}}>{assistant.icon}</div>
                        <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px'}}>{assistant.name}</h3>
                        <p style={{color: '#64748b', fontSize: '14px'}}>{assistant.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    // Image Generator Component
    const renderImageGenerator = () => (
        <div style={{padding: '24px'}}>
            <h2 style={{fontSize: '24px', fontWeight: '600', marginBottom: '20px'}}>AI Image Generator</h2>
            <div className="image-generator">
                <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe the image you want to create..."
                    style={{width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                />
                <button onClick={generateImage} disabled={isGeneratingImage} className="btn-primary" style={{marginTop: '12px'}}>
                    {isGeneratingImage ? 'Generating...' : 'Generate Image'}
                </button>
                
                {generatedImage && (
                    <div style={{marginTop: '24px'}}>
                        <img src={generatedImage} alt="Generated" style={{maxWidth: '100%', borderRadius: '8px'}} />
                    </div>
                )}
                
                {imageHistory.length > 0 && (
                    <div style={{marginTop: '32px'}}>
                        <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '16px'}}>Recent Images</h3>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px'}}>
                            {imageHistory.slice(0, 6).map(img => (
                                <img key={img.id} src={img.url} alt={img.prompt} style={{width: '100%', borderRadius: '8px'}} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // Voice Creator Component
    const renderVoiceCreator = () => (
        <div style={{padding: '24px'}}>
            <h2 style={{fontSize: '24px', fontWeight: '600', marginBottom: '20px'}}>AI Voice Synthesis</h2>
            <div className="voice-creator">
                <textarea
                    value={voiceText}
                    onChange={(e) => setVoiceText(e.target.value)}
                    placeholder="Enter text to convert to speech..."
                    style={{width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                />
                <button onClick={generateVoice} disabled={isGeneratingVoice} className="btn-primary" style={{marginTop: '12px'}}>
                    {isGeneratingVoice ? 'Generating...' : 'Generate Voice'}
                </button>
                
                {generatedAudio && (
                    <div style={{marginTop: '24px'}}>
                        <audio controls src={generatedAudio} style={{width: '100%'}} />
                    </div>
                )}
            </div>
        </div>
    );

    // Code Assistant Component
    const renderCodeAssistant = () => (
        <div style={{padding: '24px'}}>
            <h2 style={{fontSize: '24px', fontWeight: '600', marginBottom: '20px'}}>Code Assistant</h2>
            <div className="code-assistant">
                <textarea
                    value={codeQuery}
                    onChange={(e) => setCodeQuery(e.target.value)}
                    placeholder="Describe what code you need help with..."
                    style={{width: '100%', minHeight: '150px', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'monospace'}}
                />
                <button onClick={() => sendMessage(codeQuery)} className="btn-primary" style={{marginTop: '12px'}}>
                    Get Code Help
                </button>
            </div>
        </div>
    );

    // Analytics Component
    const renderAnalytics = () => (
        <div style={{padding: '24px'}}>
            <h2 style={{fontSize: '24px', fontWeight: '600', marginBottom: '20px'}}>Analytics</h2>
            <div className="analytics-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
                <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
                    <h3 style={{fontSize: '16px', color: '#64748b', marginBottom: '8px'}}>Total API Calls</h3>
                    <p style={{fontSize: '32px', fontWeight: '600'}}>{chatHistory.length + imageHistory.length}</p>
                </div>
                <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
                    <h3 style={{fontSize: '16px', color: '#64748b', marginBottom: '8px'}}>Active Sessions</h3>
                    <p style={{fontSize: '32px', fontWeight: '600'}}>1</p>
                </div>
                <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
                    <h3 style={{fontSize: '16px', color: '#64748b', marginBottom: '8px'}}>Response Time</h3>
                    <p style={{fontSize: '32px', fontWeight: '600'}}>~2s</p>
                </div>
            </div>
        </div>
    );

    // Main render content function
    const renderContent = () => {
        try {
            switch (activeTab) {
                case 'dashboard': return renderDashboard();
                case 'chat': return renderChat();
                case 'search': return renderAISearch();
                case 'assistants': return renderCustomAssistants();
                case 'image': return renderImageGenerator();
                case 'voice': return renderVoiceCreator();
                case 'code': return renderCodeAssistant();
                case 'analytics': return renderAnalytics();
                case 'team': 
                    return (
                        <div style={{padding: '24px'}}>
                            <h2 style={{fontSize: '24px', fontWeight: '600'}}>Team Management</h2>
                            <p style={{color: '#64748b', marginTop: '12px'}}>Team features coming soon.</p>
                        </div>
                    );
                case 'settings':
                    return (
                        <div style={{padding: '24px'}}>
                            <h2 style={{fontSize: '24px', fontWeight: '600'}}>Settings</h2>
                            <p style={{color: '#64748b', marginTop: '12px'}}>Settings configuration coming soon.</p>
                        </div>
                    );
                case 'billing':
                    return (
                        <div style={{padding: '24px'}}>
                            <h2 style={{fontSize: '24px', fontWeight: '600'}}>Billing</h2>
                            <p style={{color: '#64748b', marginTop: '12px'}}>Billing management coming soon.</p>
                        </div>
                    );
                case 'integrations':
                    return (
                        <div style={{padding: '24px'}}>
                            <h2 style={{fontSize: '24px', fontWeight: '600'}}>Integrations</h2>
                            <p style={{color: '#64748b', marginTop: '12px'}}>Third-party integrations coming soon.</p>
                        </div>
                    );
                case 'help':
                    return (
                        <div style={{padding: '24px'}}>
                            <h2 style={{fontSize: '24px', fontWeight: '600'}}>Help & Support</h2>
                            <p style={{color: '#64748b', marginTop: '12px'}}>Need help? Contact support@jaydus.ai</p>
                        </div>
                    );
                default: return renderDashboard();
            }
        } catch (error) {
            logError(error);
            return (
                <div style={{padding: '24px', color: 'red'}}>
                    <h2>Error Loading Content</h2>
                    <p>There was an error loading this page. Please refresh and try again.</p>
                    <p style={{fontSize: '12px', marginTop: '10px'}}>{error.message}</p>
                </div>
            );
        }
    };

    // Main App Return Statement
    if (showAuthForm || !isAuthenticated) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div style={{
                    background: 'white', padding: '40px', borderRadius: '16px', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '400px', maxWidth: '90vw'
                }}>
                    <div style={{textAlign: 'center', marginBottom: '32px'}}>
                        <h1 style={{fontSize: '28px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px'}}>
                            {authMode === 'reset' ? 'Reset Password' : 'Welcome to Jaydus AI'}
                        </h1>
                        <p style={{color: '#64748b', fontSize: '16px'}}>
                            {authMode === 'login' ? 'Sign in to your account' : 
                             authMode === 'register' ? 'Create your account' : 
                             'Enter your email to receive reset instructions'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth}>
                        {authMode === 'register' && (
                            <div style={{marginBottom: '16px'}}>
                                <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', color: '#0f172a'}}>
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="form-input"
                                    required
                                    placeholder="Enter your full name"
                                />
                            </div>
                        )}
                        
                        <div style={{marginBottom: '16px'}}>
                            <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', color: '#0f172a'}}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                                required
                                placeholder="Enter your email"
                            />
                        </div>
                        
                        {authMode !== 'reset' && (
                            <div style={{marginBottom: '24px'}}>
                                <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', color: '#0f172a'}}>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="form-input"
                                    required
                                    placeholder="Enter your password"
                                    minLength="8"
                                />
                            </div>
                        )}
                        
                        {authError && (
                            <div className="error-message" style={{marginBottom: '16px'}}>
                                <Icon name="alertTriangle" size={16} />
                                {authError}
                            </div>
                        )}
                        
                        <button 
                            type="submit"
                            disabled={authLoading}
                            style={{
                                width: '100%', padding: '12px', background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                                color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600',
                                cursor: 'pointer', fontSize: '16px', opacity: authLoading ? 0.7 : 1
                            }}
                        >
                            {authLoading ? 'Please wait...' : 
                             authMode === 'login' ? 'Sign In' : 
                             authMode === 'register' ? 'Create Account' : 
                             'Send Reset Email'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            <VoiceErrorDisplay />
            <div className="sidebar">
                <div className="logo">
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <div className="logo-icon">
                            <Icon name="bot" size={16} style={{color: 'white'}} />
                        </div>
                        <div className="logo-text">jaydus.</div>
                    </div>
                </div>

                <div className="nav">
                    <div className="nav-label">Main</div>
                    {sidebarItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        >
                            <Icon name={item.icon} size={16} />
                            <span>{item.label}</span>
                        </div>
                    ))}

                    <div style={{height: '1px', background: 'rgba(255,255,255,0.1)', margin: '16px 0'}}></div>
                    <div className="nav-label">Tools</div>
                    {bottomItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        >
                            <Icon name={item.icon} size={16} />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>

                <div className="sidebar-footer">
                    <div style={{width: '32px', height: '32px', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600'}}>
                        {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div style={{flex: 1, minWidth: 0}}>
                        <div style={{fontSize: '14px', fontWeight: '600', color: 'white'}}>
                            {user?.fullName || 'User'}
                        </div>
                        <div style={{fontSize: '12px', color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                            {user?.email || 'user@jaydus.ai'}
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                            padding: '8px', borderRadius: '6px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title="Logout"
                    >
                        <Icon name="x" size={14} />
                    </button>
                </div>
            </div>

            <div className="main">
                {renderContent()}
            </div>
        </div>
    );
}

ReactDOM.render(<JaydusAI />, document.getElementById('root'));