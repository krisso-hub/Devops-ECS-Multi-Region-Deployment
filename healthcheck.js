//health check for the container
app.use('/health', function (req, res) {
  res.status(200).json({status: 'pass'})
});
