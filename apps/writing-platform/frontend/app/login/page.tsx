import LoginForm from '@/app/components/LoginForm';
import Image from 'next/image';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import Container from '@mui/joy/Container';

export default function SignIn() {
  return (
    <Sheet 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #f0f0f0, #e0e0e0)',
      }}
    >
      <Container 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: {
            xs: '100%',
            sm: '450px',
            md: '500px'
          },
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 4 }
        }}
      >
        <Box 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            mb: 3
          }}
        >
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={200} 
            height={54} 
            className="mb-2"
          />
          <Typography 
            level="h1" 
            sx={{
              textAlign: 'center',
              fontFamily: 'Anton, sans-serif',
              textTransform: 'uppercase',
              fontSize: { xs: 'lg', sm: 'xl' },
              color: 'black',
              mt: 1
            }}
          >
            COLLABORATIVE AI-WRITING
          </Typography>
        </Box>
        
        <Sheet 
          variant="outlined" 
          sx={{
            width: '100%',
            borderRadius: 'md',
            boxShadow: 'md',
            p: { xs: 2, sm: 3 },
            background: 'white'
          }}
        >
          <LoginForm />
        </Sheet>
      </Container>
    </Sheet>
  );
}