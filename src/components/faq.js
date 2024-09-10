"use client";

import React, { useEffect } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@radix-ui/react-icons"; // Radix Chevron Icon
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import "./faq.css";

const FAQ = () => {
  useEffect(() => {
    document.title = "FAQ | InboxRecap";
  }, []);

  return (
    <div id='faq'>
    <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 8,
            mb: 3, // Margin bottom to separate from the cards
          }}
        >
          <Button
            sx={{
              backgroundColor: '#6ebef7',
              color: 'black',
              borderRadius: '25px',
              padding: '8px 16px',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              textTransform: 'none',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
            startDecorator={<QuestionAnswerOutlinedIcon sx={{ color: 'black', mr: 0.5 }} />} // Set icon color to black
            disabled // Make the button unclickable
          >
            <Typography sx={{ color: 'black' }}>FAQ</Typography>
          </Button>
        </Box>
    <div className="container">
      <div className='faq-left'>
      <h1>Frequently Asked Questions</h1>
      <p>Any other questions? Shoot us an email <a href='mailto:support@inboxrecap.com'>here.</a></p>
      </div>
      <Accordion.Root
        type="single"
        collapsible
        className="AccordionRoot"
      >
        {faqItems.map((item, index) => (
          <Accordion.Item
            key={index}
            value={`item-${index}`}
            className="AccordionItem"
          >
            <Accordion.Header className="AccordionHeader">
              <Accordion.Trigger className="AccordionTrigger">
                <span className="accordion-title">{item.question}</span>
                <ChevronDownIcon className="AccordionChevron" aria-hidden />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="AccordionContent">
              <div className="AccordionContentText">
                {item.answer}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
    </div>
  );
};

const faqItems = [
  {
    question: "What is InboxRecap?",
    answer:
      "InboxRecap is a service that summarizes your unread emails from the last 24 hours into a single email, helping you stay on top of your inbox without getting overwhelmed. It also marks those emails as read to keep your inbox tidy.",
  },
  {
    question: "How does InboxRecap work?",
    answer:
      "InboxRecap connects to your email account, retrieves unread emails from the past day, generates a one-sentence summary for each email, and sends all the summaries to you in a single daily email. After summarizing, it marks the emails as read to keep your inbox organized.",
  },
  {
    question: "Is InboxRecap secure?",
    answer:
      "Yes, security is a top priority for InboxRecap. We use industry-standard encryption and secure authentication methods to ensure your data is protected. We never store the content of your emails; only the summaries are sent to you.",
  },
  {
    question: "Which email providers does InboxRecap support?",
    answer:
      "Currently, InboxRecap supports Gmail. We plan to add support for other email providers, such as Outlook and Yahoo, in the near future.",
  },
  {
    question: "Can I choose which emails get summarized?",
    answer:
      "By default, InboxRecap summarizes all unread emails from the past 24 hours. However, you can customize the settings to exclude certain emails or summarize only emails from specific senders.",
  },
  {
    question: "How do I sign up for InboxRecap?",
    answer:
      "You can sign up for InboxRecap by visiting our website, creating an account, and connecting your email. Once connected, you'll start receiving daily summaries of your unread emails.",
  },
  {
    question: "Can I choose the time of day I receive the summary email?",
    answer:
      "Yes, InboxRecap allows you to choose when you'd like to receive your daily summary email, whether it’s in the morning, afternoon, or evening.",
  },
  {
    question: "What if I accidentally mark an important email as read?",
    answer:
      "InboxRecap includes an 'Unmark as Read' button in your summary email, allowing you to easily revert the status of any email if needed.",
  },
  {
    question: "How do I unsubscribe or cancel my InboxRecap service?",
    answer:
      "You can unsubscribe or cancel your service anytime through the account settings on our website. If you encounter any issues, our support team is here to help.",
  },
  {
    question: "Can I reply to emails directly from the summary email?",
    answer:
      "Yes, each summarized email includes a 'Reply' button that allows you to quickly respond to the original email.",
  },
  {
    question: "Does InboxRecap store any of my email data?",
    answer:
      "No, InboxRecap does not store the content of your emails. We only process the emails to generate summaries, and those summaries are sent directly to you.",
  },
];

export default FAQ;
