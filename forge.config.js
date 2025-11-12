module.exports = {
  packagerConfig: {
    icon: '/public/images/icon' // no file extension required
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        setupIcon: '/public/images/icon.ico'
      }
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: '/public/images/icon.png'
        }
      }
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        icon: '/public/images/icon.icns'
      }
    },
    {
      name: '@electron-forge/maker-wix',
      config: {
        icon: '/public/images/icon.ico'
      }
    }
  ]
};