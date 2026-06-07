const config = {
  appId: 'com.sandhani.management',
  productName: 'Sandhani Management System',
  directories: {
    buildResources: 'assets',
    output: 'dist',
  },
  files: [
    'dist/**/*',
    'node_modules/**/*',
    'package.json',
  ],
  win: {
    target: ['nsis', 'portable'],
    certificateFile: process.env.WIN_CSC_LINK,
    certificatePassword: process.env.WIN_CSC_KEY_PASSWORD,
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
  mac: {
    target: ['dmg', 'zip'],
  },
  linux: {
    target: ['AppImage', 'deb'],
  },
};

module.exports = config;
