import * as fs from 'fs';

const PUSHUP_DB_FILE = 'pushup_db.cbor';
const INITIAL_PUSHUP_DB = {
    pushups: {},
    settings: {
        goal: 30
    },
};

/*
Pushups DB schema

- pushups
  - id: key [format YYYY-MM-DD of record date]
    - pushups: number >= 0
    - goalMet: boolean
    - goalProgress: number [0,1]
    - date: Date ISO string
- settings
  - goal: number

*/

export class Pushups {
    constructor() {
        this._pushupData = this._readOrCreateDb();
        console.log('constructor', JSON.stringify(this._pushupData));
    }

    get today() {
        console.log('get today');
        const id = this._getTodayId();
        const record = this._findRecordById(id);
        if (record) {
            console.log('record found', id, JSON.stringify(record));
            return record;
        }

        console.log('return new record');
        const newRecord = {
            pushups: 0,
            goalMet: false,
            goalProgress: 0.0,
            date: new Date().toISOString(),
        };
        this._pushupData.pushups[id] = newRecord;
        return newRecord;
    }

    get settings() {
        return this._pushupData.settings;
    }

    updatePushupCount(pushups) {
        this.today.pushups += pushups;
        this.today.pushups = Math.max(this.today.pushups, 0);
        this._updateGoalProgress();

        this._writeDb();
    }

    updateGoal(goal) {
        this.settings.goal += goal;
        this.settings.goal = Math.max(this.settings.goal, 1);
        this._updateGoalProgress();
        
        this._writeDb();
    }

    _updateGoalProgress() {
        this.today.goalProgress = Math.min(
            1.0, this.today.pushups / this.settings.goal);
        this.today.goalMet =
            this.today.goalProgress >= 1.0;
    }

    _findRecordById(id) {
        console.log(id, JSON.stringify(this._pushupData));
        return this._pushupData.pushups[id];
    }

    _getTodayId() {
        return this._getIdFromDate(new Date());
    }

    _getIdFromDate(date) {
        return `${date.getFullYear()}-${date.getMonth() +1}-${date.getDate()}`;
    }

    _writeDb() {
        console.log('scheduling async write');
        // schedule async write to keep the app responsive
        // don't block on IO
        if (this._writeTimeout) {
            clearTimeout(this._writeTimeout);
        }
        this._writeTimeout = setTimeout(() => {
            console.log('writing db', JSON.stringify(this._pushupData));
            fs.writeFileSync(PUSHUP_DB_FILE, this._pushupData, 'cbor'); 
        }, 500);        
    }

    _readOrCreateDb() {
        // if (fs.existsSync(PUSHUP_DB_FILE)) {
        //     console.log('using existing db');
        //     return fs.readFileSync(PUSHUP_DB_FILE, 'cbor');
        // }

        console.log('create new db');
        fs.writeFileSync(PUSHUP_DB_FILE, INITIAL_PUSHUP_DB, 'cbor');
        return INITIAL_PUSHUP_DB;
    }
}