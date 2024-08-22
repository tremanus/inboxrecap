"use client";
import React, { useEffect } from 'react';
import './faq.css'; // Importing the CSS file

const FAQ = () => {
  // Set the page title when the component mounts
  useEffect(() => {
    document.title = "FAQ | InboxRecap";
  }, []);

  return (
    <>
    <section className="faqtitle">
    <h1>Frequently Asked Questions</h1>
    </section>
    <section className="faq">

      <details className="faq-item">
        <summary className="faq-question">What is InboxRecap?</summary>
        <p className="faq-answer">
          InboxRecap is a service that summarizes your unread emails from the last 24 hours into a single email, helping you stay on top of your inbox without getting overwhelmed. It also marks those emails as read to keep your inbox tidy.
        </p>
      </details>

      <details className="faq-item">
        <summary className="faq-question">How does InboxRecap work?</summary>
        <p className="faq-answer">
          InboxRecap connects to your email account, retrieves unread emails from the past day, generates a one-sentence summary for each email, and sends all the summaries to you in a single daily email. After summarizing, it marks the emails as read to keep your inbox organized.
        </p>
      </details>

      <details className="faq-item">
        <summary className="faq-question">Is InboxRecap secure?</summary>
        <p className="faq-answer">
          Yes, security is a top priority for InboxRecap. We use industry-standard encryption and secure authentication methods to ensure your data is protected. We never store the content of your emails; only the summaries are sent to you.
        </p>
      </details>

      <details className="faq-item">
        <summary className="faq-question">Which email providers does InboxRecap support?</summary>
        <p className="faq-answer">
          Currently, InboxRecap supports Gmail. We plan to add support for other email providers, such as Outlook and Yahoo, in the near future.
        </p>
      </details>

      <details className="faq-item">
        <summary className="faq-question">Can I choose which emails get summarized?</summary>
        <p className="faq-answer">
          By default, InboxRecap summarizes all unread emails from the past 24 hours. However, you can customize the settings to exclude certain emails or summarize only emails from specific senders.
        </p>
      </details>

      <details className="faq-item">
        <summary className="faq-question">How do I sign up for InboxRecap?</summary>
        <p className="faq-answer">
          You can sign up for InboxRecap by visiting our website, creating an account, and connecting your email. Once connected, you'll start receiving daily summaries of your unread emails.
        </p>
      </details>

      <details className="faq-item">
        <summary className="faq-question">Can I choose the time of day I receive the summary email?</summary>
        <p className="faq-answer">
          Yes, InboxRecap allows you to choose when you'd like to receive your daily summary email, whether it’s in the morning, afternoon, or evening.
        </p>
      </details>

      <details className="faq-item">
        <summary className="faq-question">What if I accidentally mark an important email as read?</summary>
        <p className="faq-answer">
          InboxRecap includes an "Unmark as Read" button in your summary email, allowing you to easily revert the status of any email if needed.
        </p>
      </details>


      <details className="faq-item">
        <summary className="faq-question">How do I unsubscribe or cancel my InboxRecap service?</summary>
        <p className="faq-answer">
          You can unsubscribe or cancel your service anytime through the account settings on our website. If you encounter any issues, our support team is here to help.
        </p>
      </details>

      <details className="faq-item">
        <summary className="faq-question">Can I reply to emails directly from the summary email?</summary>
        <p className="faq-answer">
          Yes, each summarized email includes a "Reply" button that allows you to quickly respond to the original email.
        </p>
      </details>

      <details className="faq-item">
        <summary className="faq-question">Does InboxRecap store any of my email data?</summary>
        <p className="faq-answer">
          No, InboxRecap does not store the content of your emails. We only process the emails to generate summaries, and those summaries are sent directly to you.
        </p>
      </details>

    </section>
    </>
  );
};

export default FAQ;
