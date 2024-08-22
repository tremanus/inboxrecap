import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { gapi } from 'gapi-script';
import { Parser, DomHandler } from 'htmlparser2';

const CLIENT_ID = process.env.REACT_APP_GMAIL_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GMAIL_API_KEY;
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'];
const SCOPES = 'https://www.googleapis.com/auth/gmail.modify';

const GptSummary = () => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadGapiClient = () => {
      gapi.load('client:auth2', initializeGapiClient);
    };

    const initializeGapiClient = () => {
      gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
        clientId: CLIENT_ID,
        scope: SCOPES,
      }).then(() => {
        const authInstance = gapi.auth2.getAuthInstance();
        setIsAuthenticated(authInstance.isSignedIn.get());
        authInstance.isSignedIn.listen(setIsAuthenticated); // Listen for changes in authentication status
        console.log('GAPI client initialized.');
      }).catch(error => {
        console.error('Error initializing GAPI client:', error);
      });
    };

    loadGapiClient();
  }, []);

  const extractTextFromHtml = (htmlContent) => {
    const sanitizedHtml = DOMPurify.sanitize(htmlContent);
    const handler = new DomHandler((error, dom) => {
      if (error) {
        console.error('Error parsing HTML:', error);
        return;
      }

      let extractedText = '';

      const traverse = (node) => {
        if (node.type === 'text') {
          extractedText += node.data;
        } else if (node.type === 'tag') {
          if (node.children) {
            node.children.forEach(traverse);
          }
        }
      };

      dom.forEach(traverse);
      summarizeEmail(extractedText.trim());
    });

    const parser = new Parser(handler);
    parser.write(sanitizedHtml);
    parser.end();
  };

  const fetchAndSummarizeEmail = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await gapi.client.gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
        maxResults: 1,
      });

      const latestMessage = response.result.messages ? response.result.messages[0] : null;
      if (latestMessage) {
        const messageDetails = await gapi.client.gmail.users.messages.get({
          userId: 'me',
          id: latestMessage.id,
        });

        const headers = messageDetails.result.payload.headers;
        const senderHeader = headers.find(header => header.name === 'From');
        const subjectHeader = headers.find(header => header.name === 'Subject');

        setSender(senderHeader ? senderHeader.value : 'Unknown Sender');
        setSubject(subjectHeader ? subjectHeader.value : 'No Subject');

        const parts = messageDetails.result.payload.parts || [];
        let emailBody = '';

        const processParts = (partsArray) => {
          partsArray.forEach(part => {
            if (part.mimeType === 'text/plain') {
              const decodedBody = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
              emailBody += decodedBody;
            } else if (part.mimeType === 'text/html') {
              const decodedBody = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
              emailBody += decodedBody;
            } else if (part.parts) {
              processParts(part.parts);
            }
          });
        };

        processParts(parts);
        extractTextFromHtml(emailBody);
      } else {
        setError('No unread emails found.');
      }
    } catch (error) {
      console.error('Error fetching the latest unread email:', error);
      setError('Error fetching the latest unread email.');
    } finally {
      setLoading(false);
    }
  };

  const summarizeEmail = async (emailContent, retryCount = 3) => {
    if (!emailContent) return;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: "Summarize this email in one concise sentence with important links, using markdown style for links." },
            { role: 'user', content: emailContent },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );

      const rawSummary = response.data.choices[0].message.content
        .replace(/\n/g, ' ')
        .replace(/(?:\r\n|\r|\n)/g, ' ')
        .trim();

      const htmlSummary = rawSummary
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

      const sanitizedSummary = DOMPurify.sanitize(htmlSummary, { USE_PROFILES: { html: true } });

      setSummary(sanitizedSummary);
    } catch (error) {
      console.error('Error summarizing email:', error);
      if (error.response) {
        if (error.response.status === 429 && retryCount > 0) {
          await new Promise(res => setTimeout(res, 1000));
          await summarizeEmail(emailContent, retryCount - 1);
        } else {
          setError('Failed to summarize email. Please try again later.');
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div>
      <button onClick={fetchAndSummarizeEmail} disabled={loading}>
        {loading ? 'Fetching and Summarizing...' : 'Fetch and Summarize Latest Unread Email'}
      </button>
      <p><strong>{sender} - {subject}</strong></p>
      {summary && (
        <div>
          <span dangerouslySetInnerHTML={{ __html: summary }} />
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default GptSummary;
