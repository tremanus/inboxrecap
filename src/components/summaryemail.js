import React from 'react';
import { Html, Head, Preview, Body, Container, Section, Img, Heading, Text, Link, Button } from '@react-email/components';

const SummaryEmail = () => {
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
            <Section style={emailItem}>
              <Text style={emailDetails}>
                <strong>From:</strong> sender@example.com
              </Text>
              <Text style={emailDetails}>
                <strong>Subject:</strong> Placeholder Subject Line for Your Email
              </Text>
              <Text style={emailSummary}>
                This is a placeholder summary for your email. It gives a brief overview of the content.
              </Text>
              <Button href="https://mail.google.com/mail/u/0/#inbox/messageId" style={viewButton}>
                View / Reply
              </Button>
              <Link href="https://unsubscribe-link.com" style={unsubscribe}>
                Unsubscribe
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Best Regards,
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
  fontSize: '12px',
  color: '#E74C3C',
  textDecoration: 'none',
};

const footer = {
  backgroundColor: '#ECF0F1',
  padding: '20px',
  textAlign: 'center',
};

const footerText = {
  fontSize: '14px',
  color: '#7F8C8D',
};

const footerLink = {
  color: '#2980B9',
  textDecoration: 'none',
  fontWeight: 'bold',
};

export default SummaryEmail;