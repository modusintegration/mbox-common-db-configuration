'use strict';

exports.knex = {};

exports.setKnex = (knexOptions) => {
  exports.knex.db = require('knex')(knexOptions);
};

// design your application to attempt to re-establish a connection to the database after a failure
// https://docs.docker.com/compose/startup-order/
let dbRetries = 1;
exports.checkConnection = async (totalRetries, waitRetry) => {
  try {
    console.log('Checking connection...');
    await exports.knex.db.raw('select 1+1 as result');
    console.log(`success connected to DB after trying : ${dbRetries} time(s)`);
  } catch (e) {
    console.error('Error connecting to the database', e);
    console.log(`Attempting retry: ${dbRetries}`);
    dbRetries++;
    if (dbRetries === totalRetries) {
      console.error('could not get connection to DB after retries');
      throw e;
    } else {
      await wait(waitRetry);
      await exports.checkConnection(totalRetries, waitRetry);
    }
  }

}


exports.runSchemaCreationIfNeeded = async (runSchemaCreation) => {
  if ((/true/i).test(runSchemaCreation)) {
    console.log('Initial data configuration' );
    try {
      await runKnexMigrations();
      console.log(`success tables created `);
    } catch (e) {
      console.error('error happened in the DB', e);
      throw e;
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
