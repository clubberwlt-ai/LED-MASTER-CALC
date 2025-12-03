// Fix: Removed reference to 'vite/client' which was not found and caused error.
// Added type definition for process.env to support API_KEY usage in the app.
declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  };
};