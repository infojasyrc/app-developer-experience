'use strict';

const setupBaseService = require('./base.service');

module.exports = function setupAccountsService (dbInstance) {

  const collection = dbInstance.collection('accounts');
  const baseService = new setupBaseService();

  async function getAccounts (userId) {
    const allUserAccounts = [];

    try {
      let accountsQuery = collection.where('userId', '==', userId);

      const dataSnapshot = await accountsQuery.get();

      dataSnapshot.forEach((doc) => {
        const userAccount = {
          id: doc.id,
          ...doc.data()
        };
        allUserAccounts.push(userAccount);
      });

      baseService.returnData.message = 'Getting account successfully';

    } catch (err) {
      console.error('Error getting documents: ', err);
      baseService.returnData.message = 'Error getting accounts';
      baseService.returnData.responseCode = 500;
    }

    baseService.returnData.data = allUserAccounts;

    return baseService.returnData;
  }

  async function getAll (userId) {
    return await getAccounts(userId);
  }

  async function getDefaultAccount(userId) {
    const defaultAccounts = [];
    try {

      const accountsQuery = collection.where('userId', '==', userId)
        .where('default', '==' , true);

      const dataSnapshot = await accountsQuery.get();

      dataSnapshot.forEach((doc) => {
        const userAccount = {
          id: doc.id,
          ...doc.data()
        };
        defaultAccounts.push(userAccount);
      });

    } catch (err) {
      const errorMessage = 'Error getting default account';
      console.error(errorMessage, err);
      defaultAccounts.push({});
      baseService.returnData.message = errorMessage;
      baseService.returnData.responseCode = 500;
    }

    baseService.returnData.data = defaultAccounts[0];

    return baseService.returnData;
  }

  async function checkBalance (userId) {
    const allAccountsResponse = await getAccounts(userId);

    // No errors for calculating the balance
    if (allAccountsResponse.responseCode === 200) {
      let balance = 0;
      allAccountsResponse.data.forEach(account => {
        balance += parseFloat(account.balance);
      });
      allAccountsResponse.data = balance;
      allAccountsResponse.message = 'Getting data successfully';
    }

    return allAccountsResponse;
  }

  function calculateBalance(currentBalance, transactionAmount) {
    return parseFloat(
      parseFloat(currentBalance).toFixed(2) -
      parseFloat(transactionAmount).toFixed(2)
    ).toFixed(2);
  }

  async function updateBalance (accountId, transactionAmount) {
    try {
      const accountResponse = await collection.doc(accountId).get();
      const accountData = accountResponse.data();

      const updatedAccount = {
        balance: calculateBalance(accountData.balance, transactionAmount)
      };

      await collection.doc(accountId).update(updatedAccount);

      const updatedAccountResponse = await collection.doc(accountId).get();

      baseService.returnData.message = 'Account was successfully updated';
      baseService.returnData.data = {
        accountId,
        ...updatedAccountResponse.data()
      };
    } catch (err) {
      const errorMessage = 'Error updating account balance';
      console.error(errorMessage, err);
      baseService.returnData.responseCode = 500;
      baseService.returnData.message = errorMessage;
    }

    return baseService.returnData;
  }

  return {
    checkBalance,
    getAll,
    getDefaultAccount,
    updateBalance
  };
};
