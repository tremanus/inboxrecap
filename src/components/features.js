import React from 'react';
import Button from '@mui/joy/Button';
import Link from '@mui/joy/Link';
import Typography from '@mui/joy/Typography';
import ArrowForward from '@mui/icons-material/ArrowForward';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Container from '@mui/joy/Container';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import { typographyClasses } from '@mui/joy/Typography';

// Combined Features Component
export default function Features() {
  function TwoSidedLayout({ children, reversed }) {
    return (
        <>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 20,
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
            <Typography sx={{ color: 'black' }}>Core Features</Typography>
          </Button>
        </Box>
      <Container
        sx={[
          theme => ({
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            pb: 10,
            gap: 4,
            [theme.breakpoints.up(834)]: {
              flexDirection: 'row',
              gap: 6,
            },
            [theme.breakpoints.up(1199)]: {
              gap: 12,
            },
          }),
          reversed ? { flexDirection: 'column-reverse' } : { flexDirection: 'column' },
        ]}
      >
        <Box
          sx={theme => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            maxWidth: '50ch',
            textAlign: 'center',
            flexShrink: 999,
            [theme.breakpoints.up(834)]: {
              minWidth: 420,
              alignItems: 'flex-start',
              textAlign: 'initial',
            },
            [`& .${typographyClasses.root}`]: {
              textWrap: 'balance',
            },
          })}
        >
          {children}
        </Box>
        <AspectRatio
          ratio={600 / 520}
          variant="outlined"
          maxHeight={300}
          sx={theme => ({
            minWidth: 300,
            alignSelf: 'stretch',
            [theme.breakpoints.up(834)]: {
              alignSelf: 'initial',
              flexGrow: 1,
              '--AspectRatio-maxHeight': '520px',
              '--AspectRatio-minHeight': '400px',
            },
            borderRadius: 'sm',
            bgcolor: 'background.level2',
            flexBasis: '50%',
          })}
        >
          <img
            src="https://images.unsplash.com/photo-1483791424735-e9ad0209eea2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
            alt=""
          />
        </AspectRatio>
      </Container>
      </>
    );
  }

  return (
    <TwoSidedLayout>
      <Typography color="primary" sx={{ fontSize: 'lg', fontWeight: 'lg' }}>
        Clear Your Inbox
      </Typography>
      <Typography
        level="h1"
        sx={{
          fontWeight: 'xl',
          fontSize: 'clamp(1.875rem, 1.3636rem + 2.1818vw, 3rem)',
        }}
      >
        Unsubscribe from your bothersome mailing lists and top senders
      </Typography>
      <Typography
        textColor="text.secondary"
        sx={{ fontSize: 'lg', lineHeight: 'lg' }}
      >
        A descriptive secondary text placeholder. Use it to explain your business
        offer better.
      </Typography>
      <Button size="lg" endDecorator={<ArrowForward fontSize="xl" />}>
        Get Started
      </Button>
    </TwoSidedLayout>
  );
}
