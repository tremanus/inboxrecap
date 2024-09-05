import React, { useEffect, useState } from 'react';
import { Html, Head, Preview, Body, Container, Section, Img, Heading, Text, Link, Button } from '@react-email/components';

const SummaryEmail = () => {
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch('/api/email');
        if (response.ok) {
          const data = await response.json();
          setEmails(data);
        } else {
          console.error('Failed to fetch emails:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    };

    fetchEmails();
  }, []);

  return (
    <Html>
      <Head>
        {/* Import Plus Jakarta Sans font */}
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>
      <Preview>Your Daily InboxRecap</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img src="https://www.inboxrecap.com/favicon.ico" alt="InboxRecap Logo" style={logo} />
            <Heading style={headerText}>Daily Inbox Recap</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={greeting}>Hello!</Heading>
            <Text style={introText}>
              Here’s what you missed in your inbox over the last 24 hours:
            </Text>
            {emails.length > 0 ? (
              emails.map((email, index) => (
                <Section key={index} style={emailItem}>
                  <Text style={emailDetails}>
                    <strong>From:</strong> {email.sender}
                  </Text>
                  <Text style={emailDetails}>
                    <strong>Subject:</strong> {email.subject}
                  </Text>
                  <Text style={emailSummary}>
                    {email.snippet}
                  </Text>
                  <Button href={`https://mail.google.com/mail/u/0/#inbox/${email.id}`} style={viewButton}>
                    View / Reply
                  </Button>
                  {email.unsubscribeLinks.length > 0 && (
                    <Link href={email.unsubscribeLinks[0]} style={unsubscribe}>
                      Unsubscribe
                    </Link>
                  )}
                </Section>
              ))
            ) : (
              <Text style={emailDetails}>
                No new emails found in the last 24 hours.
              </Text>
            )}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Best Regards,
            </Text>
            <Text style={footerText}>
                InboxRecap
            </Text>
            <Link href="https://inboxrecap.com" style={footerLink}>Visit Our Website</Link> | 
            <Link href="mailto:support@inboxrecap.com" style={footerLink}> Contact Support</Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  color: '#2C3E50',
  backgroundColor: '#ECF0F1',
  padding: '20px',
  lineHeight: '1.6',
};

const container = {
  maxWidth: '800px',
  margin: '0 auto',
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
};

const header = {
  backgroundColor: '#2980B9',
  color: '#FFFFFF',
  textAlign: 'center',
  padding: '30px 20px',
};

const logo = {
  width: '50px',
  margin: '5px auto',
};

const headerText = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const content = {
  padding: '30px 20px',
};

const greeting = {
  fontSize: '22px',
  color: '#2980B9',
  marginBottom: '20px',
  textAlign: 'center',
};

const introText = {
  fontSize: '16px',
  color: '#7F8C8D',
  textAlign: 'center',
  marginBottom: '30px',
};

const emailItem = {
  backgroundColor: '#F4F6F7',
  padding: '20px',
  borderRadius: '6px',
  marginBottom: '20px',
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
};

const emailDetails = {
  fontSize: '16px',
  color: '#34495E',
  marginBottom: '10px',
};

const emailSummary = {
  fontSize: '14px',
  color: '#7F8C8D',
  marginBottom: '15px',
};

const viewButton = {
  display: 'block',
  width: '100%',
  textAlign: 'center',
  backgroundColor: '#27AE60',
  color: '#FFFFFF',
  padding: '10px 0',
  borderRadius: '6px',
  textDecoration: 'none',
  marginTop: '10px',
};

const unsubscribe = {
  display: 'block',
  textAlign: 'center',
  marginTop: '15px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#E74C3C',
  textDecoration: 'none',
};

const footer = {
  backgroundColor: '#ECF0F1',
  padding: '20px',
  textAlign: 'center',
};

const footerText = {
  fontSize: '16px',
  color: '#7F8C8D',
};

const footerLink = {
  color: '#2980B9',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '14px',
};

export default SummaryEmail;