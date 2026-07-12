import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoanApplication } from '../LoanApplicationContext';
import './LoanApplication.css';

export default function LoanApplication() {
  const navigate = useNavigate();
  
  // Get context data and functions
  const { loanApplicationData, updateLoanApplicationData } = useLoanApplication();
  
  // Form state - initialize with data from context
  const [formData, setFormData] = useState({
    loanType: loanApplicationData?.loanType || 'ግል ብድር',
    loanAmount: loanApplicationData?.loanAmount || '',
    loanTerm: loanApplicationData?.loanTerm || '12 ወሮች',
    purpose: loanApplicationData?.purpose || ''
  });

  // Update form if context data changes (e.g., from calculator)
  useEffect(() => {
    if (loanApplicationData?.loanAmount) {
      setFormData(prev => ({
        ...prev,
        loanAmount: loanApplicationData.loanAmount,
        loanTerm: loanApplicationData.loanTerm
      }));
    }
  }, [loanApplicationData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save form data to context
    updateLoanApplicationData(formData);
    
    // Navigate to next step
    navigate('/details');
  };

  // Handle back button
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="app-container">
      
      {/* ==================== HEADER ==================== */}
      <header className="header">
        <button className="back-btn" onClick={handleBack}>
          ← ተመልሸ
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
          <h1 className="form-title">የብድር ማመልከቻ</h1>
          <p className="form-subtitle">ደረጃ 1 ከ 3</p>

          {/* Progress Indicator */}
          <div className="progress-indicator">
            <div className="progress-dot active"></div>
            <div className="progress-dot"></div>
            <div className="progress-dot"></div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit}>
            
            {/* Loan Type */}
            <div className="form-group">
              <label className="form-label">የብድር ዓይነት</label>
              <select 
                name="loanType"
                value={formData.loanType}
                onChange={handleChange}
                className="form-select"
              >
                <option value="ግል ብድር">ግል ብድር</option>
                <option value="ንግድ ብድር">ንግድ ብድር</option>
                <option value="ቤት ብድር">ቤት ብድር</option>
                <option value="ትምህርት ብድር">ትምህርት ብድር</option>
                <option value="ሞተር ብድር">ሞተር ብድር</option>
              </select>
            </div>

            {/* Loan Amount */}
            <div className="form-group">
              <label className="form-label">የብድር መጠን (ብር)</label>
              <input 
                type="number"
                name="loanAmount"
                value={formData.loanAmount}
                onChange={handleChange}
                placeholder="መጠን ያስገቡ (10,000 - 500,000)"
                className="form-input"
                min="10000"
                max="500000"
                step="1000"
                required
              />
              <small style={{ display: 'block', marginTop: '4px', color: '#666', fontSize: '12px' }}>
                ዝቅተኛ: 10,000 ብር • ከፍተኛ: 500,000 ብር
              </small>
            </div>

            {/* Loan Term */}
            <div className="form-group">
              <label className="form-label">የብድር ጊዜ</label>
              <select 
                name="loanTerm"
                value={formData.loanTerm}
                onChange={handleChange}
                className="form-select"
              >
                <option value="6 ወሮች">6 ወሮች</option>
                <option value="12 ወሮች">12 ወሮች</option>
                <option value="18 ወሮች">18 ወሮች</option>
                <option value="24 ወሮች">24 ወሮች</option>
                <option value="36 ወሮች">36 ወሮች</option>
                <option value="48 ወሮች">48 ወሮች</option>
                <option value="60 ወሮች">60 ወሮች</option>
              </select>
            </div>

            {/* Purpose of Loan */}
            <div className="form-group">
              <label className="form-label">ብድር ዓላማ</label>
              <textarea 
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="ብድር ምን ለመሆን ከፈልጉ?"
                className="form-textarea"
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <button type="submit" className="next-btn">
              ቀጣይ ደረጃ
            </button>
          </form>

        </div>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="footer">
        © 2026 Birr ኢትዮጵያ
      </footer>
    </div>
  );
}
