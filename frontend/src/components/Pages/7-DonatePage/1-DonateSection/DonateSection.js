import React, { useState } from "react";
import "./DonateSection.css";
import VolleyballImg from "../../../../images/Donate-Images/donate-volleyball-img.png";

const DonateSection = () => {
  const [paymentType, setPaymentType] = useState("one-time");
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");

  const oneTimeAmounts = [15, 20, 25, 50, 100, 200];
  const monthlyAmounts = [15, 20, 25, 50, 100, 200];

  const handleToggle = (type) => {
    setPaymentType(type);
    setSelectedAmount(null);
    setCustomAmount("");
  };

  const handleAmountClick = (amount) => {
    if (selectedAmount === amount) {
      setSelectedAmount(null);
      return;
    }
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (e) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null);
  };

  const handleDonateClick = () => {
    const finalAmount =
      paymentType === "one-time" && customAmount
        ? Number(customAmount)
        : selectedAmount;

    if (!finalAmount || Number.isNaN(finalAmount) || finalAmount <= 0) {
      alert("Please select or enter a valid amount.");
      return;
    }

    alert(
      `Thank you! You selected a ${paymentType.toUpperCase()} donation of $${finalAmount}.`
    );

    console.log({ paymentType, amount: finalAmount });
  };

  const amountsToRender =
    paymentType === "one-time" ? oneTimeAmounts : monthlyAmounts;

  return (
    <section className="DonateSection">
      <div className="main-container">
        <div className="donate-card">
          <div className="donate-left">
            <div className="donate-text">
              <p className="donate-page-p">
                <strong>
                  Together, we can make a difference and save lives.
                </strong>
                <br />
                <br />
                Please give a Gift today to help us raise awareness of Sudden
                Cardiac Arrest in Young People and save young hearts, inner and
                outer, healthy Mind, Body, and Spirit. “The Gift of Heart and
                Art.”
              </p>
            </div>

            <img
              src={VolleyballImg}
              alt="Young athletes celebrating during a volleyball game"
              className="donate-image"
            />
          </div>

          <div className="donate-right">
            <div className="donate-toggle">
              <button
                className={`donate-toggle-option ${
                  paymentType === "one-time" ? "active" : ""
                }`}
                onClick={() => handleToggle("one-time")}
              >
                One-time
              </button>

              <button
                className={`donate-toggle-option ${
                  paymentType === "monthly" ? "active" : ""
                }`}
                onClick={() => handleToggle("monthly")}
              >
                Monthly
              </button>
            </div>

            <div className="donate-amount-grid">
              {amountsToRender.map((amount) => (
                <button
                  key={`${paymentType}-${amount}`}
                  className={`donate-amount-btn ${
                    selectedAmount === amount ? "selected" : ""
                  }`}
                  onClick={() => handleAmountClick(amount)}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {paymentType === "one-time" && (
              <div className="donate-custom-row">
                <div className="donate-custom-box">
                  <span className="donate-currency-prefix">$</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Custom Amount"
                    className="donate-custom-input"
                    value={customAmount}
                    onChange={handleCustomChange}
                  />
                  <span className="donate-currency-code">USD</span>
                </div>
              </div>
            )}

            <button className="donate-cta" onClick={handleDonateClick}>
              Give to Save Lives
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonateSection;
