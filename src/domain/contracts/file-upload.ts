export type Params = {
  id: string;
  file: {
    filename: string;
    content: Buffer;
    contentType: string;
  };
};

export interface FileUpload {
  upload(params: Params): Promise<string>;
}
