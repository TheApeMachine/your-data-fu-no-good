import { recordForensicEvent as tsRecordForensicEvent } from './forensics';

// Re-export TypeScript implementations for JS consumers.

export async function recordForensicEvent(db, input) {
  return tsRecordForensicEvent(db, input);
}

export async function recordForensicEvents(db, events) {
  const module = await import('./forensics');
  return module.recordForensicEvents(db, events);
}

export async function createForensicCase(db, input) {
  const module = await import('./forensics');
  return module.createForensicCase(db, input);
}

export async function linkEventsToCase(db, caseId, eventIds) {
  const module = await import('./forensics');
  return module.linkEventsToCase(db, caseId, eventIds);
}

export async function updateForensicCaseStatus(db, caseId, status, updates = {}) {
  const module = await import('./forensics');
  return module.updateForensicCaseStatus(db, caseId, status, updates);
}

export async function fetchActiveForensicCases(db, sessionId) {
  const module = await import('./forensics');
  return module.fetchActiveForensicCases(db, sessionId);
}
