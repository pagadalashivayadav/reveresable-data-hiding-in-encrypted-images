import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mode, UserRole, User } from './types';
import { hideData, revealData } from './services/steganographyService';

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm-2 6V6a2 2 0 114 0v2H8z" clipRule="evenodd" />
    </svg>
);

const UnlockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h3 className="text-xl font-semibold text-cyan-400">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close modal">
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};


interface ImageDisplayProps {
    title: string;
    imageSrc: string | null;
    onDownload?: () => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ title, imageSrc, onDownload }) => (
    <div className="bg-slate-800 rounded-lg p-4 flex flex-col items-center justify-start min-h-[200px] md:min-h-[300px] w-full">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2 shrink-0">{title}</h3>
        <div className="w-full h-full flex flex-col items-center justify-center">
            {imageSrc ? (
                <>
                    <div className="flex-grow w-full flex items-center justify-center overflow-hidden">
                       <img src={imageSrc} alt={title} className="max-w-full max-h-full object-contain rounded" />
                    </div>
                    {onDownload && (
                         <button 
                            onClick={onDownload} 
                            className="mt-4 flex items-center justify-center bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-all duration-300"
                            aria-label="Download image"
                         >
                            <DownloadIcon />
                            <span className="ml-2">Download Image</span>
                         </button>
                    )}
                </>
            ) : (
                <div className="text-slate-500 h-full flex items-center justify-center">No image loaded</div>
            )}
        </div>
    </div>
);

