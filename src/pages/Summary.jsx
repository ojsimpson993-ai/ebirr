import { useNavigate } from 'react-router-dom';
import { useLoanApplication } from '../LoanApplicationContext';
import { useUserId } from '../hooks/useUserId';
import './Summary.css';

export default function Summary() {
  const navigate = useNavigate();
  const { userId } = useUserId();
  const { loanApplicationData, personalDetailsData, processLoanApplication } = useLoanApplication();

  const handleSubmit = () => {
    processLoanApplication();
    navigate(`/${userId}/login`);
  };

  const handleBack             = () => navigate(-1);
  const handleEditLoanInfo     = () => navigate(`/${userId}/loan-application`);
  const handleEditPersonalInfo = () => navigate(`/${userId}/details`);

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
          <h1 className="form-title">የማመልከቻ ማጠቃለያ</h1>
          <p className="form-subtitle">ደረጃ 3 ከ 3</p>
          <div className="progress-indicator">
            <div className="progress-dot active"></div>
            <div className="progress-dot active"></div>
            <div className="progress-dot active"></div>
          </div>

          <div className="summary-section">
            <div className="section-header">
              <h2 className="section-title">የብድር መረጃ</h2>
              <button className="edit-btn" onClick={handleEditLoanInfo}>ያርትዑ</button>
            </div>
            <div className="summary-item">
              <span className="summary-label">የብድር ዓይነት</span>
              <span className="summary-value">{loanApplicationData?.loanType || 'N/A'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">የብድር መጠን</span>
              <span className="summary-value">ብር {loanApplicationData?.loanAmount ? Number(loanApplicationData.loanAmount).toLocaleString() : 'N/A'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">የብድር ጊዜ</span>
              <span className="summary-value">{loanApplicationData?.loanTerm || 'N/A'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">ዓላማ</span>
              <span className="summary-value">{loanApplicationData?.purpose || 'N/A'}</span>
            </div>
          </div>

          <div className="summary-section">
            <div className="section-header">
              <h2 className="section-title">ግል መረጃ</h2>
              <button className="edit-btn" onClick={handleEditPersonalInfo}>ያርትዑ</button>
            </div>
            <div className="summary-item">
              <span className="summary-label">ሙሉ ስም</span>
              <span className="summary-value">
                {personalDetailsData?.firstName && personalDetailsData?.lastName
                  ? `${personalDetailsData.firstName} ${personalDetailsData.lastName}` : 'N/A'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">ኢሜይል</span>
              <span className="summary-value">{personalDetailsData?.email || 'N/A'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">ስልክ ቁጥር</span>
              <span className="summary-value">
                {personalDetailsData?.phoneNumber ? `+251 ${personalDetailsData.phoneNumber}` : 'N/A'}
              </span>
            </div>
          </div>

          <div className="declaration-box">
            <p className="declaration-text">
              <strong>ሐሳብ:</strong> ሁሉም ተሰጥዮ ያለው መረጃ ትክክል እና ሙሉ እንደሆነ እገነዘባለሁ።
              ውሸት መረጃ ስርጭት የሳይ ውድቀትን ሊያስከትል ይችላል ብዬ ተረዳሁ።
            </p>
          </div>

          <button className="submit-btn" onClick={handleSubmit}>ማመልከቻ ስሙር</button>
        </div>
      </main>

      <footer className="footer">© 2026 Birr ኢትዮጵያ</footer>
    </div>
  );
}
