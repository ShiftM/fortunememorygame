### Fortune Match Game
---
## Requirements

For development, you will only need Node.js and a node global package, Yarn, installed in your environement.

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v8.11.3

    $ npm --version
    6.1.0

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    $ npm install npm -g

---

## Install

    $ git clone https://github.com/ShiftM/fortunememorygame
    $ cd fortunememorygame
    $ npm install

## Configure app
Open `.env` to edit the application end points.


## Running the project

    $ npm start

## Simple build for production

    $ npm build



## UPDATED EMBED 
    <div style="height: 100%;width: 100%; display: flex; justify-content: center;">
      <iframe sandbox='allow-same-origin allow-scripts allow-popups allow-forms' src="LOCALHOST_URL_WITH_QUERY"
        style="max-width: 550px; padding: 0px; width:100%; height: 100%;  border: none" webkitallowfullscreen="true" scrolling="no"
        mozallowfullscreen="true" allow="autoplay" allowfullscreen="true" allowvr="" scrolling="no"
        frameborder="0"></iframe>
    </div>