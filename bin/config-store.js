import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export function createStore(filePath) {
  async function readData() {
    try {
      const content = await readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      if (err.code === 'ENOENT') return {};
      throw err;
    }
  }

  async function writeData(data) {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  return {
    async config(key, ...args) {
      const data = await readData();

      // get
      if (args.length === 0) {
        return data[key];
      }

      const value = args[0];

      // delete
      if (value === null) {
        delete data[key];
        await writeData(data);
        return;
      }

      // set
      data[key] = value;
      await writeData(data);
    },

    async all() {
      return readData();
    },
  };
}
