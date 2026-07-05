import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoanApplication } from '../LoanApplicationContext';
import './Details.css';

export default function Details() {
  const navigate = useNavigate();
  
  // Get context data and functions
  const { personalDetailsData, updatePersonalDetailsData } = useLoanApplication();
  
  // Form state for Step 2 - initialize with context data
  const [formData, setFormData] = useState({
    firstName: personalDetailsData?.firstName || '',
    lastName: personalDetailsData?.lastName || '',
    email: personalDetailsData?.email || '',
    phoneNumber: personalDetailsData?.phoneNumber || ''
  });

  // State for phone validation error
  const [phoneError, setPhoneError] = useState('');

  // Validate Ethiopian phone number format
  // Ethiopian mobile: 10 digits starting with 9, second digit 1-8
  const isValidPhoneNumber = (phone) => {
    const digits = phone.replace(/\D/g, '');
    
    // Must be exactly 10 digits
    if (digits.length !== 10) return false;
    
    // Must start with 9
    if (!digits.startsWith('9')) return false;
    
    // Second digit must be 1-8 (for mobile numbers)
    const secondDigit = parseInt(digits[1]);
    if (secondDigit < 1 || secondDigit > 8) return false;
    
    return true;
  };

  // Normalize phone number (already in 10-digit format)
  const normalizePhoneNumber = (phone) => {
    const digits = phone.replace(/\D/g, '');
    return digits;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phoneNumber') {
      // Remove any non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      // Limit to 10 digits
      const limitedDigits = digitsOnly.slice(0, 10);
      
      setFormData(prev => ({
        ...prev,
        [name]: limitedDigits
      }));
      
      // Clear error when user starts typing
      if (phoneError) {
        setPhoneError('');
      }
      
      // Validate if user has entered enough digits
      if (limitedDigits.length === 10) {
        if (!isValidPhoneNumber(limitedDigits)) {
          setPhoneError('Phone must start with 9 and have 8 as second digit max (e.g., 9XX XXX XXX)');
        } else {
          setPhoneError('');
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle form submission (Next)
  const handleNext = (e) => {
    e.preventDefault();
    
    // Validate phone number before submission
    if (!isValidPhoneNumber(formData.phoneNumber)) {
      setPhoneError('Please enter a valid 10-digit phone number starting with 9 (e.g., 9XX XXX XXX)');
      return;
    }
    
    // Normalize phone number before saving
    const normalizedPhone = normalizePhoneNumber(formData.phoneNumber);
    
    // Save personal details to context with normalized phone
    updatePersonalDetailsData({
      ...formData,
      phoneNumber: normalizedPhone
    });
    
    // Navigate to summary
    navigate('/summary');
  };

  // Handle previous button
  const handlePrevious = () => {
    // Normalize phone number before saving if valid
    let dataToSave = { ...formData };
    if (formData.phoneNumber && isValidPhoneNumber(formData.phoneNumber)) {
      dataToSave.phoneNumber = normalizePhoneNumber(formData.phoneNumber);
    }
    
    // Save current data before going back
    updatePersonalDetailsData(dataToSave);
    navigate(-1);
  };

  // Handle back button
  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="app-container">
      
      {/* ==================== HEADER ==================== */}
      <header className="header">
        <button className="back-btn" onClick={handleBack}>
          ← Back
        </button>
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

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="main-content">
        <div className="container">
          
          {/* Title Section */}
          <h1 className="form-title">Loan Application</h1>
          <p className="form-subtitle">Step 2 of 3</p>

          {/* Progress Indicator */}
          <div className="progress-indicator">
            <div className="progress-dot active"></div>
            <div className="progress-dot active"></div>
            <div className="progress-dot"></div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleNext}>
            
            {/* First Name and Last Name Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input 
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Abebe"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input 
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Kebede"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="abebe.kebede@example.com"
                className="form-input"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label">Mobile Phone</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '12px 16px', 
                  backgroundColor: '#f5f5f5',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontWeight: '600',
                  color: '#40A152'
                }}>
                  +251
                </div>
                <input 
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  placeholder="9XX XXX XXX"
                  onChange={handleChange}
                  className={`form-input ${phoneError ? 'error-input' : ''}`}
                  style={{ 
                    flex: 1,
                    borderColor: phoneError ? '#dc3545' : '#e0e0e0'
                  }}
                  maxLength="10"
                  required
                />
              </div>
              {phoneError ? (
                <small className="error-message">
                  {phoneError}
                </small>
              ) : (
                <small style={{ display: 'block', marginTop: '4px', color: '#666', fontSize: '12px' }}>
                  10 digits starting with 9 (e.g., 9XX XXX XXX)
                </small>
              )}
            </div>

            {/* Button Container */}
            <div className="button-container">
              <button 
                type="button" 
                className="previous-btn"
                onClick={handlePrevious}
              >
                PREVIOUS
              </button>
              <button type="submit" className="next-btn">
                NEXT STEP
              </button>
            </div>
          </form>

        </div>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="footer">
        © 2026 Birr Ethiopia
      </footer>
    </div>
  );
}