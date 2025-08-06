module.exports = {
  apps: [{
    name: 'backend_map',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    
    // Environment configuration
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    
    // Performance and reliability settings
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 5,
    min_uptime: '10s',
    
    // Process management
    watch: false,
    ignore_watch: ['node_modules', 'uploads', 'logs', 'dist'],
    
    // Logging
    log_file: 'logs/combined.log',
    out_file: 'logs/out.log',
    error_file: 'logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    
    // Advanced settings
    source_map_support: true,
    instance_var: 'INSTANCE_ID',
    
    // Health monitoring
    automation: false,
    autorestart: true,
  }]
};