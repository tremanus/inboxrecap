import React, { useState, useEffect } from 'react';
import './faq.css'; // CSS for FAQ page

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  // Set the page title when the component mounts
  useEffect(() => {
    document.title = "FAQ | InboxRecap";
  }, []);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq">
      <h1>Frequently Asked Questions</h1>
      <div className="faq-item">
        <h2 onClick={() => toggleFAQ(0)} className="faq-question">
          What is InboxRecap?
        </h2>
        {activeIndex === 0 && (
          <p className="faq-answer">
            InboxRecap is a service that summarizes your unread emails from the last 24 hours into a single email, helping you stay on top of your inbox without getting overwhelmed. It also marks those emails as read to keep your inbox tidy.
          </p>
        )}
      </div>
      <div className="faq-item">
        <h2 onClick={() => toggleFAQ(1)} className="faq-question">
          How does InboxRecap work?
        </h2>
        {activeIndex === 1 && (
          <p className="faq-answer">
            InboxRecap connects to your email account, retrieves unread emails from the past day, generates a one-sentence summary for each email, and sends all the summaries to you in a single daily email. After summarizing, it marks the emails as read to keep your inbox organized.
          </p>
        )}
      </div>
      <div className="faq-item">
        <h2 onClick={() => toggleFAQ(2)} className="faq-question">
          Is InboxRecap secure?
        </h2>
        {activeIndex === 2 && (
          <p className="faq-answer">
            Yes, security is a top priority for InboxRecap. We use industry-standard encryption and secure authentication methods to ensure your data is protected. We never store the content of your emails; only the summaries are sent to you.
          </p>
        )}
      </div>
      <div className="faq-item">
        <h2 onClick={() => toggleFAQ(3)} className="faq-question">
          Which email providers does InboxRecap support?
        </h2>
        {activeIndex === 3 && (
          <p className="faq-answer">
            Currently, InboxRecap supports Gmail. We plan to add support for other email providers, such as Outlook and Yahoo, in the near future.
          </p>
        )}
      </div>
      <div className="faq-item">
        <h2 onClick={() => toggleFAQ(4)} className="faq-question">
          Can I choose which emails get summarized?
        </h2>
        {activeIndex === 4 && (
          <p className="faq-answer">
            By default, InboxRecap summarizes all unread emails from the past 24 hours. However, you can customize the settings to exclude certain emails or summarize only emails from specific senders.
          </p>
        )}
      </div>
      <div className="faq-item">
        <h2 onClick={() => toggleFAQ(5)} className="faq-question">
          How do I sign up for InboxRecap?
        </h2>
        {activeIndex === 5 && (
          <p className="faq-answer">
            You can sign up for InboxRecap by visiting our website, creating an account, and connecting your email. Once connected, you'll start receiving daily summaries of your unread emails.
          </p>
        )}
      </div>
      <div className="faq-item">
        <h2 onClick={() => toggleFAQ(6)} className="faq-question">
          Can I choose the time of day I receive the summary email?
        </h2>
        {activeIndex === 6 && (
          <p className="faq-answer">
            Yes, InboxRecap allows you to choose when you'd like to receive your daily summary email, whether it’s in the morning, afternoon, or evening.
          </p>
        )}
      </div>
      <div className="faq-item">
        <h2 onClick={() => toggleFAQ(7)} className="faq-question">
          What if I accidentally mark an important email as read?
        </h2>
        {activeIndex === 7 && (
          <p className="faq-answer">
            InboxRecap includes an "Unmark as Read" button in your summary email, allowing you to easily revert the status of any email if needed.
          </p>
        )}
      </div>
      <div className="faq-item">
        <h2 onClick={() => toggleFAQ(8)} className="faq-question">
          Is there a limit to the number of emails that can be summarized?
        </h2>
        {activeIndex === 8 && (
          <p className="faq-answer">
            Currently, InboxRecap summarizes up to 100 emails per day. If you have more than that, the most recent emails will be prioritized.
          </p>
        )}
      </div>
      <div className="faq-item">
        <h2 onClick={() => toggleFAQ(9)} className="faq-question">
          How do I unsubscribe or cancel my InboxRecap service?
        </h2>
        {activeIndex === 9 && (
          <p className="faq-answer">
            You can unsubscribe or cancel your service anytime through the account settings on our website. If you encounter any issues, our support team is here to help.
          </p>
        )}
      </div>
      <div className="faq-item">
        <h2 onClick={() => toggleFAQ(10)} className="faq-question">
          Can I reply to emails directly from the summary email?
        </h2>
        {activeIndex === 10 && (
          <p className="faq-answer">
            Yes, each summarized email includes a "Reply" button that allows you to quickly respond to the original email.
          </p>
        )}
      </div>
      <div className="faq-item">
        <h2 onClick={() => toggleFAQ(11)} className="faq-question">
          Does InboxRecap store any of my email data?
        </h2>
        {activeIndex === 11 && (
          <p className="faq-answer">
            No, InboxRecap does not store the content of your emails. We only process the emails to generate summaries, and those summaries are sent directly to you.
          </p>
        )}
      </div>
      <div className="faq-item">
        <h2 onClick={() => toggleFAQ(12)} className="faq-question">
          Can I summarize emails from a specific day instead of the last 24 hours?
        </h2>
        {activeIndex === 12 && (
          <p className="faq-answer">
            Yes, you can select a specific day using our calendar feature, and InboxRecap will summarize emails from that selected day.
          </p>
        )}
      </div>
      <div className="faq-item">
        <h2 onClick={() => toggleFAQ(13)} className="faq-question">
          What happens if I don't have any unread emails?
        </h2>
        {activeIndex === 13 && (
          <p className="faq-answer">
            If there are no unread emails in your inbox, InboxRecap will notify you that there are no new summaries available.
          </p>
        )}
      </div>
      <div className="faq-item">
        <h2 onClick={() => toggleFAQ(14)} className="faq-question">
          How do I contact support?
        </h2>
        {activeIndex === 14 && (
          <p className="faq-answer">
            If you have any questions or need assistance, you can contact our support team via the support section on our website or by emailing inboxrecap@gmail.com.
          </p>
        )}
      </div>
    </section>
  );
};

export default FAQ;
