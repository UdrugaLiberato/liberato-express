import axios from 'axios';
import env from '../config/env';

/**
 * Test network latency to the store service
 */
export const testStoreServiceLatency = async (): Promise<{
  success: boolean;
  latency: number;
  error?: string;
}> => {
  const startTime = Date.now();

  try {
    // Simple GET request to test connectivity
    await axios.get(`${env.STORE_URL}/health`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Liberato-API-Health-Check'
      }
    });

    const latency = Date.now() - startTime;
    return { success: true, latency };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    return {
      success: false,
      latency,
      error: error?.message || 'Unknown error'
    };
  }
};

/**
 * Test upload performance with a small test file
 */
export const testUploadPerformance = async (): Promise<{
  success: boolean;
  uploadTime: number;
  speed: number; // MB/s
  error?: string;
}> => {
  const startTime = Date.now();
  const testData = Buffer.alloc(1024 * 1024, 'test'); // 1MB test file

  try {
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('files', testData, {
      filename: 'test-upload.bin',
      contentType: 'application/octet-stream'
    });
    formData.append('requestType', 'test');

    await axios.post(`${env.STORE_URL}/upload`, formData, {
      headers: formData.getHeaders(),
      timeout: 30000,
      maxBodyLength: 5 * 1024 * 1024,
    });

    const uploadTime = Date.now() - startTime;
    const speed = (1 / (uploadTime / 1000)); // MB/s

    return { success: true, uploadTime, speed };
  } catch (error: any) {
    const uploadTime = Date.now() - startTime;
    return {
      success: false,
      uploadTime,
      speed: 0,
      error: error?.message || 'Unknown error'
    };
  }
};

/**
 * Log comprehensive network diagnostics
 */
export const logNetworkDiagnostics = async (): Promise<void> => {
  console.log('\n=== Network Diagnostics ===');
  console.log(`Store URL: ${env.STORE_URL}`);
  console.log(`Environment: ${env.NODE_ENV}`);

  // Test basic connectivity
  const latencyTest = await testStoreServiceLatency();
  if (latencyTest.success) {
    console.log(`✅ Store service reachable - Latency: ${latencyTest.latency}ms`);
  } else {
    console.log(`❌ Store service unreachable - Error: ${latencyTest.error} (${latencyTest.latency}ms)`);
  }

  // Test upload performance
  const uploadTest = await testUploadPerformance();
  if (uploadTest.success) {
    console.log(`✅ Upload test successful - ${uploadTest.uploadTime}ms (${uploadTest.speed.toFixed(2)} MB/s)`);
  } else {
    console.log(`❌ Upload test failed - Error: ${uploadTest.error} (${uploadTest.uploadTime}ms)`);
  }

  console.log('=== End Diagnostics ===\n');
};