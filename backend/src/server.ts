import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[GRCTrack] Server running on port ${PORT}`);
  console.log(`[GRCTrack] Environment: ${process.env.NODE_ENV || 'development'}`);
});
