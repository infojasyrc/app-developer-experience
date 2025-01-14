class UserAuthentication {

  constructor(authData) {
    this.email = authData.email;
    this.emailVerified = authData.emailVerified || false;
    this.password = authData.password;
    this.displayName = authData.displayName ?
      authData.displayName : 
      authData.name && authData.lastName ?
      `${authData.name} ${authData.lastName}` : '';
    this.disabled = authData.disabled || false;
    this.photoURL = authData.photoURL || undefined;
    this.phoneNumber = authData.phoneNumber || undefined;
  }
}

module.exports = UserAuthentication;
