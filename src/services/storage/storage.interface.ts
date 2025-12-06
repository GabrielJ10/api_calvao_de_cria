export interface IStorageResult {
  url: string;
  public_id: string;
}

export interface IStorageProvider {
  uploadFromBuffer(buffer: Buffer, filename: string): Promise<IStorageResult>;
  uploadFromUrl(url: string): Promise<IStorageResult>;
  delete(publicId: string): Promise<any>;
}
