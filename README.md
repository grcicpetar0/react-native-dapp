# create-react-native-dapp

<p align="center">
  <img src="public/logo.png" width="100" />
</p>

![https://img.shields.io/badge/strictly-typescript-blue](https://img.shields.io/badge/types-typescript-blue)
![https://img.shields.io/badge/platforms-android%2Cios%2Cweb-brightgreen](https://img.shields.io/badge/platforms-android%2Cios%2Cweb-brightgreen)
![https://img.shields.io/badge/powered--by-ganache-orange](https://img.shields.io/badge/powered--by-ganache-orange)
[![https://img.shields.io/badge/chat-on%20discord-red](https://img.shields.io/badge/chat-on%20discord-red)](https://discord.gg/PeqrwpCDwc)

[`create-react-native-dapp`](https://github.com/cawfree/create-react-native-dapp) is an `npx` utility to help quickly bootstrap [**React Native ⚛️**](https://reactnative.dev) applications with access to the [**Ethereum**](https://ethereum.org) Blockchain.

Our goal is to help create a sustainable open source ecosystem for [`Web3`](https://github.com/ethereum/web3.js/) in React Native by providing a dependable common runtime which we can _buidl_ upon and extend **together**.

### 🔥 Features

- 🚀 **Bootstrapped by Expo.**
  - Easily take advantage of Expo's high quality, well-supported and well-documented library architecture.
  - Supports Android, iOS and the Web.
- 🍫 **Served with Hardhat or Ganache.**
  - Your generated app comes with a simple example contract which you can deploy and interact with directly.
  - You can also opt out of either framework to use a bare-bones [Infura](https://infura.io) example.
- 🏗️ **And it's strictly typed.**
  - It comes pre-configured with TypeScript to help write applications that _scale_.

## To get started,

You don't have to install anything, just run the following command:

```
nvm use 12
npx create-react-native-dapp
```

This will walk you through the creation of your Ethereum-enabled application, which works on [**Android**](https://reactnative.dev), [**iOS**](https://reactnative.dev) and the [**Web**](https://github.com/necolas/react-native-web). The resulting project has been `eject`ed from [**Expo**](https://expo.io) and merged with blockchain development tools such as  [**Truffle Suite**](https://www.trufflesuite.com/) or [**Hardhat**](https://hardhat.org/).

To start the app, you can:

```
cd my-react-dapp
yarn ios # android, web
```

> **Note:** If you've initialized your project with `Truffle Suite` or `Hardhat`, you'll need to run `yarn ganache` or `yarn hardhat` to simulate the local blockchain prior to running your app.

## To programmatically invoke,

[`create-react-native-dapp`](https://github.com/cawfree/create-react-native-dapp) also exports a simple interface for the programmatic allocation of new projects.

```ts
import { create, BlockchainTools } from 'create-react-native-dapp';

(async () => {
  const name = 'my-react-dapp';
  const bundleIdentifier = 'io.github.cawfree.dapp';
  const packageName = 'io.github.cawfree.dapp';
  const blockchainTools = BlockchainTools.HARDHAT;
  const { dir } = await create({
    name,
    bundleIdentifer,
    packageName,
    blockchainTools,
  });
})();
```

## ✌️ License

[**MIT**](./LICENSE)
