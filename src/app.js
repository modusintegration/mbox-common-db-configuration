'use strict';
const { runSchemaCreationIfNeeded, setKnex, runInitialConfigurations } = require('./dbConfiguration');


/**
  * @param {object} knexOptions (object containing knex options)
  * @param {boolean} runSchemaCreation
  * @param {number} totalRetries (max number of retries)
  * @param {number} waitRetry (miliseconds to wait for retry)
  * @param {boolean} runData (boolean)
  * @param {function} callback (callback function for initial data configuration)
  */
exports.dbInit = async (knexOptions, runSchemaCreation, totalRetries, waitRetry, runData, callback) => {

  try {

    setKnex(knexOptions);
    await runSchemaCreationIfNeeded(runSchemaCreation, totalRetries, waitRetry);
    await runInitialConfigurations(runData, callback);
  } catch (error) {
    console.error(error);
    console.error('Application is not starting');
    process.exit(1);
  }

};

