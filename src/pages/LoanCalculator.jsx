import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoanApplication } from '../LoanApplicationContext';
import { useUserId } from '../hooks/useUserId';
import './LoanCalculator.css';

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(50000);
  const [loanTerm, setLoanTerm]     = useState(12);
  const navigate = useNavigate();
  const { userId } = useUserId();
  const { updateCalculatorData, updateLoanApplicationData } = useLoanApplication();

  const calculateMonthlyPayment = () => {
    const interestRate = 0.08;
    const monthlyRate  = interestRate / 12;
    const payment      = (loanAmount * (1 + monthlyRate * loanTerm)) / loanTerm;
    return payment.toFixed(2);
  };

  const handleApplyNow = () => {
    updateCalculatorData({ loanAmount, loanTerm, monthlyPayment: calculateMonthlyPayment() });
    updateLoanApplicationData({ loanAmount: loanAmount.toString(), loanTerm: `${loanTerm} ወሮች` });
    navigate(`/${userId}/loan-application`);
  };

  return (
    <div className="app-container">
      <header className="header">
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
          <h1 className="title">በፍጥነት ብድርዎ ብቅያት ሙሙር</h1>
          <p className="subtitle">ፈጣን ብቅያት • ተወዳዳሪ ዋጋ • 유연한 조건</p>

          <div className="calculator">
            <h2 className="calculator-title">የብድር ካልኩሌተር</h2>

            <div className="input-group">
              <div className="input-header">
                <span className="input-label">የብድር መጠን</span>
                <span className="input-value">ብር {loanAmount.toLocaleString()}</span>
              </div>
              <input type="range" min="10000" max="500000" step="5000" value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))} className="slider" />
              <div className="range-labels"><span>ብር 10,000</span><span>ብር 500,000</span></div>
            </div>

            <div className="input-group">
              <div className="input-header">
                <span className="input-label">የብድር ጊዜ</span>
                <span className="input-value">{loanTerm} ወሮች</span>
              </div>
              <input type="range" min="6" max="60" value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))} className="slider" />
              <div className="range-labels"><span>6 ወሮች</span><span>60 ወሮች</span></div>
            </div>

            <div className="payment-box">
              <span className="payment-label">ወርሃዊ ክፍያ</span>
              <span className="payment-amount">ብር {Number(calculateMonthlyPayment()).toLocaleString()}</span>
            </div>
          </div>

          <button className="apply-btn" onClick={handleApplyNow}>ዛሬ ወድ</button>

          <div className="features">
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <div className="feature-title">ፈጣን ብቅያት</div>
              <div className="feature-subtitle">24 ሰዓት ውስጥ</div>
            </div>
            <div className="feature">
              <div className="feature-icon">💰</div>
              <div className="feature-title">ዝቅተኛ ስጋ</div>
              <div className="feature-subtitle">8% ይጀምሩ</div>
            </div>
            <div className="feature">
              <div className="feature-icon">🔒</div>
              <div className="feature-title">ደህንነት</div>
              <div className="feature-subtitle">ባንክ-ደረጃ</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">© 2026 Birr ኢትዮጵያ</footer>
    </div>
  );
}
