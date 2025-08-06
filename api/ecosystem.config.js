module.exports = {
  apps: [{
    name: 'backend_map',
    script: 'dist/index.js',
    instances: 1, // Single instance to avoid upload conflicts
    exec_mode: 'fork', // Fork mode for better file upload handling
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    // Performance optimizations
    max_memory_restart: '512M', // Restart if memory exceeds 512MB
    watch: false, // Disable watch in production
    ignore_watch: ['uploads', 'node_modules', 'logs'],
    
    // Logging configuration
    log_file: '/home/stipo/app/logs/combined.log',
    out_file: '/home/stipo/app/logs/out.log',
    error_file: '/home/stipo/app/logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Graceful handling for uploads
    kill_timeout: 30000, // 30 seconds to allow uploads to complete
    wait_ready: true,
    listen_timeout: 10000,
    
    // Environment variables
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      // Add any production-specific env vars here
    },
    
    // Auto-restart settings
    restart_delay: 4000,
    max_restarts: 5,
    min_uptime: '10s'
  }]
};