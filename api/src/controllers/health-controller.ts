import { Request, Response } from 'express';
import { sendSuccess } from '../utils/controller-utils';
import os from 'os';
import fs from 'fs';
import { promisify } from 'util';
import { execSync } from 'child_process';

const stat = promisify(fs.stat);

/**
 * Get memory usage information
 */
const getMemoryUsage = () => {
  const used = process.memoryUsage();
  const total = os.totalmem();
  const free = os.freemem();

  return {
    system: {
      total: Math.round(total / 1024 / 1024), // MB
      free: Math.round(free / 1024 / 1024), // MB
      used: Math.round((total - free) / 1024 / 1024), // MB
      usage_percentage: Math.round(((total - free) / total) * 100)
    },
    process: {
      rss: Math.round(used.rss / 1024 / 1024), // MB
      heap_total: Math.round(used.heapTotal / 1024 / 1024), // MB
      heap_used: Math.round(used.heapUsed / 1024 / 1024), // MB
      external: Math.round(used.external / 1024 / 1024), // MB
      heap_usage_percentage: Math.round((used.heapUsed / used.heapTotal) * 100)
    }
  };
};

/**
 * Get CPU usage information
 */
const getCpuUsage = () => {
  const cpus = os.cpus();
  const loadAvg = os.loadavg();

  return {
    cores: cpus.length,
    model: cpus[0]?.model || 'Unknown',
    load_average: {
      '1m': Math.round(loadAvg[0] * 100) / 100,
      '5m': Math.round(loadAvg[1] * 100) / 100,
      '15m': Math.round(loadAvg[2] * 100) / 100
    },
    usage_percentage: Math.round((loadAvg[0] / cpus.length) * 100)
  };
};

/**
 * Get disk usage information using df command
 */
const getDiskUsage = async () => {
  try {
    const path = process.cwd();

    // Use df command to get disk usage (works on Unix-like systems)
    const command = os.platform() === 'win32'
      ? `powershell "Get-PSDrive -PSProvider FileSystem | Where-Object {$_.Root -eq '${path.split(':')[0]}:'} | Select-Object Used,Free,Size"`
      : `df -h "${path}" | tail -1`;

    const output = execSync(command, { encoding: 'utf8' });

    if (os.platform() === 'win32') {
      // Windows implementation would need more parsing
      return {
        path,
        platform: 'windows',
        note: 'Windows disk usage - consider implementing PowerShell parsing'
      };
    } else {
      // Parse Unix df output
      const parts = output.trim().split(/\s+/);
      if (parts.length >= 6) {
        const size = parts[1];
        const used = parts[2];
        const available = parts[3];
        const usagePercent = parts[4];
        const mountPoint = parts[5];

        return {
          path,
          mount_point: mountPoint,
          total_size: size,
          used_size: used,
          available_size: available,
          usage_percentage: parseInt(usagePercent.replace('%', '')) || 0,
          filesystem: parts[0] || 'unknown'
        };
      }
    }

    return {
      path,
      note: 'Unable to parse disk usage output'
    };
  } catch (error) {
    return {
      path: process.cwd(),
      error: 'Unable to get disk statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Health check endpoint
 * Returns the status of the API service with system metrics
 */
export const getHealth = async (request: Request, response: Response) => {
  try {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      system: {
        platform: os.platform(),
        arch: os.arch(),
        node_version: process.version,
        hostname: os.hostname()
      },
      memory: getMemoryUsage(),
      cpu: getCpuUsage(),
      disk: await getDiskUsage()
    };

    sendSuccess(response, healthData);
  } catch (error) {
    response.status(503).json({
      status: 'error',
      message: 'Service unavailable',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};