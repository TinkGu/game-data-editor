/**
 * @classdesc
 * A seeded Random Data Generator.
 *
 * Access via `Phaser.Math.RND` which is an instance of this class pre-defined
 * by Phaser. Or, create your own instance to use as you require.
 *
 * The `Math.RND` generator is seeded by the Game Config property value `seed`.
 * If no such config property exists, a random number is used.
 *
 * If you create your own instance of this class you should provide a seed for it.
 * If no seed is given it will use a 'random' one based on Date.now.
 *
 * @class RandomDataGenerator
 * @memberof Phaser.Math
 * @constructor
 * @since 3.0.0
 *
 * @param {(string|string[])} [seeds] - The seeds to use for the random number generator.
 */

export class RandomDataGenerator {
  private c = 1;
  private s0 = 0;
  private s1 = 0;
  private s2 = 0;
  private n = 0;
  /** Signs to choose from. */
  signs: number[] = [-1, 1];

  constructor(seeds?: string[] | string) {
    if (seeds === undefined) {
      seeds = [(Date.now() * Math.random()).toString()];
    }
    if (seeds) {
      this.init(seeds);
    }
  }

  /**
   * Initialize the state of the random data generator.
   *
   * @method Phaser.Math.RandomDataGenerator#init
   * @param {(string|string[])} seeds - The seeds to initialize the random data generator with.
   */
  init(seeds: string | string[]) {
    if (typeof seeds === 'string') {
      this.state(seeds);
    } else {
      this.sow(seeds);
    }
  }

  /**
   * 重置
   * Reset the seed of the random data generator.
   *
   * _Note_: the seed array is only processed up to the first `undefined` (or `null`) value, should such be present.
   *
   * @method Phaser.Math.RandomDataGenerator#sow
   * @param {string[]} seeds - The array of seeds: the `toString()` of each value is used.
   */
  sow(seeds: string[]) {
    // Always reset to default seed
    this.n = 0xefc8249d;
    this.s0 = this.hash(' ');
    this.s1 = this.hash(' ');
    this.s2 = this.hash(' ');
    this.c = 1;

    if (!seeds) {
      return;
    }

    // Apply any seeds
    for (let i = 0; i < seeds.length && seeds[i] != null; i++) {
      const seed = seeds[i];

      this.s0 -= this.hash(seed);
      this.s0 += ~~(this.s0 < 0);
      this.s1 -= this.hash(seed);
      this.s1 += ~~(this.s1 < 0);
      this.s2 -= this.hash(seed);
      this.s2 += ~~(this.s2 < 0);
    }
  }

  /**
   * 通过随机种子获取或恢复序列
   * Gets or Sets the state of the generator. This allows you to retain the values
   * that the generator is using between games, i.e. in a game save file.
   *
   * To seed this generator with a previously saved state you can pass it as the
   * `seed` value in your game config, or call this method directly after Phaser has booted.
   *
   * Call this method with no parameters to return the current state.
   *
   * If providing a state it should match the same format that this method
   * returns, which is a string with a header `!rnd` followed by the `c`,
   * `s0`, `s1` and `s2` values respectively, each comma-delimited.
   *
   * @method Phaser.Math.RandomDataGenerator#state
   *
   * @param {string} [state] - Generator state to be set.
   *
   * @return {string} The current state of the generator.
   */
  private state(state?: string) {
    if (typeof state === 'string' && state.match(/^!rnd/)) {
      const s = state.split(',');

      this.c = parseFloat(s[1]);
      this.s0 = parseFloat(s[2]);
      this.s1 = parseFloat(s[3]);
      this.s2 = parseFloat(s[4]);
    }

    return ['!rnd', this.c, this.s0, this.s1, this.s2].join(',');
  }

  /**
   * Returns a valid RFC4122 version4 ID hex string from https://gist.github.com/1308368
   *
   * @method Phaser.Math.RandomDataGenerator#uuid
   *
   * @return {string} A valid RFC4122 version4 ID hex string
   */
  uuid() {
    let a: string = '';
    let b: string = '';

    // @ts-ignore
    for (b = a = ''; a++ < 36; b += ~a % 5 | ((a * 3) & 4) ? (a ^ 15 ? 8 ^ (this.frac() * (a ^ 20 ? 16 : 4)) : 4).toString(16) : '-') {
      // eslint-disable-next-line no-empty
    }

    return b;
  }

  /**
   * Returns a random integer between 0 and 2^32.
   *
   * @method Phaser.Math.RandomDataGenerator#integer
   * @return {number} A random integer between 0 and 2^32.
   */
  integer() {
    // 2^32
    return this.rnd() * 0x100000000;
  }

  /**
   * Returns a random real number between 0 and 1.
   *
   * @method Phaser.Math.RandomDataGenerator#frac
   * @return {number} A random real number between 0 and 1.
   */
  frac() {
    // 2^-53
    return this.rnd() + ((this.rnd() * 0x200000) | 0) * 1.1102230246251565e-16;
  }

  /**
   * Returns a random real number between 0 and 2^32.
   *
   * @method Phaser.Math.RandomDataGenerator#real
   * @return {number} A random real number between 0 and 2^32.
   */
  real() {
    return this.integer() + this.frac();
  }

