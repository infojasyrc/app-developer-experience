const test = require('ava')

// const firebaseAdminApp = require('../../providers/firebase-admin.application')

test.beforeEach(() => {})
test.afterEach(() => {})

test.skip('Initialize firebase admin', () => {
  const adminSDK = firebaseAdminApp()

  it('should get all services', () => {
    console.log('admin sdk', adminSDK.auth())
  })
})
