"use client"; // Add this directive to mark this file as a client component

import React, { useState, useEffect } from 'react';
import './pricing.css';
import { useAuth0 } from '@auth0/auth0-react';

const Pricing = () => {
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();
  const [isYearly, setIsYearly] = useState(false);
  const [redirectLink, setRedirectLink] = useState('');

  useEffect(() => {
    document.title = "Pricing | InboxRecap";
  }, []);

  useEffect(() => {
    if (isAuthenticated && redirectLink) {
      const prefilledLink = `${redirectLink}?prefilled_email=${encodeURIComponent(user.email)}`;
      window.location.href = prefilledLink;
    }
  }, [isAuthenticated, redirectLink, user]);

  const togglePlan = () => {
    setIsYearly(prevState => !prevState);
  };

  const monthlyPlans = [
    {
      name: "Personal",
      price: "$7",
      features: [
        "Email summarization powered by GPT-4",
        "Connect to 1 email account",
        "Up to 100 emails summarized per day",
        "Standard support"
      ],
      link: "https://buy.stripe.com/test_3cscNh736gdp70Q7ss"
    },
    {
      name: "Basic",
      price: "$14",
      features: [
        "Email summarization powered by GPT-4",
        "Connect to 3 email accounts",
        "Up to 500 total emails summarized per day",
        "Priority support"
      ],
      link: "https://buy.stripe.com/test_cN23cH4UY3qD70Q9AG"
    },
    {
      name: "Professional",
      price: "$19",
      features: [
        "Advanced email summarization powered by GPT-4",
        "Connect to up to 5 email accounts",
        "Unlimited summary emails",
        "Dedicated support"
      ],
      link: "https://buy.stripe.com/test_8wM8x13QU3qD1GwbIQ"
    }
  ];

  const yearlyPlans = monthlyPlans.map(plan => ({
    ...plan,
    originalPrice: plan.price,
    discountedPrice: `$${Math.round(parseFloat(plan.price.slice(1)) * 0.8)}`,
    billedYearly: `$${Math.round(parseFloat(plan.price.slice(1)) * 12 * 0.8)}`,
    saveAmount: `$${Math.round(parseFloat(plan.price.slice(1)) * 12 * 0.2)}`,
    link: plan.name === "Personal"
      ? "https://buy.stripe.com/test_aEUcNhfzCd1d98YfYZ"
      : plan.name === "Basic"
      ? "https://buy.stripe.com/test_eVa3cH9be2mzad23cj"
      : "https://buy.stripe.com/test_eVa8x1afi4uH70QbIR"
  }));

  const plansToDisplay = isYearly ? yearlyPlans : monthlyPlans;

  const handleSignup = (link) => {
    if (isAuthenticated) {
      const prefilledLink = `${link}?prefilled_email=${encodeURIComponent(user.email)}`;
      window.location.href = prefilledLink;
    } else {
      setRedirectLink(link);
      loginWithRedirect({
        redirectUri: `${window.location.origin}/pricing`
      });
    }
  };

  return (
    <section className="pricing">
      <h1>Organize Your Inbox</h1>
      <h2>Select the plan that best suits your needs. Upgrade or cancel anytime.</h2>
      <div className="pricing-toggle">
        <button
          className={`toggle-button ${!isYearly ? 'active' : ''}`}
          onClick={togglePlan}
        >
          Monthly
        </button>
        <button
          className={`toggle-button ${isYearly ? 'active' : ''}`}
          onClick={togglePlan}
        >
          Yearly - <b>20% Off</b>
        </button>
      </div>
      <div className="pricing-plans">
        {plansToDisplay.map((plan, index) => {
          const featuresArray = plan.features || [];
          const featureList = Array.isArray(featuresArray) ? featuresArray.map((feature, idx) => (
            <li key={idx}>{feature}</li>
          )) : null;

          return (
            <div className="pricing-plan" key={index}>
              <h2>{plan.name}</h2>
              <p className="price">
                {isYearly ? (
                  <>
                    <span className="original-price">
                      <s>{plan.originalPrice}</s>
                    </span>
                    <span className="discounted-price">
                      {plan.discountedPrice}<span className="per-mo-small">/mo</span>
                    </span>
                    <span className="billed-yearly">
                      Billed {plan.billedYearly} yearly
                      <span className="save-button">
                        Save <b>{plan.saveAmount}/y</b>
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    {plan.price}<span className="per-mo-small">/mo</span>
                  </>
                )}
              </p>
              <ul className="plan-features">
                {featureList}
              </ul>
              <button
                className="cta-button"
                onClick={() => handleSignup(plan.link)}
              >
                {plan.name === "Personal" ? "Start For Free" : "Get Started"}
              </button>
              {plan.name === "Personal" && (
                <p className="trial-text">Free 7 Day Trial</p>
              )}
              <p className="cancel-text">Cancel anytime</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Pricing;
