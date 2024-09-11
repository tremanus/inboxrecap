import React from 'react';
import Link from 'next/link';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import ArrowForward from '@mui/icons-material/ArrowForward';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Container from '@mui/joy/Container';
import { typographyClasses } from '@mui/joy/Typography';

export default function Features2() {
  function TwoSidedLayout({ children }) {
    return (
      <Container
        sx={theme => ({
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexDirection: 'column-reverse', // Stack with text on top for small screens
          [theme.breakpoints.up('md')]: {
            flexDirection: 'row', // Side by side for larger screens
            alignItems: 'flex-start',
          },
        })}
      >
        <AspectRatio
          ratio={700 / 520}
          sx={theme => ({
            width: '100%',
            maxWidth: 650,
            flexShrink: 0,
            mb: '100px',
            [theme.breakpoints.up('md')]: {
              order: -1, // Move to the left on larger screens
            },
            [theme.breakpoints.between('md', 1134)]: {
              width: '45%', // Adjust image width for screens between 900px and 1134px
              maxWidth: '100%',
            },
            [theme.breakpoints.up(1134)]: {
              width: 700, // Fixed width for screens larger than 1134px
            },
          })}
        >
          <img
            src="/summarize.png"
            alt="Summarize Your Inbox"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </AspectRatio>
        <Box
          sx={theme => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            maxWidth: '50ch',
            textAlign: 'center',
            [theme.breakpoints.up('md')]: {
              alignItems: 'flex-start',
              textAlign: 'left',
            },
            [`& .${typographyClasses.root}`]: {
              textWrap: 'balance',
            },
          })}
        >
          {children}
        </Box>
      </Container>
    );
  }

  return (
    <TwoSidedLayout>
      <Typography color="primary" sx={{ fontSize: 'lg', fontWeight: 'lg' }}>
        Summarize Your Inbox
      </Typography>
      <Typography
        level="h1"
        sx={{
          fontWeight: 'xl',
          fontSize: 'clamp(1.875rem, 1.3636rem + 2.1818vw, 3rem)',
        }}
      >
        Save countless hours scrolling through your emails
      </Typography>
      <Typography
        textColor="text.secondary"
        sx={{ fontSize: 'lg', lineHeight: 'lg', mb: '10px' }}
      >
        Mark your emails from the last day as read, summarize each in one sentence, and receive them in an email all in <b>one</b> click.
      </Typography>
      <Link href="/login" passHref>
      <Button size="lg" endDecorator={<ArrowForward fontSize="xl" />}>
        Start For Free
      </Button>
    </Link>
    </TwoSidedLayout>
  );
}