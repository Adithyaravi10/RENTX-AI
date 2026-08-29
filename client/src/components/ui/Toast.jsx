import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#13131a',
          color: '#e2e8f0',
          border: '1px solid #1e1e2e',
          borderRadius: '12px',
        },
        success: { iconTheme: { primary: '#00ff87', secondary: '#13131a' } },
        error: { iconTheme: { primary: '#ff3b5c', secondary: '#13131a' } },
      }}
    />
  );
}
