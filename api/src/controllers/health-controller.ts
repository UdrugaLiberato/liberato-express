import { Request, Response } from 'express';
import { sendSuccess } from '../utils/controller-utils';
import os from 'node:os';
import { execSync } from 'node:child_process';

/**
 * Get available disk size using df command
 */
const getAvailableDiskSize = async () => {
  try {
    const path = process.cwd();

    // Use df command to get disk usage (works on Unix-like systems)
    const command =
      os.platform() === 'win32'
        ? `powershell "Get-PSDrive -PSProvider FileSystem | Where-Object {$_.Root -eq '${path.split(':')[0]}:'} | Select-Object Free"`
        : `df -h "${path}" | tail -1`;

    // eslint-disable-next-line sonarjs/os-command
    const output = execSync(command, { encoding: 'utf8' });

    if (os.platform() === 'win32') {
      return 'N/A';
    }
    // Parse Unix df output
    const parts = output.trim().split(/\s+/);
    if (parts.length >= 4) {
      return parts[3]; // Available size
    }

    return 'N/A';
  } catch {
    return 'N/A';
  }
};

/**
 * Health check endpoint
 * Returns simplified status with essential metrics only
 */
export default async function getHealth(request: Request, response: Response) {
  try {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;

    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      cores: os.cpus().length,
      available_size: await getAvailableDiskSize(),
      total_ram: Math.round(total / 1024 / 1024), // MB
      used_ram: Math.round(used / 1024 / 1024), // MB
    };

    sendSuccess(response, healthData);
  } catch (error) {
    response.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
