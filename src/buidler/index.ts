import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { flatten, unflatten } from 'flat';

import {
  createContext,
  createParams,
  createResult,
  CreationStatus,
} from '../types';

// eslint-disable-next-line @typescript-eslint/ban-types
const prettyStringify = (obj: object): string => JSON.stringify(obj, null, 2);

const createBaseProject = (name: string) =>
  execSync(`npx create-react-native-app ${name} -t with-typescript`, {
    stdio: 'inherit',
  });

const ejectExpoProject = (ctx: createContext) =>
  execSync(`cd ${ctx.dir}; expo eject;`, { stdio: 'inherit' });

// TODO: Configure the application icon in Expo.
const setAppIcon = () => null;

// TODO: Add jest and show a working demonstration of solc.
const createTests = () => null;

const createBaseContext = (name: string): createContext => {
  const dir = path.resolve(name);
  const scripts = path.resolve(dir, 'scripts');
  const postinstall = path.resolve(scripts, 'postinstall.js');
  const ganache = path.resolve(scripts, 'ganache.js');
  const pkg = path.resolve(dir, 'package.json');
  const typeRoots = path.resolve(dir, 'index.d.ts');
  const tsc = path.resolve(dir, 'tsconfig.json');
  const shouldUseYarn = fs.existsSync(path.resolve(dir, 'yarn.lock'));
  const metroConfig = path.resolve(dir, 'metro.config.js');
  const babelConfig = path.resolve(dir, 'babel.config.js');
  const gitignore = path.resolve(dir, '.gitignore');
  const env = path.resolve(dir, '.env');
  const app = path.resolve(dir, 'App.tsx');
  const contract = path.resolve(dir, 'contracts', 'Hello.sol');
  return Object.freeze({
    dir,
    index: path.resolve(dir, 'index.js'),
    scripts,
    postinstall,
    ganache,
    gitignore,
    pkg,
    tsc,
    typeRoots,
    contract,
    metroConfig,
    babelConfig,
    env,
    app,
    shouldUseYarn,
  });
};

// TODO: Find a nice version.
const shimProcessVersion = 'v9.40';

const injectShims = (ctx: createContext) =>
  fs.writeFileSync(
    ctx.index,
    `
// This file has been auto-generated by Ξ create-react-native-dapp Ξ.
// Feel free to modify it, but please take care to maintain the exact
// procedure listed between /* dapp-begin */ and /* dapp-end */, as 
// this will help persist a known template for future migrations.

/* dapp-begin */
const {Platform} = require('react-native');

if (Platform.OS !== 'web') {
  require('react-native-get-random-values');
}

if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

global.btoa = global.btoa || require('base-64').encode;
global.atob = global.atob || require('base-64').decode;

process.version = '${shimProcessVersion}';

import { registerRootComponent } from 'expo';
const { default: App } = require('./App');
/* dapp-end */

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
    
    `.trim()
  );

const createScripts = (ctx: createContext) => {
  fs.mkdirSync(ctx.scripts);
  fs.writeFileSync(
    ctx.postinstall,
    `
require('dotenv/config');
const {execSync} = require('child_process');

execSync('npx pod-install', {stdio: 'inherit'});
    `.trim()
  );
  fs.writeFileSync(
    ctx.ganache,
    `
require('dotenv/config');
const {execSync} = require('child_process');

execSync('node node_modules/.bin/ganache-cli --account_keys_path ./ganache.json', {stdio: 'inherit'});
    `.trim()
  );
};

const shouldPrepareTypeRoots = (ctx: createContext) =>
  fs.writeFileSync(
    ctx.typeRoots,
    `
declare module '@env' {
  export const GANACHE_URL: string;
}
  `.trim()
  );

const shouldPrepareTsc = (ctx: createContext) =>
  fs.writeFileSync(
    ctx.tsc,
    prettyStringify({
      compilerOptions: {
        allowSyntheticDefaultImports: true,
        jsx: 'react-native',
        lib: ['dom', 'esnext'],
        moduleResolution: 'node',
        noEmit: true,
        skipLibCheck: true,
        resolveJsonModule: true,
        typeRoots: ['index.d.ts'],
      },
      exclude: [
        'node_modules',
        'babel.config.js',
        'metro.config.js',
        'jest.config.js',
      ],
    })
  );

const preparePackage = (ctx: createContext) =>
  fs.writeFileSync(
    ctx.pkg,
    prettyStringify(
      unflatten({
        // eslint-disable-next-line @typescript-eslint/ban-types
        ...(flatten(JSON.parse(fs.readFileSync(ctx.pkg, 'utf-8'))) as object),
        // scripts
        'scripts.postinstall': 'node scripts/postinstall',
        'scripts.ganache': 'node scripts/ganache',
        // dependencies
        'dependencies.base-64': '1.0.0',
        'dependencies.buffer': '6.0.3',
        'dependencies.web3': '1.3.1',
        'dependencies.node-libs-browser': '2.2.1',
        'dependencies.path-browserify': '0.0.0',
        'dependencies.react-native-stream': '0.1.9',
        'dependencies.react-native-crypto': '2.2.0',
        'dependencies.react-native-get-random-values': '1.5.0',
        'dependencies.react-native-dotenv': '2.4.3',
        // devDependencies
        'devDependencies.dotenv': '8.2.0',
        'devDependencies.ganache-cli': '6.12.1',
        // react-native
        'react-native.stream': 'react-native-stream',
        'react-native.crypto': 'react-native-crypto',
        'react-native.path': 'path-browserify',
        'react-native.process': 'node-libs-browser/mock/process',
      })
    )
  );

