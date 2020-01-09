'use strict';

exports.knex = {};

exports.setKnex = (knexOptions) => {
  exports.knex.db = require('knex')(knexOptions);
};



// design your application to attempt to re-establish a connection to the database after a failure
// https://docs.docker.com/compose/startup-order/
let dbRetries = 1;
exports.runSchemaCreationIfNeeded = async (runSchemaCreation, totalRetries, waitRetry) => {
  console.log('Initial data configuration' );
  if ((/true/i).test(runSchemaCreation)) {
    try {
      await runKnexMigrations();
      console.log(`success connected to DB and tables created after trying : ${dbRetries} time(s)`);
    } catch (e) {
      console.error('Error connecting to the database', e);
      console.log(`Attempting retry: ${dbRetries}`);
      dbRetries++;
      if (dbRetries === totalRetries) {
        console.error('could not get connection to DB after retries');
        throw e;
      } else {
        await wait(waitRetry);
        await exports.runSchemaCreationIfNeeded(runSchemaCreation, totalRetries, waitRetry);
      }
    }
  }
};

async function wait (ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const runKnexMigrations = async () => {
  console.log('Migrating');
  await exports.knex.db.migrate.latest();
  console.log('Migration done');
};

exports.runInitialConfigurations = async (runData, callback) => {
  if ((/true/i).test(runData)) {
    console.log('Now running initial data configurations');
    await callback();
  } else {
    console.log('Not running initial configurations');
  }
};
