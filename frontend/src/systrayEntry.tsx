import { createRoot } from 'react-dom/client';

function SystrayApp() {
  return (
    <div style={{ padding: 16, fontFamily: 'Inter, sans-serif' }}>
      <h3 style={{ margin: 0 }}>Foundation Systray</h3>
      <p style={{ fontSize: 13, color: '#666' }}>Panel is working!</p>
    </div>
  );
}

const root = document.getElementById('systray-root');
if (root) {
  createRoot(root).render(<SystrayApp />);
}
