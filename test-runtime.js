import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SubscriptionPage } from './src/pages/SubscriptionPage.jsx';

// Mock context and router
jest.mock('react-router-dom', () => ({
  useNavigate: () => () => {},
}));
jest.mock('./src/context/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { id: '123', role: 'driver' } }),
}));
jest.mock('./src/lib/supabase.js', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({ data: [], error: null })
      })
    })
  }
}));

try {
  console.log('Rendering...');
  const html = renderToStaticMarkup(<SubscriptionPage />);
  console.log('Render successful!', html.substring(0, 100));
} catch (e) {
  console.error('RUNTIME ERROR:', e);
}
