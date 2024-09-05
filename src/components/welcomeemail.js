import React from 'react';
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Text,
  Link,
} from '@react-email/components';

const WelcomeEmail = () => (
  <Html>
    <Head>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&display=swap');
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
        `}
      </style>
    </Head>
    <Preview>Welcome to InboxRecap - Simplify Your Inbox</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://www.inboxrecap.com/favicon.ico"
          width="50"
          height="50"
          alt="InboxRecap Logo"
          style={logo}
        />
        <Text style={heading}>Welcome to InboxRecap!</Text>
        <Text style={paragraph}>
          Hi there!
        </Text>
        <Text style={paragraph}>
          I'm Biya, and I'm excited to welcome you to InboxRecap! 🎉
        </Text>
        <Text style={paragraph}>
          InboxRecap is all about making your life easier by helping you manage your emails more efficiently. With our service, you'll get a daily summary of your inbox from the last 24 hours, with each email summarized in one easy-to-read sentence. No more endless scrolling – just the important stuff, right at your fingertips.
        </Text>
        <Text style={paragraph}>
          Here’s what you can do with InboxRecap:
        </Text>
        <ul style={list}>
          <li style={listItem}>
            <strong>Mass Actions:</strong> Quickly clear out your inbox by deleting or marking emails as read in bulk.
          </li>
          <li style={listItem}>
            <strong>Unsubscribe with Ease:</strong> Say goodbye to unwanted newsletters with a simple unsubscribe option directly from your summaries.
          </li>
          <li style={listItem}>
            <strong>Customizable Summaries:</strong> Personalize how your email summaries look and feel, so you always get the most relevant info.
          </li>
        </ul>
        <Text style={paragraph}>
          I can’t wait for you to try it out. Tomorrow, you’ll receive your first summary email. In the meantime, feel free to explore all the customization options we offer to make InboxRecap truly yours.
        </Text>
        <Text style={paragraph}>
          If you have any questions or need help getting started, just reply to this email or visit our{' '}
          <Link href="https://your-support-url.com" style={link}>
            support center
          </Link>
          . I'm here to help you every step of the way.
        </Text>
        <Text style={paragraph}>
          Thanks for joining InboxRecap. Here’s to a cleaner, more organized inbox!
        </Text>
        <Text style={paragraph}>
          Best regards,
          <br />
          Biya from InboxRecap
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: '#f4f4f4',
  padding: '20px 0',
  color: '#111',
};

const container = {
  backgroundColor: '#ffffff',
  padding: '20px',
  maxWidth: '600px',
  margin: '0 auto',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
};

const logo = {
  display: 'block',
  margin: '0 auto 20px',
};

const heading = {
  fontSize: '24px',
  fontWeight: '700',
  textAlign: 'center',
  margin: '0 0 20px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0 0 20px',
};

const list = {
  margin: '0 0 20px',
  padding: '0 0 0 20px',
  listStyleType: 'disc',
};

const listItem = {
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0 0 10px',
};

const link = {
  color: '#007BFF',
  textDecoration: 'none',
};
