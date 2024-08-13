import { cwd, fs as fileStore, path } from './deps.node.js';

type Serializer<Session> = (input: Session) => string;
type Deserializer<Session> = (input: string) => Session;
interface ConstructorOptions<Session> {
  dirName?: string;
  serializer?: Serializer<Session>;
  deserializer?: Deserializer<Session>;
  folderName?: string;
}

export class FileAdapter<T> {
  private folderPath;
  serializer: Serializer<T>;
  deserializer: Deserializer<T>;
  folderName?: string;

  constructor(opts?: ConstructorOptions<T>) {
    var _a, _b, _c;
    this.folderPath = path.resolve(cwd(), (_a = opts === null || opts === void 0 ? void 0 : opts.dirName) !== null && _a !== void 0 ? _a : 'sessions');
    this.serializer = (_b = opts?.serializer) !== null && _b !== void 0 ? _b : ((input) => JSON.stringify(input, null, '\t'));
    this.deserializer = (_c = opts?.deserializer) !== null && _c !== void 0 ? _c : ((input) => JSON.parse(input));
    fileStore.ensureDirSync(this.folderPath);
    this.folderName = opts?.folderName;
  }
  private resolveSessionPath(key: string) {
    if (this.folderName) {
      return path.resolve(this.folderPath, this.folderName, `${key}.json`);
    }
    const subFolder = key.substr(-2);
    return path.resolve(this.folderPath, subFolder, `${key}.json`);
  }
  private async findSessionFile(key: string) {
    try {
      return await fileStore.readFile(this.resolveSessionPath(key));
    }
    catch {
      return null;
    }
  }
  async read(key: string) {
    const file = await this.findSessionFile(key);
    if (!file) {
      return undefined;
    }
    return this.deserializer(file);
  }
  async write(key: string, value: T) {
    const fullPath = this.resolveSessionPath(key);
    const fileName = `${key}.json`;
    const folderPath = fullPath.substring(0, fullPath.length - fileName.length);
    await fileStore.ensureDir(folderPath);
    await fileStore.writeFile(fullPath, this.serializer(value));
  }
  async delete(key: string) {
    await fileStore.remove(this.resolveSessionPath(key));
  }
}
