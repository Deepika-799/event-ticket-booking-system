import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import type { Booking, Event } from '../src/types.ts';

export type Store = {
  events: Event[];
  bookings: Booking[];
};

const DATA_DIR = path.join(process.cwd(), 'server');
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const require = createRequire(import.meta.url);

const seed = (): Store => {
  const { SAMPLE_EVENTS } = require('../src/data');
  return { events: SAMPLE_EVENTS, bookings: [] };
};

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const init = seed();
    fs.writeFileSync(DATA_FILE, JSON.stringify(init, null, 2), 'utf-8');
  }
}

export function readStore(): Store {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const parsed = JSON.parse(raw) as Store;
  if (!parsed?.events || !parsed?.bookings) {
    const init = seed();
    fs.writeFileSync(DATA_FILE, JSON.stringify(init, null, 2), 'utf-8');
    return init;
  }
  return parsed;
}

export function writeStore(next: Store) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(next, null, 2), 'utf-8');
}

