'use strict';

/**
  * dbInit has the responsability of:
  * First, to check that a knex connection was sucessfuly established, retrying totalRetries number of times and checking every waitRetry miliseconds.
  * Second, to check if a new schema creation running knex migration is needed using runSchemaCreation parameter.
  * Third, to check if running an initial data configuration is needed using runData parameter.
  * @param {boolean} runSchemaCreation
  * @param {number} totalRetries (max number of retries)
  * @param {number} waitRetry (miliseconds to wait for retry)
  * @param {boolean} runData (boolean)
  * @param {function} callback (callback function for initial data configuration)
  * @param {boolean} runDbSeed (boolean to run knex seeding)
  */
const dbInit = async (knex, runSchemaCreation, totalRetries, waitRetry, runData, callback, runDbSeed) => {

  try {

    await checkConnection(knex, totalRetries, waitRetry);
    await runSchemaCreationIfNeeded(knex, runSchemaCreation);
    await runInitialConfigurations(runData, callback);
    await runKnexSeed(knex, runDbSeed);
  } catch (error) {
    console.error(error);
    console.error('Application is not starting');
    process.exit(1);
  }

};

// design your application to attempt to re-establish a connection to the database after a failure
// https://docs.docker.com/compose/startup-order/
let dbRetries = 1;
async function checkConnection  (knex, totalRetries, waitRetry)  {
  try {
    console.log('Checking connection...');
    await knex.raw('select 1+1 as result');
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
      await checkConnection(knex, totalRetries, waitRetry);
    }
  }

}


async function runSchemaCreationIfNeeded  (knex, runSchemaCreation) {
  if ((/true/i).test(runSchemaCreation)) {
    console.log('Initial data configuration' );
    try {
      await runKnexMigrations(knex);
      console.log('success tables created ');
    } catch (e) {
      console.error('error happened in the DB', e);
      throw e;
    }
  }
}

async function wait (ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function runKnexMigrations (knex) {
  console.log('Migrating');
  await knex.migrate.latest();
  console.log('Migration done');
}

async function runInitialConfigurations (runData, callback)  {
  if ((/true/i).test(runData)) {
    console.log('Now running initial data configurations');
    await callback();
  } else {
    console.log('Not running initial configurations');
  }
}

async function runKnexSeed (knex, runDbSeed)  {
  if ((/true/i).test(runDbSeed)) {
    !process.env.TEST && console.log('Seeding');
    await knex.seed.run();
    !process.env.TEST && console.log('Seeding done');
  } else {
    !process.env.TEST && console.log('Not running seeding');
  }
}

module.exports = {
  dbInit
};