const RoleSelectionScreen = ({ onSelectRole }: { onSelectRole: (role: UserRole) => void }) => (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
            <header className="mb-8">
                <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-tight">StegaCrypt</h1>
                <p className="mt-2 text-lg text-slate-400">Reversible Data Hiding in Encrypted Images</p>
            </header>
            <div className="bg-slate-800/50 rounded-lg p-8 shadow-lg border border-slate-700">
                <h2 className="text-2xl font-semibold text-white mb-6">Choose Your Portal</h2>
                <div className="space-y-4">
                    <button
                        onClick={() => onSelectRole('sender')}
                        className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
                    >
                        <LockIcon />
                        <span className="ml-2">Sender Portal</span>
                    </button>
                    <button
                        onClick={() => onSelectRole('receiver')}
                        className="w-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-300"
                    >
                        <UnlockIcon />
                         <span className="ml-2">Receiver Portal</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const AuthScreen = ({ onLogin, onRegister, role, onBack }: {
    onLogin: (username: string, password: string, role: UserRole) => boolean;
    onRegister: (user: User) => boolean;
    role: UserRole;
    onBack: () => void;
}) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (isLoginView) {
            const success = onLogin(username, password, role);
            if (!success) {
                setError(`Invalid credentials or not a valid ${role} account.`);
            }
        } else {
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
            if (!username || !password) {
                setError('Username and password are required.');
                return;
            }
            const success = onRegister({ username, password, role });
            if (success) {
                setSuccess('Registration successful! Please log in.');
                setIsLoginView(true);
                setUsername('');
                setPassword('');
                setConfirmPassword('');
            } else {
                setError('Username already taken.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-tight">StegaCrypt</h1>
                    <p className="mt-2 text-lg text-slate-400">Reversible Data Hiding in Encrypted Images</p>
                </header>
                <div className="bg-slate-800/50 rounded-lg p-8 shadow-lg border border-slate-700 relative">
                    <button onClick={onBack} className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors" aria-label="Go back">
                        <ArrowLeftIcon />
                    </button>
                    <h2 className="text-2xl font-semibold text-center text-white mb-6"><span className="capitalize">{role}</span> {isLoginView ? 'Login' : 'Sign Up'}</h2>
                    {error && <div className="mb-4 text-center bg-red-500/20 text-red-400 p-3 rounded-md">{error}</div>}
                    {success && <div className="mb-4 text-center bg-green-500/20 text-green-400 p-3 rounded-md">{success}</div>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" required />
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" required />
                        {!isLoginView && (
                            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" required />
                        )}
                        <button type="submit" className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300">
                            {isLoginView ? 'Login' : 'Create Account'}
                        </button>
                    </form>
                    <p className="text-center mt-6">
                        {isLoginView ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => { setIsLoginView(!isLoginView); setError(null); setSuccess(null); }} className="font-semibold text-cyan-400 hover:text-cyan-300 ml-2">
                            {isLoginView ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [selectedRoleForAuth, setSelectedRoleForAuth] = useState<UserRole | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [imageKey, setImageKey] = useState<string>('');
    const [messageKey, setMessageKey] = useState<string>('');
    const [secretMessage, setSecretMessage] = useState<string>('');
    const [revealedMessage, setRevealedMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [secretCode, setSecretCode] = useState<string | null>(null);
    const [receivedCode, setReceivedCode] = useState<string>('');
    const [receiverEmail, setReceiverEmail] = useState<string>('');
    const [showShareModal, setShowShareModal] = useState<boolean>(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const storedUsers = localStorage.getItem('stegaCryptUsers');
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        }
    }, []);

    const handleRegister = (user: User): boolean => {
        if (users.some(u => u.username === user.username)) {
            return false;
        }
        const newUsers = [...users, user];
        setUsers(newUsers);
        localStorage.setItem('stegaCryptUsers', JSON.stringify(newUsers));
        return true;
    };

    const handleLogin = (username: string, password: string, role: UserRole): boolean => {
        const user = users.find(u => u.username === username && u.password === password);
        if (user && user.role === role) {
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const resetState = useCallback(() => {
        setOriginalImage(null);
        setProcessedImage(null);
        setRevealedMessage('');
        setError(null);
        setSuccessMessage(null);
        setSecretCode(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            resetState();
            const reader = new FileReader();
            reader.onload = (event) => {
                setOriginalImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const processImage = useCallback(async (action: 'encode' | 'decode') => {
        if (!originalImage) {
            setError('Please upload an image first.');
            return;
        }
        if (!imageKey || !messageKey) {
            setError('Please provide both image and message secret keys.');
            return;
        }
        if (action === 'encode' && !secretMessage) {
            setError('Please provide a secret message to hide.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        setRevealedMessage('');
        setProcessedImage(null);
        setSecretCode(null);

        await new Promise(resolve => setTimeout(resolve, 100)); // allow UI to update

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) {
            setError('Canvas is not supported.');
            setIsLoading(false);
            return;
        }

        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            try {
                if (action === 'encode') {
                    const stegoImageUrl = hideData(ctx, secretMessage, imageKey, messageKey);
                    setProcessedImage(stegoImageUrl);
                    setSuccessMessage('Message successfully hidden and image encrypted.');
                    const packageData = JSON.stringify({ imageKey, messageKey });
                    setSecretCode(btoa(packageData));
                    setShowShareModal(true);
                } else {
                    const { message, recoveredImageUrl } = revealData(ctx, imageKey, messageKey);
                    setRevealedMessage(message);
                    setProcessedImage(recoveredImageUrl);
                    setSuccessMessage('Message successfully revealed and image restored.');
                }
            } catch (e: any) {
                setError(e.message || 'An unknown error occurred during processing.');
            } finally {
                setIsLoading(false);
            }
        };
        img.onerror = () => {
             setError('Failed to load image.');
             setIsLoading(false);
        }
        img.src = originalImage;

    }, [originalImage, imageKey, messageKey, secretMessage]);

    const handleLogout = () => {
        resetState();
        setImageKey('');
        setMessageKey('');
        setSecretMessage('');
        setCurrentUser(null);
        setSelectedRoleForAuth(null);
    };

    const handleDownload = useCallback(() => {
        if (!processedImage) return;
        
        const link = document.createElement('a');
        link.href = processedImage;
        const fileName = currentUser?.role === 'sender' ? 'encrypted-image.png' : 'recovered-image.png';
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [processedImage, currentUser]);

    const handleLoadCode = () => {
        setError(null);
        if (!receivedCode) {
            setError("Secret Code field is empty.");
            return;
        }
        try {
            const decodedPackage = atob(receivedCode);
            const keys = JSON.parse(decodedPackage);
            if (keys.imageKey && keys.messageKey) {
                setImageKey(keys.imageKey);
                setMessageKey(keys.messageKey);
                setSuccessMessage("Keys loaded successfully from code!");
                setReceivedCode('');
            } else {
                setError("Invalid Secret Code format.");
            }
        } catch (e) {
            setError("Failed to decode Secret Code. It may be corrupted or invalid.");
        }
    };

    const handleCopyCode = () => {
        if(secretCode) {
            navigator.clipboard.writeText(secretCode).then(() => {
                setSuccessMessage("Secret Code copied to clipboard!");
            }).catch(() => {
                setError("Failed to copy code.");
            });
        }
    };
    
    const handleSendEmail = () => {
        if (!secretCode) {
            setError("Cannot send email, secret code is missing.");
            return;
        }
        if (!receiverEmail) {
            setError("Please enter the receiver's email address.");
            // We can highlight the input field or show a more specific error in the modal later
            return;
        }

        const subject = "StegaCrypt: Secret Code for Your Image";
        const body = `Hello,\n\nHere is the Secret Code you need to decrypt the image I've sent you:\n\n${secretCode}\n\nInstructions:\n1. Log in to StegaCrypt as a Receiver.\n2. Upload the encrypted image.\n3. Paste this code into the 'Enter Secret Code' box and click 'Load Keys'.\n4. Click 'Decrypt & Reveal'.\n\nRegards,\n${currentUser?.username}`;

        const mailtoLink = `mailto:${receiverEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        window.location.href = mailtoLink;
    };
    
    if (!currentUser) {
        if (!selectedRoleForAuth) {
            return <RoleSelectionScreen onSelectRole={setSelectedRoleForAuth} />;
        }
        return (
            <AuthScreen
                onLogin={handleLogin}
                onRegister={handleRegister}
                role={selectedRoleForAuth}
                onBack={() => setSelectedRoleForAuth(null)}
            />
        );
    }

    const mode = currentUser.role === 'sender' ? Mode.Encode : Mode.Decode;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-4 sm:p-6 lg:p-8">
            <canvas ref={canvasRef} className="hidden"></canvas>

            <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Share Securely">
                <div className="space-y-4">
                    <p className="text-slate-400">Your encrypted image is ready. To share it, follow these steps:</p>
                    
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-lg text-white mb-2">Step 1: Download Image</h4>
                        <p className="text-slate-400 text-sm mb-3">Save the encrypted image file to your device.</p>
                        <button onClick={handleDownload} className="w-full flex items-center justify-center bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-all duration-300">
                             <DownloadIcon />
                            <span className="ml-2">Download Encrypted Image</span>
                        </button>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-lg text-white mb-2">Step 2: Share Secret Code</h4>
                        <p className="text-slate-400 text-sm mb-3">Copy this code and send it to your receiver via a <strong>secure channel</strong>.</p>
                         <textarea readOnly value={secretCode || ''} rows={3} className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 font-mono text-xs cursor-text"/>
                         <button onClick={handleCopyCode} className="w-full mt-2 flex items-center justify-center bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-300">Copy Code</button>
                    </div>

                     <div className="bg-slate-700/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-lg text-white mb-2">Step 3: Send via Email</h4>
                        <p className="text-slate-400 text-sm mb-3">Or, send the code directly using your default email client.</p>
                        <input type="email" placeholder="receiver@example.com" value={receiverEmail} onChange={(e) => setReceiverEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"/>
                        <button onClick={handleSendEmail} className="w-full mt-2 flex items-center justify-center bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-300">
                            <EmailIcon/>
                            <span className="ml-2">Send via Email</span>
                        </button>
                    </div>

                    <button onClick={() => setShowShareModal(false)} className="w-full mt-2 text-slate-300 font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-all duration-300">
                        Close
                    </button>
                </div>
            </Modal>
            
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-tight">StegaCrypt</h1>
                    <p className="mt-2 text-lg text-slate-400">Reversible Data Hiding in Encrypted Images</p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls Column */}
                    <div className="lg:col-span-1 bg-slate-800/50 rounded-lg p-6 shadow-lg border border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-white">
                                <span className="capitalize">{currentUser.username}</span>'s Panel
                            </h2>
                            <button onClick={handleLogout} className="bg-red-500/80 hover:bg-red-500 text-white font-bold py-1 px-3 rounded-md transition-colors text-sm">
                                Logout
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label htmlFor="image-upload" className="block text-sm font-medium text-slate-300 mb-2">1. {mode === Mode.Encode ? 'Upload Original Image' : 'Upload Processed Image'}</label>
                                <input ref={fileInputRef} type="file" id="image-upload" accept="image/png, image/jpeg" onChange={handleFileChange} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"/>
                            </div>
                            
                            {mode === Mode.Decode && (
                                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                                    <label htmlFor="key-package" className="block text-sm font-medium text-slate-300 mb-2">Enter Secret Code</label>
                                    <textarea id="key-package" value={receivedCode} onChange={(e) => setReceivedCode(e.target.value)} rows={3} className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition" placeholder="Paste secret code here..."></textarea>
                                    <button onClick={handleLoadCode} className="w-full mt-2 flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-300">Load Keys</button>
                                </div>
                            )}

                             <div>
                                <label htmlFor="image-key" className="block text-sm font-medium text-slate-300 mb-2">Image Encryption Key</label>
                                <input type="password" id="image-key" value={imageKey} onChange={(e) => setImageKey(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"/>
                            </div>
                            
                            <div>
                                <label htmlFor="message-key" className="block text-sm font-medium text-slate-300 mb-2">Message Encryption Key</label>
                                <input type="password" id="message-key" value={messageKey} onChange={(e) => setMessageKey(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"/>
                            </div>

                            {mode === Mode.Encode && (
                                <div>
                                    <label htmlFor="secret-message" className="block text-sm font-medium text-slate-300 mb-2">Secret Message</label>
                                    <textarea id="secret-message" value={secretMessage} onChange={(e) => setSecretMessage(e.target.value)} rows={4} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" placeholder="Enter the message to hide..."></textarea>
                                </div>
                            )}

                            <button onClick={() => processImage(mode)} disabled={isLoading} className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? <Spinner /> : (mode === Mode.Encode ? <><LockIcon /> Encrypt & Hide</> : <><UnlockIcon /> Decrypt & Reveal</>)}
                            </button>
                        </div>

                         {error && <div className="mt-4 text-center bg-red-500/20 text-red-400 p-3 rounded-md">{error}</div>}
                         {successMessage && <div className="mt-4 text-center bg-green-500/20 text-green-400 p-3 rounded-md">{successMessage}</div>}

                         {mode === Mode.Decode && revealedMessage && (
                            <div className="mt-6 bg-slate-700 p-4 rounded-lg">
                                <h3 className="font-semibold text-cyan-400 mb-2">Revealed Message:</h3>
                                <p className="text-slate-300 break-words font-mono bg-slate-800 p-2 rounded">{revealedMessage}</p>
                            </div>
                        )}
                    </div>

                    {/* Image Displays Column */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                         <ImageDisplay title={mode === Mode.Encode ? 'Original Image' : 'Uploaded Image'} imageSrc={originalImage} />
                         <ImageDisplay 
                            title={mode === Mode.Encode ? 'Encrypted & Stego Image' : 'Recovered Image'} 
                            imageSrc={processedImage} 
                            onDownload={processedImage ? handleDownload : undefined}
                         />
                    </div>
                </main>
            </div>
        </div>
    );
}
