import { ioWalletApiByVersion, type IoWalletApi, type ItwVersion } from './api';

type DigitalWalletConfig = {
  /**
   * IT-Wallet specifications version.
   */
  version: ItwVersion;
};

/**
 * Instantiate `IoWallet` SDK for a specific IT-Wallet version.
 *
 * After initialization, each feature can be accessed under the corresponding namespace.
 *
 * @example
 * const wallet = new IoWallet({ version: "1.0.0" })
 * wallet.Credential.Issuance.exampleMethod()
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class IoWallet {
  #version: ItwVersion;

  /**
   * Get the IT-Wallet specifications version bound to this instance.
   */
  get version() {
    return this.#version;
  }

  constructor({ version }: DigitalWalletConfig) {
    this.#version = version;
    const walletApi = ioWalletApiByVersion[version];

    if (!walletApi) {
      throw new Error(
        `Invalid version provided: IoWallet does not implement ${version} specifications.`
      );
    }

    // Dynamically add features implementations aligned with the specified version
    for (const feature of Object.keys(walletApi) as (keyof IoWalletApi)[]) {
      Object.defineProperty(this, feature, {
        enumerable: true,
        configurable: false,
        value: walletApi[feature]
      });
    }
  }
}

// eslint-disable-next-line no-redeclare, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unsafe-declaration-merging, @typescript-eslint/no-empty-interface
export interface IoWallet extends IoWalletApi {}