const shouldPrepareMetro = (ctx: createContext) =>
  fs.writeFileSync(
    ctx.metroConfig,
    `
const extraNodeModules = require('node-libs-browser');

module.exports = {
  resolver: {
    extraNodeModules,
  },
  transformer: {
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  },
};
    `.trim()
  );

const shouldPrepareBabel = (ctx: createContext) =>
  fs.writeFileSync(
    ctx.babelConfig,
    `
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv'],
    ],
  };
};
    `.trim()
  );

const shouldPrepareEnv = async (ctx: createContext) => {
  return fs.writeFileSync(
    ctx.env,
    `
GANACHE_URL=http://127.0.0.1:8545
    `.trim()
  );
};

const shouldInstall = (ctx: createContext) =>
  execSync(`cd ${ctx.dir}; ${ctx.shouldUseYarn ? 'yarn' : 'npm i'}; `.trim(), {
    stdio: 'inherit',
  });

const shouldInitWeb3Environment = (ctx: createContext) =>
  execSync(`cd ${ctx.dir}; npx truffle init;`, { stdio: 'inherit' });

const shouldPrepareExample = (ctx: createContext) => {
  fs.writeFileSync(
    ctx.contract,
    `
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Hello {
  string defaultSuffix;
  constructor() public {
    defaultSuffix = '!';
  }
  function sayHello(string memory name) public view returns(string memory) {
    return string(abi.encodePacked("Welcome to ", name, defaultSuffix));
  }
}
    `
  );
  fs.writeFileSync(
    ctx.app,
    `
import {GANACHE_URL} from '@env';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Web3 from 'web3';

import Hello from './build/contracts/Hello.json'
import {private_keys as privateKeys} from './ganache.json';

const styles = StyleSheet.create({
  center: {alignItems: 'center', justifyContent: 'center'},
});

export default function App(): JSX.Element {
  const [message, setMessage] = React.useState<string>('');
  const web3 = React.useMemo(
    () => new Web3(new Web3.providers.HttpProvider(GANACHE_URL)),
    []
  );
  const shouldDeployContract = React.useCallback(async (abi, data, from: string) => {
    const deployment = new web3.eth.Contract(abi).deploy({data});
    const gas = await deployment.estimateGas();
    const {
      options: { address: contractAddress },
    } = await deployment.send({from, gas});
    return new web3.eth.Contract(abi, contractAddress);
  }, [web3]);
  React.useEffect(() => {
    (async () => {
      const [address, privateKey] = Object.entries(privateKeys)[0];
      await web3.eth.accounts.privateKeyToAccount(privateKey);
      const contract = await shouldDeployContract(Hello.abi, Hello.bytecode, address);
      setMessage(await contract.methods.sayHello("React Native").call());
    })();
  }, [shouldDeployContract, setMessage]);
  return (
    <View style={[StyleSheet.absoluteFill, styles.center]}>
      <Text>{message}</Text>
    </View>
  );
}
    `.trim()
  );
  // compile example contract
  execSync(`cd ${ctx.dir}; npx truffle compile;`, { stdio: 'inherit' });
};

const shouldPrepareGitignore = (ctx: createContext) =>
  fs.writeFileSync(
    ctx.gitignore,
    `
${fs.readFileSync(ctx.gitignore, 'utf-8')}

# environment config
.env

# ganache
ganache.json
  `.trim()
  );

export const create = async (params: createParams): Promise<createResult> => {
  const { name } = params;

  createBaseProject(name);

  const ctx = createBaseContext(name);

  if (!fs.existsSync(ctx.dir)) {
    return Object.freeze({
      ...ctx,
      status: CreationStatus.FAILURE,
      message: `Failed to resolve project directory.`,
    });
  }

  setAppIcon();
  ejectExpoProject(ctx);
  injectShims(ctx);
  createScripts(ctx);
  createTests();
  preparePackage(ctx);
  shouldPrepareMetro(ctx);
  shouldPrepareBabel(ctx);
  shouldPrepareTypeRoots(ctx);
  shouldPrepareTsc(ctx);
  shouldPrepareGitignore(ctx);
  await shouldPrepareEnv(ctx);
  shouldInitWeb3Environment(ctx);

  shouldInstall(ctx);
  shouldPrepareExample(ctx);

  return Object.freeze({
    ...ctx,
    status: CreationStatus.SUCCESS,
    message: `cd ${name}; ${
      ctx.shouldUseYarn ? 'yarn' : 'npm run-script'
    } ganache& yarn web;`,
  });
};
