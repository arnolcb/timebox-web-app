export {};

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          disableAutoSelect: () => void;
          cancel: () => void;
        };
      };
    };
  }
}
