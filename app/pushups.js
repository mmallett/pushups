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
    }

    get today() {
        const id = this._getTodayId();
        const record = this._findRecordById(id);
        if (record) {
            return record;
        }

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
        return this._pushupData.pushups[id];
    }

    _getTodayId() {
        return this._getIdFromDate(new Date());
    }

    _getIdFromDate(date) {
        return `${date.getFullYear()}-${date.getMonth() +1}-${date.getDate()}`;
    }

    _writeDb() {
        // schedule async write to keep the app responsive
        // don't block on IO
        if (this._writeTimeout) {
            clearTimeout(this._writeTimeout);
        }
        this._writeTimeout = setTimeout(() => {
            fs.writeFileSync(PUSHUP_DB_FILE, this._pushupData, 'cbor'); 
        }, 500);        
    }

    _readOrCreateDb() {
        if (fs.existsSync(PUSHUP_DB_FILE)) {
            return fs.readFileSync(PUSHUP_DB_FILE, 'cbor');
        }

        fs.writeFileSync(PUSHUP_DB_FILE, INITIAL_PUSHUP_DB, 'cbor');
        return INITIAL_PUSHUP_DB;
    }
}