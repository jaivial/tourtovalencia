interface IFtpClient extends NodeJS.EventEmitter {
  on(event: string, callback: (...args: any[]) => void): this;
  connect(options: {
    host: string;
    user: string;
    password: string;
  }): void;
  put(buffer: Buffer, path: string, callback: (err?: Error) => void): void;
  end(): void;
}

declare const FtpClientModule: {
  new(): IFtpClient;
};

export = FtpClientModule;
