import React, { useState, useEffect } from 'react';
import { CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';

const EmailVerification = () => {
  const [email, setEmail] = useState('utilisateur@exemple.com');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Référence pour les inputs du code
  const inputRefs = Array(6).fill(0).map(() => React.createRef());

  // Effet pour gérer le compte à rebours de renvoi du code
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // Gestion de l'entrée du code de vérification
  const handleCodeChange = (index, value) => {
    // Ne permettre que les chiffres
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Focus automatique sur l'input suivant
    if (value !== '' && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Gestion du backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && index > 0 && verificationCode[index] === '') {
      inputRefs[index - 1].current.focus();
    }
  };

  // Vérification du code
  const handleVerify = () => {
    setIsLoading(true);
    setError('');
    
    // Simuler une vérification (à remplacer par l'appel API réel)
    setTimeout(() => {
      const code = verificationCode.join('');
      // Pour cette démo, nous considérons que "123456" est le code valide
      if (code === "123456") {
        setIsVerified(true);
      } else {
        setError('Code de vérification incorrect. Veuillez réessayer.');
      }
      setIsLoading(false);
    }, 1500);
  };

  // Renvoi du code de vérification
  const handleResendCode = () => {
    setIsLoading(true);
    // Simuler un envoi de code (à remplacer par l'appel API réel)
    setTimeout(() => {
      setCountdown(30);
      setCanResend(false);
      setIsLoading(false);
      // Réinitialiser le code
      setVerificationCode(['', '', '', '', '', '']);
      setError('');
      // Focus sur le premier input
      inputRefs[0].current.focus();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden">
        {/* En-tête */}
        <div className="p-6 text-center relative">
          <button 
            className="absolute left-4 top-4 text-gray-500 hover:text-gray-700"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Vérification d'e-mail</h1>
          <p className="text-gray-600 text-sm">
            {isVerified 
              ? "Votre e-mail a été vérifié avec succès." 
              : `Nous avons envoyé un code de vérification à ${email}`
            }
          </p>
        </div>
        
        {/* Illustration */}
        <div className="flex justify-center py-4">
          <div className="w-60 h-60 flex items-center justify-center">
            <img 
              src="/api/placeholder/240/240" 
              alt="Vérification d'e-mail"
              className="object-contain w-full h-full"
            />
          </div>
        </div>
        
        {!isVerified ? (
          <div className="px-6 pb-6">
            {/* Champs de saisie du code */}
            <div className="mb-6">
              <div className="flex justify-center space-x-2 mb-4">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center border border-gray-300 rounded-lg text-gray-800 text-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                ))}
              </div>
              
              {error && (
                <p className="text-red-500 text-sm text-center mb-4">{error}</p>
              )}
              
              <button
                onClick={handleVerify}
                disabled={isLoading || verificationCode.some(digit => digit === '') || isVerified}
                className={`w-full py-3 rounded-lg font-medium text-white transition-colors duration-300 flex items-center justify-center
                  ${isLoading || verificationCode.some(digit => digit === '') ? 'bg-teal-300' : 'bg-teal-500 hover:bg-teal-600'}`}
              >
                {isLoading ? (
                  <RefreshCw size={20} className="animate-spin" />
                ) : (
                  "Vérifier"
                )}
              </button>
            </div>
            
            {/* Option de renvoi du code */}
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">Vous n'avez pas reçu de code?</p>
              {canResend ? (
                <button
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-teal-500 hover:text-teal-600 font-medium text-sm"
                >
                  Renvoyer le code
                </button>
              ) : (
                <p className="text-gray-400 text-sm">
                  Renvoyer le code ({countdown}s)
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="px-6 pb-6 text-center">
            <div className="mb-6 flex flex-col items-center">
              <div className="bg-green-100 rounded-full p-4 mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <p className="text-gray-700">
                Votre adresse e-mail a été vérifiée avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme.
              </p>
            </div>
            <button
              onClick={() => window.location.href = "/dashboard"}
              className="w-full py-3 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors duration-300"
            >
              Accéder au tableau de bord
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;