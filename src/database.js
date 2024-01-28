// @ts-check
'use strict';

const lowdb = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

let db;

const loadDB = async (dbPath) => {
  db = await lowdb(new FileAsync(dbPath));
  await db.read();
};

const getDB = () => {
  return db;
};

module.exports = {
  loadDB,
  getDB
};

