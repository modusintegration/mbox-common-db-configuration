'use strict';
const { knex } = require('./src/dbConfiguration');
const { dbInit } = require('./src/app');

exports.knex = knex;
exports.dbInit = dbInit;

