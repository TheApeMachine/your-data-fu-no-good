const PRIME = 4294967291; // A large prime number
const MAX_HASH = 2 ** 32 - 1;

// MurmurHash3 implementation (non-cryptographic hash function, good for this use case)
function murmur3(key: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;

  for (let i = 0; i < key.length; i++) {
    const ch = key.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967295 & (h2 ^ (h1 >>> 16));
}

export class MinHash {
  private numPerm: number;
  private hashValues: number[];
  private permutations: { a: number[]; b: number[] };

  constructor(numPerm = 128) {
    this.numPerm = numPerm;
    this.hashValues = new Array(numPerm).fill(MAX_HASH);

    this.permutations = { a: [], b: [] };
    for (let i = 0; i < numPerm; i++) {
        this.permutations.a.push(Math.floor(Math.random() * MAX_HASH));
        this.permutations.b.push(Math.floor(Math.random() * MAX_HASH));
    }
  }

  update(value: string): void {
    for (let i = 0; i < this.numPerm; i++) {
        const h = (this.permutations.a[i] * murmur3(value) + this.permutations.b[i]) % PRIME;
        if (h < this.hashValues[i]) {
            this.hashValues[i] = h;
        }
    }
  }

  jaccard(other: MinHash): number {
    if (this.numPerm !== other.numPerm) {
      throw new Error('MinHash sketches must have the same number of permutations');
    }
    let intersection = 0;
    for (let i = 0; i < this.numPerm; i++) {
      if (this.hashValues[i] === other.hashValues[i]) {
        intersection++;
      }
    }
    return intersection / this.numPerm;
  }

  serialize(): string {
      return JSON.stringify(this.hashValues);
  }

  static deserialize(data: string, numPerm = 128): MinHash {
      const hashValues = JSON.parse(data);
      if (!Array.isArray(hashValues) || hashValues.length !== numPerm) {
          throw new Error('Invalid data for MinHash deserialization');
      }
      const minhash = new MinHash(numPerm);
      minhash.hashValues = hashValues;
      // Note: Permutations will be random and different, but this doesn't affect Jaccard similarity calculation with another serialized MinHash.
      return minhash;
  }
}
