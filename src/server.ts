import app from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 AetherBridge Backend running tightly securely on port ${PORT}`);
  console.log(`🛡️  Monitoring & DLP APIs ready.`);
});