  /**
   * Returns a random integer between and including min and max.
   * This method is an alias for RandomDataGenerator.integerInRange.
   *
   * @method Phaser.Math.RandomDataGenerator#between
   *
   * @param {number} min - The minimum value in the range.
   * @param {number} max - The maximum value in the range.
   *
   * @return {number} A random number between min and max.
   */
  between(min: number, max: number) {
    return Math.floor(this.realInRange(0, max - min + 1) + min);
  }

  /** 返回一个 [min, max] 之间的随机数 */
  range(min: number, max: number) {
    return this.between(min, max);
  }

  /**
   * Returns a random real number between min and max.
   *
   * @method Phaser.Math.RandomDataGenerator#realInRange
   * @param {number} min - The minimum value in the range.
   * @param {number} max - The maximum value in the range.
   *
   * @return {number} A random number between min and max.
   */
  realInRange(min: number, max: number) {
    return this.frac() * (max - min) + min;
  }

  /** 在列表中随机抽取一个元素 */
  pickList<T = any>(list: T[]) {
    return list[this.range(0, list.length - 1)];
  }

  /** 从数组中随机抽取一些元素，且不重复（针对下标） */
  pickSome<T = any>(list: T[], count: number) {
    if (!count || count <= 0) return [];
    return this.shuffle([...list]).slice(0, count);
  }

  /** 在 set 中随机抽取一个元素 */
  pickSet<T = any>(set: Set<T>) {
    return [...set][this.range(0, set.size - 1)];
  }

  /** 在枚举 or map 中随机抽取一个元素 */
  pickEnum<T extends string, V extends string | number>(e: { [key in T]: V }, options?: { blacks?: V[] }) {
    // TODO: 实现 black 逻辑
    return this.pickList(Object.values(e)) as V;
  }

  /**
   * Returns a random element from within the given array, favoring the earlier entries.
   *
   * @method Phaser.Math.RandomDataGenerator#weightedPick
   *
   * @generic T
   * @genericUse {T[]} - [array]
   * @genericUse {T} - [$return]
   *
   * @param {T[]} array - The array to pick a random element from.
   *
   * @return {T} A random member of the array.
   */
  weightedPick<T = any>(array: T[]) {
    return array[~~(Math.pow(this.frac(), 2) * (array.length - 1) + 0.5)];
  }

  /**
   * Returns a random timestamp between min and max, or between the beginning of 2000 and the end of 2020 if min and max aren't specified.
   *
   * @method Phaser.Math.RandomDataGenerator#timestamp
   *
   * @param {number} min - The minimum value in the range.
   * @param {number} max - The maximum value in the range.
   *
   * @return {number} A random timestamp between min and max.
   */
  timestamp(min: number, max: number) {
    return this.realInRange(min || 946684800000, max || 1577862000000);
  }

  /**
   * 打乱当前数组
   * Shuffles the given array, using the current seed.
   *
   * @method Phaser.Math.RandomDataGenerator#shuffle
   *
   * @generic T
   * @genericUse {T[]} - [array,$return]
   *
   * @param {T[]} [array] - The array to be shuffled.
   *
   * @return {T[]} The shuffled array.
   */
  shuffle<T = any>(array: T[]) {
    const len = array.length - 1;

    for (let i = len; i > 0; i--) {
      const randomIndex = Math.floor(this.frac() * (i + 1));
      const itemAtIndex = array[randomIndex];

      array[randomIndex] = array[i];
      array[i] = itemAtIndex;
    }

    return array;
  }

  /**
   * Returns a random real number between -1 and 1.
   *
   * @method Phaser.Math.RandomDataGenerator#normal
   *
   * @return {number} A random real number between -1 and 1.
   */
  normal() {
    return 1 - 2 * this.frac();
  }

  /**
   * Returns a sign to be used with multiplication operator.
   *
   * @method Phaser.Math.RandomDataGenerator#sign
   *
   * @return {number} -1 or +1.
   */
  sign() {
    return this.pickList(this.signs);
  }

  /**
   * Returns a random angle between -180 and 180.
   *
   * @method Phaser.Math.RandomDataGenerator#angle
   *
   * @return {number} A random number between -180 and 180.
   */
  angle() {
    return this.range(-180, 180);
  }

  /**
   * Returns a random rotation in radians, between -3.141 and 3.141
   *
   * @method Phaser.Math.RandomDataGenerator#rotation
   *
   * @return {number} A random number between -3.141 and 3.141
   */
  rotation() {
    return this.realInRange(-3.1415926, 3.1415926);
  }

  private rnd() {
    const t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32

    this.c = t | 0;
    this.s0 = this.s1;
    this.s1 = this.s2;
    this.s2 = t - this.c;

    return this.s2;
  }

  /**
   * Internal method that creates a seed hash.
   *
   * @method Phaser.Math.RandomDataGenerator#hash
   * @since 3.0.0
   *
   * @param {string} data - The value to hash.
   *
   * @return {number} The hashed value.
   */
  private hash(data: string) {
    let h;
    let n = this.n;

    data = data.toString();

    for (var i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }

    this.n = n;

    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  }
}

// TODO: 保存种子和自动恢复
export const RND = new RandomDataGenerator();

/** 根据概率，返回对应的元素【序号】 */
export function pickByRate(nums: number[]) {
  const n = RND.range(0, 100);
  let left = 0;
  let right = 0;
  for (let i = 0; i <= nums.length; i++) {
    right = nums[i] + left;
    if (right >= n) {
      return i;
    }
    left = right;
  }
  return nums.length - 1;
}

/** 计算概率 */
export function checkRate(n: number) {
  return RND.range(0, 100) <= n;
}
