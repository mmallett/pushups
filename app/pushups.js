import * as fs from 'fs';

const PUSHUP_DB_FILE = 'pushup_db.cbor';
export const INITIAL_PUSHUP_DB = {
    pushups: {},
    settings: {
        goal: 30
    },
};

const MS_PER_DAY = 864e5;

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

    get week() {
        const LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const today = new Date();

        return [0, 1, 2, 3, 4, 5, 6]
        .map(i => {
            return new Date(today.getTime() - MS_PER_DAY * i);
        })
        .map(date => {
            const id = this._getIdFromDate(date);
            const record = this._findRecordById(id) || {
                pushups: 0,
                goalMet: false
            };
            return {
                ...record,
                label: LABELS[date.getDay()],
            };
        })
        .reverse();
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

    _pruneOldData() {
        const now = new Date();
        const pruneBefore = new Date(now.getTime() - MS_PER_DAY * 10);

        const newPushups = {};
        for (const id of Object.keys(this._pushupData.pushups)) {
            const record = this._findRecordById(id);
            const timestamp = Date.parse(record.date);
            if (timestamp >= pruneBefore) {
                newPushups[id] = this._pushupData.pushups[id];
            }
        }
        this._pushupData.pushups = newPushups;
    }

    _writeDb() {
        // schedule async write to keep the app responsive
        // don't block on IO
        if (this._writeTimeout) {
            clearTimeout(this._writeTimeout);
        }
        this._writeTimeout = setTimeout(() => {
            this._pruneOldData();
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