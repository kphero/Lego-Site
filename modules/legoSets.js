/********************************************************************************
*  WEB322 – Assignment 02
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Kyle Homen Student ID: 105669238 Date: 2024-05-28
*
********************************************************************************/

require('dotenv').config();

const Sequelize = require('sequelize');

// set up sequelize to point to our postgres database
const sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'CNOj2EylG0ko', {
  host: 'ep-long-sun-a5s5buxj.us-east-2.aws.neon.tech',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

// Define a "Theme" model
const Theme = sequelize.define(
    'Theme',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true, // use "id" as a primary key
        autoIncrement: true, // automatically increment the value
      },
      name: Sequelize.STRING,
    },
    {
      createdAt: false, // disable createdAt
      updatedAt: false, // disable updatedAt
    }
  );

  // Define a "Set" model
const Set = sequelize.define(
    'Set',
    {
      set_num: {
        type: Sequelize.STRING,
        primaryKey: true, // use "set_num" as a primary key
      },
      name: Sequelize.STRING,
      year: Sequelize.INTEGER,
      num_parts: Sequelize.INTEGER,
      theme_id: Sequelize.INTEGER,
      img_url: Sequelize.STRING,
    },
    {
      createdAt: false, // disable createdAt
      updatedAt: false, // disable updatedAt
    }
  );

  Set.belongsTo(Theme, {foreignKey: 'theme_id'});


// Fills set array with objects from setData, while also adding a theme property
function initialize() {
    return new Promise(async (resolve, reject) => {
        try {
            await sequelize.sync();
            resolve();
        } catch (err) {
            reject(err.message);
        }
    });
}

function getAllSets() {
    return new Promise(async (resolve, reject) => {
        let sets = await Set.findAll({include: [Theme]});
        resolve(sets);
    });
}

function getAllThemes() {
    return new Promise(async (resolve, reject) => {
        let themes = await Theme.findAll();
        resolve(themes);
    });
}

function getSetByNum(setNum) {
    return new Promise(async (resolve, reject) => {
        let foundSet = await Set.findAll({include: [Theme], where: {set_num: setNum}});

        if (foundSet) {
            resolve(foundSet[0])
        } else {
            reject("Unable to find requested set");
        }
    });
}

function getSetsByTheme(theme) {
    return new Promise(async (resolve, reject) => {
        let foundSets = await Set.findAll({include: [Theme], where: {
            '$Theme.name$': {
                [Sequelize.Op.iLike]: `%${theme}%`
            }
        }});

        if (foundSets) {
            resolve(foundSets);
        } else {
            reject("Unable to find requested sets")
        }
    });
}

function addSet(setData) {
    return new Promise(async (resolve, reject) => {
        try {
            await Set.create(setData);
            resolve();
        } catch (err) {
            reject(err.errors[0].message);
        }
    });
}

function editSet(setNum, setData) {
    return new Promise(async (resolve, reject) => {
        try {
            await Set.update(setData, {where: {set_num: setNum}});
            resolve();
        } catch (err) {
            reject(err.errors[0].message);
        }
    });
}

function deleteSet(setNum) {
    return new Promise(async (resolve, reject) => {
        try {
            await Set.destroy({where: {set_num : setNum}});
            resolve();
        } catch (err) {
            reject(err.errors[0].message);
        }
    });
}

// Make exportable to access in other files
module.exports = {initialize, getAllSets, getSetByNum, getSetsByTheme, getAllThemes, addSet, editSet, deleteSet};