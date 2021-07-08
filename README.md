# Parrot Software Center

Uses ReactJS with material-ui styling and Electron.

## Development

1. Clone the repo:

`git clone https://nest.parrot.sh/packages/parrot/software-center-team/parrot-software-center.git`

`cd parrot-software-center`

`git switch dev`


2. Install dependencies:

`yarn install`

`cd src`

`yarn install`


3. Rebuild electron:

`./node-modules/.bin/electron-rebuild`


4. Run in development mode:

`cd ..`

`DEBUG_PROD=true;NODE_ENV=development yarn start`
