import {
  AccountInfo,
  NetworkInfo,
  NetworkName,
  PluginProvider,
  SignMessagePayload,
  SignMessageResponse
} from '@aptos-labs/wallet-adapter-core';
import { AptosClient, BCS } from 'aptos';
import { sha3_256 } from 'js-sha3';

interface WelldoneProvider {
  request: (chain: string, args: any) => Promise<any>;
  on: (message: string, listener: (...args: Array<any>) => void) => void;
}

declare global {
  interface Window {
    dapp: WelldoneProvider;
  }
}

export class WelldonePluginProvider implements PluginProvider {
  private _account: AccountInfo | null = null;
  private _networkId: number | null = null;

  async connect() {
    try {
      const account = await window.dapp.request('aptos', {
        method: 'dapp:accounts'
      });
      const accountInfo = {
        address: account['aptos'].address,
        publicKey: account['aptos'].publicKey
      };
      this._account = accountInfo;
      return accountInfo;
    } catch (error) {
      throw new Error('Connect Error: Unlock your WELLDONE Wallet OR Create Account');
    }
  }

  async account() {
    if (this._account) {
      return this._account;
    }
    throw new Error('Account Error: No Account');
  }

  async disconnect() {
    this._account = null;
  }

  async signAndSubmitTransaction(transaction: any, options?: any) {
    if (!this._account) {
      throw new Error('Account Error: No Account');
    }
    if (!this._networkId) {
      throw new Error('Network Error: Not connected to the network');
    }
    try {
      const rawTx = await new AptosClient(this.aptosNodeUrl(this._networkId)).generateTransaction(
        this._account.address,
        transaction,
        options
      );
      const rawTxnWithSalt = `0x${Buffer.concat([
        Buffer.from(sha3_256(Buffer.from('APTOS::RawTransaction', 'ascii')), 'hex'),
        Buffer.from(BCS.bcsToBytes(rawTx))
      ]).toString('hex')}`;

      const txHash = await window.dapp.request('aptos', {
        method: 'dapp:signAndSendTransaction',
        params: [`${rawTxnWithSalt}`]
      });

      return { hash: txHash[0] };
    } catch (error) {
      throw error;
    }
  }

  // TODO: signTransaction
  //   async signTransaction(transaction: any, options?: any) {
  //     if (!this._account) {
  //       throw new Error('Account Error: No Account');
  //     }
  //     if (!this._networkId) {
  //       throw new Error('Network Error: Not connected to the network');
  //     }
  //     try {
  //       const rawTx = await new AptosClient(this.aptosNodeUrl(this._networkId)).generateTransaction(
  //         this._account.address,
  //         transaction
  //       );
  //       const rawTxnWithSalt = `0x${Buffer.concat([
  //         Buffer.from(sha3_256(Buffer.from('APTOS::RawTransaction', 'ascii')), 'hex'),
  //         Buffer.from(BCS.bcsToBytes(rawTx))
  //       ]).toString('hex')}`;

  //       const response = await window.dapp.request('aptos', {
  //         method: 'dapp:signTransaction',
  //         params: [`${rawTxnWithSalt}`]
  //       });
  //       return Buffer.from(response[0].signature, 'hex');
  //     } catch (error) {
  //       throw error;
  //     }
  //   }

  async signMessage(message: SignMessagePayload) {
    if (!this._account) {
      throw new Error('Account Error: No Account');
    }
    if (!this._networkId) {
      throw new Error('Network Error: Not connected to the network');
    }
    let fullMessage = 'APTOS';
    if (message.address) {
      fullMessage += '\naddress: ' + this._account.address;
    }
    if (message.application) {
      fullMessage += '\napplication: ' + window.location.href;
    }
    if (message.chainId) {
      fullMessage += '\nchainId: ' + this._networkId;
    }
    fullMessage += '\nmessage: ' + message.message + '\nnonce: ' + message.nonce;

    try {
      const response = await window.dapp.request('aptos', {
        method: 'dapp:signMessage',
        params: [fullMessage]
      });

      const signMessageResponse: SignMessageResponse = {
        address: this._account.address,
        application: window.location.href,
        chainId: this._networkId,
        fullMessage: fullMessage,
        message: message.message,
        nonce: message.nonce,
        prefix: 'APTOS',
        signature: response[0].signature
      };
      return signMessageResponse;
    } catch (error) {
      throw error;
    }
  }

  async network() {
    const response = await window.dapp.request('aptos', {
      method: 'GET',
      params: [
        {
          url: '/'
        }
      ]
    });
    this._networkId = response.chain_id;
    switch (this._networkId) {
      case 1:
        return 'mainnet' as NetworkName;
      case 2:
        return 'testnet' as NetworkName;
      case 42:
      default:
        return 'devnet' as NetworkName;
    }
  }

  async onAccountChange(listener: (newAddress: AccountInfo) => Promise<void>) {
    window.dapp.on('dapp:accountsChanged', listener);
  }

  async onNetworkChange(listener: (network: { networkName: NetworkInfo }) => Promise<void>) {
    window.dapp.on('dapp:chainChanged', (newNetwork: string) => {
      const networkName = newNetwork.split(':')[1] as NetworkName;
      const network = {
        networkName: {
          name: networkName
        }
      };
      console.log('dapp:chainChanged > ', newNetwork, network);
      listener(network);
    });
  }

  private aptosNodeUrl(chainId: number) {
    switch (chainId) {
      case 1:
        return 'https://fullnode.mainnet.aptoslabs.com/v1';
      case 2:
        return 'https://fullnode.testnet.aptoslabs.com/v1';
      case 42:
      default:
        return 'https://fullnode.devnet.aptoslabs.com/v1';
    }
  }
}