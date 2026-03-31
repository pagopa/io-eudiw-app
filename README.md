<p align="center">
  <img src="apps/main-app/assets/images/icons/ios-default.png" width="100" style="display: block" /></br>
  <h3 align="center">EUDIW APP</h3>
</p>

## Introduction
This repository is a [nx](https://nx.dev/) monorepo containing the codebase of PagoPA's EUDIW app which consists of a Expo application which orchestrates multiple miniapp libraries. Each miniapp implements a specific testing scenario for both italian and european digital identity wallets. 
More details on each miniapp can be found in their respective README files under `libs/`. The `main-app` [README](./apps/main-app/README.md) contains instructions for adding new miniapps to the host application as well as instruction on how to run the app locally.


## Prerequisites

### NodeJS and Ruby
To run the project you need to install the correct version of NodeJS
We recommend the use of a virtual environment of your choice. For ease of use, this guide adopts [nodenv](https://github.com/nodenv/nodenv) for NodeJS, [rbenv](https://github.com/rbenv/rbenv) for Ruby.

The node version used in this project is stored in [.node-version](.node-version), 
while the version of Ruby is stored in [.ruby-version](.ruby-version).


## Setup
We use [pnpm](https://pnpm.io/) for managing javascript dependencies. 
As stated [previously](#nodejs-and-ruby), we also use `nodenv` and `rbenv` for managing the environment:
```bash
# Clone the repository
$ git clone https://github.com/pagopa/io-eudiw-app

# CD into the repository
$ cd io-eudiw-app

# Install NodeJS with nodenv, the returned version should match the one in the .node-version file
$ nodenv install && nodenv version

# Install Ruby with rbenv, the returned version should match the one in the .ruby-version file
$ rbenv install && rbenv version

# Enable corepack and prepare yarn
$ corepack enable
$ corepack prepare --activate

# Install dependencies with pnpm
$ pnpm install
```



