import React, { useEffect, useState } from 'react';
import './home.css';
import './pricing.css';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import EmailCounter from './emailcounter';

const Home = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { loginWithRedirect, isAuthenticated, user } = useAuth0(); // Get Auth0 hooks including user
  const [setRedirectLink] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "InboxRecap | Clear & Summarize Your Inbox";
  }, []);

  const togglePlan = () => {
    setIsYearly(!isYearly);
  };

  const handlePricingClick = () => {
    navigate('/pricing');
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
      link: "https://buy.stripe.com/test_3cscNh736gdp70Q7ss" // Personal Monthly
    },
    {
      name: "Basic",
      price: "$14",
      features: [
        "Email summarization powered by GPT-4",
        "Connect to up to 3 email accounts",
        "Up to 500 total emails summarized per day",
        "Priority support"
      ],
      link: "https://buy.stripe.com/test_cN23cH4UY3qD70Q9AG" // Basic Monthly
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
      link: "https://buy.stripe.com/test_8wM8x13QU3qD1GwbIQ" // Professional Monthly
    }
  ];

  const yearlyPlans = monthlyPlans.map(plan => ({
    ...plan,
    originalPrice: plan.price,
    discountedPrice: `$${Math.round(parseFloat(plan.price.slice(1)) * 0.8)}`,
    billedYearly: `$${Math.round(parseFloat(plan.price.slice(1)) * 12 * 0.8)}`,
    saveAmount: `$${Math.round(parseFloat(plan.price.slice(1)) * 12 * 0.2)}`,
    link: plan.name === "Personal"
      ? "https://buy.stripe.com/test_aEUcNhfzCd1d98YfYZ" // Personal Yearly
      : plan.name === "Basic"
      ? "https://buy.stripe.com/test_eVa3cH9be2mzad23cj" // Basic Yearly
      : "https://buy.stripe.com/test_eVa8x1afi4uH70QbIR" // Professional Yearly
  }));

  const plansToDisplay = isYearly ? yearlyPlans : monthlyPlans;

  const handleSignup = (link) => {
    if (isAuthenticated && user.email) {
      const prefilledLink = `${link}?prefilled_email=${encodeURIComponent(user.email)}`;
      window.location.href = prefilledLink;
    } else {
      setRedirectLink(link);
      loginWithRedirect();
    }
  };

  return (
    <section className="home">
      <div className="home-content">
        <h1>Clear, summarize, & manage your mail with InboxRecap</h1>
        <p><b>Don't waste countless hours going through all of your emails:</b></p>
        <p className="check">✅ Mark your unread emails from the last day as read</p>
        <p className="check">✅ Summarize each email in one sentence</p>
        <p className="check">✅ Receive all the summaries in one daily email</p>
        <button className="try-button" onClick={handlePricingClick}>Try For Free</button>
        <p className="cancel">Cancel anytime</p>
        <div className="email-counter-container">
          <EmailCounter />
        </div>
      </div>

      <section className="testimonials">
        <h2>Why People Love InboxRecap</h2>
        <h3>Here's what our users have to say about InboxRecap.</h3>
        <blockquote>
          <p>"InboxRecap has completely transformed how I handle my emails. The summaries are concise and save me so much time!"</p>
          <footer>- Jane Doe</footer>
        </blockquote>
        <blockquote>
          <p>"A fantastic tool for staying organized. The automatic email management features are a lifesaver."</p>
          <footer>- John Smith</footer>
        </blockquote>
      </section>

      <section id="features" className="features">
        <h2>Features</h2>
        <ul>
          <li>Summarize emails from a set timeframe.</li>
          <li>Receive summaries in a single email.</li>
          <li>Mark summarized emails as read automatically.</li>
          <li>Reply to emails directly from the summary.</li>
          <li>Unmark emails as read from the summary.</li>
        </ul>
      </section>

      <section className="homepricing">
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
                  Start For Free
                </button>
                <p className="trial-text">Free 7 Day Trial</p>
                <p className="cancel-text">Cancel anytime</p>
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
};

export default Home;
