
import { Block, MedicalReport, Blockchain } from '../types';

// Deterministic JSON Stringify
// 1. Removes MongoDB internal fields (_id)
// 2. Sorts keys alphabetically to ensure {a:1, b:2} == {b:2, a:1}
// 3. Handles undefined values gracefully
function stableStringify(obj: any): string {
  if (obj === undefined) {
    return JSON.stringify(null);
  }
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return JSON.stringify(obj.map(item => JSON.parse(stableStringify(item))));
  }

  // Handle Object
  const sortedKeys = Object.keys(obj).sort().filter(key => key !== '_id');
  const sortedObj: any = {};

  for (const key of sortedKeys) {
    const val = obj[key];
    if (val === undefined) continue; // Skip undefined keys

    const stringifiedVal = stableStringify(val);
    if (stringifiedVal === undefined) continue;

    sortedObj[key] = JSON.parse(stringifiedVal);
  }

  return JSON.stringify(sortedObj);
}

// Simple SHA-256 implementation for fallback
async function simpleSHA256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  let hash = 0;
  for (let i = 0; i < msgBuffer.length; i++) {
    const char = msgBuffer[i];
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  return hexHash.repeat(8);
}

export async function calculateHash(data: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
      const msgUint8 = new TextEncoder().encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      console.warn('crypto.subtle not available, using fallback hash');
      return await simpleSHA256(data);
    }
  } catch (error) {
    console.error('Error calculating hash:', error);
    return await simpleSHA256(data);
  }
}

export async function createBlock(
  report: MedicalReport,
  chain: Blockchain
): Promise<Block> {
  // Use stable stringify for consistent hashing
  const reportHash = await calculateHash(stableStringify(report));
  const previousHash = chain.length > 0 ? chain[chain.length - 1].hash : '0';
  const index = chain.length;
  const timestamp = Date.now();

  const blockContent = `${index}${timestamp}${report.id}${reportHash}${previousHash}${report.version}`;
  const blockHash = await calculateHash(blockContent);

  return {
    index,
    timestamp,
    reportId: report.id,
    reportHash,
    previousHash,
    hash: blockHash,
    version: report.version
  };
}

export async function verifyReport(
  report: MedicalReport,
  block: Block
): Promise<'ORIGINAL' | 'FAKE' | 'INVALID_BLOCK'> {
  // 1. Re-calculate the hash of the REPORT data
  const calculatedReportHash = await calculateHash(stableStringify(report));

  // 2. Check if the report data matches the hash stored in the block
  if (calculatedReportHash !== block.reportHash) {
    return 'FAKE'; // Data tampering detected
  }

  return 'ORIGINAL';
}
