# PM2 Upload Performance Optimization Guide

## Problem Summary
- **Local uploads**: ~2-3 seconds for 20MB images
- **Production uploads**: ~20 seconds for the same images
- **Root cause**: Network latency to external store service `https://store.udruga-liberato.hr/upload`

## Changes Made

### 1. Enhanced Upload Processing (`api/src/controllers/category-controller.ts`)

**Optimizations:**
- ✅ Connection keep-alive for HTTP requests
- ✅ Increased timeout from 30s to 60s
- ✅ Added upload progress monitoring
- ✅ Enhanced error logging with timing and bandwidth data
- ✅ HTTP agent optimization for better connection reuse
- ✅ Comprehensive performance metrics (MB/s, timing)

**Monitoring Features:**
- File size and upload speed logging
- Progress tracking every 20%
- Detailed error categorization (network vs service errors)
- Bandwidth calculation in MB/s

### 2. PM2 Configuration (`api/ecosystem.config.js`)

**Production Optimizations:**
- Single instance mode to avoid upload conflicts
- Fork mode for better file upload handling
- 30-second graceful shutdown for ongoing uploads
- Memory limit (512MB) with auto-restart
- Comprehensive logging setup
- Auto-restart protection (max 5 restarts)

### 3. Network Diagnostics (`api/src/utils/network-diagnostics.ts`)

**Features:**
- Store service connectivity testing
- Upload performance benchmarking
- Latency measurement
- Automatic diagnostics on production startup

### 4. Updated Deployment Process

**Improved GitHub Actions workflow:**
- Uses PM2 ecosystem configuration
- Creates log directories
- Proper environment variable setup
- Graceful reload instead of stop/start

## Deployment Instructions

### First-time Setup on Production Servers:

1. **Create log directory:**
   ```bash
   mkdir -p /home/stipo/app/logs
   ```

2. **Initial PM2 setup:**
   ```bash
   cd /home/stipo/app
   pm2 delete backend_map  # Remove old process
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup  # Configure auto-start
   ```

### Regular Deployments:

Your GitHub Actions workflow will now automatically:
- Deploy code to all servers (web1, web2, web3)
- Build the application
- Reload PM2 with new configuration
- Run network diagnostics on startup

### Manual Deployment:

```bash
cd /home/stipo/app
git pull origin main
bun install
bun run build
pm2 reload ecosystem.config.js --env production
```

## Monitoring & Troubleshooting

### 1. Check Upload Performance

**PM2 Logs:**
```bash
pm2 logs backend_map --lines 100
```

**Look for these log patterns:**
```
[categoryId] Starting upload - File: 20.5MB to https://store.udruga-liberato.hr
[categoryId] Upload progress: 40% (8000ms elapsed)
[categoryId] ✅ Upload successful - 15000ms total (1.37 MB/s)
```

### 2. Network Diagnostics

The server automatically runs diagnostics on startup in production. Look for:
```
=== Network Diagnostics ===
Store URL: https://store.udruga-liberato.hr
✅ Store service reachable - Latency: 150ms
✅ Upload test successful - 2500ms (0.40 MB/s)
=== End Diagnostics ===
```

### 3. PM2 Status Check

```bash
pm2 status
pm2 show backend_map
```

### 4. Performance Analysis

**Good Performance Indicators:**
- Store service latency < 200ms
- Upload speed > 0.5 MB/s
- No timeout errors in logs

**Red Flags:**
- Store service latency > 500ms
- Upload speed < 0.1 MB/s
- Frequent ECONNABORTED errors
- Memory usage consistently near 512MB

## Expected Improvements

### Realistic Expectations:
- **Local**: 2-3 seconds (baseline)
- **Production (optimized)**: 5-10 seconds (60-80% improvement)
- **Production (worst case)**: 12-15 seconds (25-40% improvement)

### Factors Affecting Performance:
1. **Network latency** between servers and store service
2. **Store service performance** and load
3. **Server resources** (CPU, memory, network bandwidth)
4. **File size** and image complexity

## Additional Recommendations

### For Further Optimization:

1. **Image Compression:**
   ```javascript
   // Consider adding image compression before upload
   const sharp = require('sharp');
   const compressedBuffer = await sharp(inputBuffer)
     .jpeg({ quality: 80 })
     .toBuffer();
   ```

2. **Regional Store Service:**
   - Deploy store service closer to your production servers
   - Use CDN or edge caching for uploads

3. **Retry Logic:**
   ```javascript
   // Add retry logic for failed uploads
   const maxRetries = 3;
   let attempt = 0;
   while (attempt < maxRetries) {
     try {
       await uploadToStore();
       break;
     } catch (error) {
       attempt++;
       if (attempt === maxRetries) throw error;
       await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
     }
   }
   ```

4. **Upload Queue:**
   - Implement Redis-based job queue for upload processing
   - Process multiple uploads in parallel with controlled concurrency

### Monitoring Setup:

1. **Set up alerts for:**
   - Upload times > 15 seconds
   - Upload failure rate > 5%
   - Store service latency > 1 second

2. **Performance metrics to track:**
   - Average upload time by file size
   - Success/failure rates
   - Network latency trends
   - Server resource usage during uploads

## Rollback Plan

If issues occur, rollback with:
```bash
cd /home/stipo/app
git checkout HEAD~1  # Go back one commit
bun install
bun run build
pm2 reload ecosystem.config.js --env production
```

## Contact & Support

Monitor the enhanced logs for detailed performance data. The new logging will help identify whether the bottleneck is:
- Network connectivity to store service
- Store service processing time
- Server resource constraints
- File upload configuration issues