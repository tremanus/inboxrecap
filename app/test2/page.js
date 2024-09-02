'use client';

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress } from '@mui/material';

const TopSenders = () => {
  const [senders, setSenders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTopSenders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/top-senders');
      if (!response.ok) {
        throw new Error('Failed to fetch top senders');
      }
      const data = await response.json();
      setSenders(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = (link) => {
    window.open(link, '_blank');
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: '800px', margin: '100px auto' }}>
      <h2>Top 10 Senders</h2>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={fetchTopSenders} 
        disabled={loading}
        style={{ marginBottom: '20px' }}
      >
        {loading ? <CircularProgress size={24} /> : 'Fetch Top Senders'}
      </Button>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {senders.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>From:</TableCell>
                <TableCell>Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {senders.map((sender, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {sender.sender}
                    {sender.unsubscribeLinks && sender.unsubscribeLinks.length > 0 ? (
                      <Button 
                        variant="text" 
                        color="primary" 
                        onClick={() => handleUnsubscribe(sender.unsubscribeLinks[0])}
                        style={{ marginLeft: '10px', textTransform: 'none', border: 'none', color: 'blue' }}
                      >
                        Unsubscribe
                      </Button>
                    ) : (
                      <span style={{ marginLeft: '10px' }}></span>
                    )}
                  </TableCell>
                  <TableCell>{sender.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <p>No senders found</p>
      )}
    </div>
  );
};

export default TopSenders;
