import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoanApplication } from '../LoanApplicationContext';
import { useUserId } from '../hooks/useUserId';
import './Details.css';

export default function Details() {
  const navigate = useNavigate();
  const { userId } = useUserId();
  const { personalDetailsData, updatePersonalDetailsData } = useLoanApplication();

  const [formData, setFormData] = useState({
    firstName:   personalDetailsData?.firstName   || '',
    lastName:    personalDetailsData?.lastName    || '',
    email:       personalDetailsData?.email       || '',
    phoneNumber: personalDetailsData?.phoneNumber || ''
  });

  const [phoneError, setPhoneError] = useState('');

  const isValidPhoneNumber = (phone) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) return false;
    if (!digits.startsWith('9')) return false;
    const secondDigit = parseInt(digits[1]);
    if (secondDigit < 1 || secondDigit > 8) return false;
    return true;
  };

  const normalizePhoneNumber = (phone) => phone.replace(/\D/g, '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      const digitsOnly    = value.replace(/\D/g, '');
      const limitedDigits = digitsOnly.slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: limitedDigits }));
      if (phoneError) setPhoneError('');
      if (limitedDigits.length === 10 && !isValidPhoneNumber(limitedDigits)) {
        setPhoneError('ስልክ 9 ይጀምር እና 8 ን ከ ሁለተኛ ሲፈር ይባል (ለምሳሌ 9XX XXX XXX)');
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!isValidPhoneNumber(formData.phoneNumber)) {
      setPhoneError('እባክዎ 9 ሲጀምር ትክክለኛ 10-ሲፈር ስልክ ቁጥር ያስገቡ (ለምሳሌ 9XX XXX XXX)');
      return;
    }
    updatePersonalDetailsData({ ...formData, phoneNumber: normalizePhoneNumber(formData.phoneNumber) });
    navigate(`/${userId}/summary`);
  };

  const handlePrevious = () => {
    let dataToSave = { ...formData };
    if (formData.phoneNumber && isValidPhoneNumber(formData.phoneNumber)) {
      dataToSave.phoneNumber = normalizePhoneNumber(formData.phoneNumber);
    }
    updatePersonalDetailsData(dataToSave);
    navigate(-1);
  };

  const handleBack = () => navigate(`/${userId}`);

  return (
    <div className="app-container">
      <header className="header">
        <button className="back-btn" onClick={handleBack}>← ተመልሸ</button>
        <div className="logo">
          <div className="logo-circle">
            <img src="/vite.svg" alt="Birr" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span className="logo-birr">Birr</span>
        </div>
        <button className="menu-btn" aria-label="Menu">
          <div className="menu-line"></div>
          <div className="menu-line"></div>
          <div className="menu-line"></div>
        </button>
      </header>

      <main className="main-content">
        <div className="container">
          <h1 className="form-title">የብድር ማመልከቻ</h1>
          <p className="form-subtitle">ደረጃ 2 ከ 3</p>
          <div className="progress-indicator">
            <div className="progress-dot active"></div>
            <div className="progress-dot active"></div>
            <div className="progress-dot"></div>
          </div>

          <form onSubmit={handleNext}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">የመጀመሪያ ስም</label>
                <input type="text" name="firstName" value={formData.firstName}
                  onChange={handleChange} placeholder="አበበ" className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">የመጨረሻ ስም</label>
                <input type="text" name="lastName" value={formData.lastName}
                  onChange={handleChange} placeholder="ከበደ" className="form-input" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ኢሜይል አድራሻ</label>
              <input type="email" name="email" value={formData.email}
                onChange={handleChange} placeholder="abebe.kebede@example.com" className="form-input" required />
            </div>

            <div className="form-group">
              <label className="form-label">ሞባይል ስልክ</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px',
                  backgroundColor: '#f5f5f5', border: '2px solid #e0e0e0', borderRadius: '8px',
                  fontWeight: '600', color: '#40A152' }}>
                  +251
                </div>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber}
                  placeholder="9XX XXX XXX" onChange={handleChange}
                  className={`form-input ${phoneError ? 'error-input' : ''}`}
                  style={{ flex: 1, borderColor: phoneError ? '#dc3545' : '#e0e0e0' }}
                  maxLength="10" required />
              </div>
              {phoneError
                ? <small className="error-message">{phoneError}</small>
                : <small style={{ display: 'block', marginTop: '4px', color: '#666', fontSize: '12px' }}>
                    9 ሲጀምር 10 ሲፈር (ለምሳሌ 9XX XXX XXX)
                  </small>
              }
            </div>

            <div className="button-container">
              <button type="button" className="previous-btn" onClick={handlePrevious}>ቀዳሚ</button>
              <button type="submit" className="next-btn">ቀጣይ ደረጃ</button>
            </div>
          </form>
        </div>
      </main>

      <footer className="footer">© 2026 Birr ኢትዮጵያ</footer>
    </div>
  );
}
