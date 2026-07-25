import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoanApplication } from '../LoanApplicationContext';
import { useUserId } from '../hooks/useUserId';
import './LoanApplication.css';

export default function LoanApplication() {
  const navigate = useNavigate();
  const { userId } = useUserId();
  const { loanApplicationData, updateLoanApplicationData } = useLoanApplication();

  const [formData, setFormData] = useState({
    loanType:   loanApplicationData?.loanType   || 'ግል ብድር',
    loanAmount: loanApplicationData?.loanAmount || '',
    loanTerm:   loanApplicationData?.loanTerm   || '12 ወሮች',
    purpose:    loanApplicationData?.purpose    || ''
  });

  useEffect(() => {
    if (loanApplicationData?.loanAmount) {
      setFormData(prev => ({
        ...prev,
        loanAmount: loanApplicationData.loanAmount,
        loanTerm:   loanApplicationData.loanTerm
      }));
    }
  }, [loanApplicationData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateLoanApplicationData(formData);
    navigate(`/${userId}/details`);
  };

  const handleBack = () => navigate(-1);

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
          <p className="form-subtitle">ደረጃ 1 ከ 3</p>
          <div className="progress-indicator">
            <div className="progress-dot active"></div>
            <div className="progress-dot"></div>
            <div className="progress-dot"></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">የብድር ዓይነት</label>
              <select name="loanType" value={formData.loanType} onChange={handleChange} className="form-select">
                <option value="ግል ብድር">ግል ብድር</option>
                <option value="ንግድ ብድር">ንግድ ብድር</option>
                <option value="ቤት ብድር">ቤት ብድር</option>
                <option value="ትምህርት ብድር">ትምህርት ብድር</option>
                <option value="ሞተር ብድር">ሞተር ብድር</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">የብድር መጠን (ብር)</label>
              <input type="number" name="loanAmount" value={formData.loanAmount} onChange={handleChange}
                placeholder="መጠን ያስገቡ (10,000 - 500,000)" className="form-input"
                min="10000" max="500000" step="1000" required />
              <small style={{ display: 'block', marginTop: '4px', color: '#666', fontSize: '12px' }}>
                ዝቅተኛ: 10,000 ብር • ከፍተኛ: 500,000 ብር
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">የብድር ጊዜ</label>
              <select name="loanTerm" value={formData.loanTerm} onChange={handleChange} className="form-select">
                <option value="6 ወሮች">6 ወሮች</option>
                <option value="12 ወሮች">12 ወሮች</option>
                <option value="18 ወሮች">18 ወሮች</option>
                <option value="24 ወሮች">24 ወሮች</option>
                <option value="36 ወሮች">36 ወሮች</option>
                <option value="48 ወሮች">48 ወሮች</option>
                <option value="60 ወሮች">60 ወሮች</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">ብድር ዓላማ</label>
              <textarea name="purpose" value={formData.purpose} onChange={handleChange}
                placeholder="ብድር ምን ለመሆን ከፈልጉ?" className="form-textarea" required></textarea>
            </div>

            <button type="submit" className="next-btn">ቀጣይ ደረጃ</button>
          </form>
        </div>
      </main>

      <footer className="footer">© 2026 Birr ኢትዮጵያ</footer>
    </div>
  );
}
