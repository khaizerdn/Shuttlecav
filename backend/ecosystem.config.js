module.exports = {
    apps: [{
      name: 'backend',                    // Name of the app in PM2
      script: '/home/ubuntu/Shuttlecav/backend/server.js', // Path to your main script
      instances: 1,                       // Number of instances (1 for fork mode)
      exec_mode: 'fork',                  // Run in fork mode
      autorestart: true,                  // Automatically restart if the app crashes
      max_restarts: 10,                   // Max restarts before giving up
      restart_delay: 1000,                // Delay between restarts (1 second)
      watch: false,                       // Disable file watching
      max_memory_restart: '1500M',        // Restart if memory exceeds 1.5GB (1500MB)
      cron_restart: '0 2 * * *',          // Restart daily at 2:00 AM HKT (UTC+8)
      env: {
        NODE_ENV: 'production',           // Production environment
        PORT: 5000                        // Port set to 5000
      },
      error_file: '/root/.pm2/logs/backend-error.log', // Existing log path
      out_file: '/root/.pm2/logs/backend-out.log',    // Existing log path
      log_date_format: 'YYYY-MM-DD HH:mm:ss',         // Consistent log timestamps
    }]
  };