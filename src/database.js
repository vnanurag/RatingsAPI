'use strict';

const lowdb = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const constants = require('./constants');

let db;

const loadDB = async () => {
  db = await lowdb(new FileAsync(constants.DB_PATH));
  await db.read();
};

const getDB = () => {
  return db;
};

module.exports = {
  loadDB,
  getDB
};

