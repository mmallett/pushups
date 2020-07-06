const expect = require('chai').expect;

const fs = require('fs');
fs.writeFileSync = (name, data, mode) => {};
fs.existsSync = (name) => false;

const pushupsModule = require('../app/pushups');
const Pushups = pushupsModule.Pushups;

describe('pushups', () => {
    let pushups;
    beforeEach(() => {
        pushups = new Pushups();
    });
    afterEach(() => {
        pushups._pushupData.pushups = {};
        pushups._pushupData.settings = {goal: 30};
    });

    it('can create', () => {
        expect(pushups).to.be.an('object');
        expect(pushups._pushupData).to.equal(pushupsModule.INITIAL_PUSHUP_DB);
    });

    it('adds pushups', () => {
        pushups.updatePushupCount(15);
        expect(pushups.today.pushups).to.equal(15);
        expect(pushups.today.goalMet).to.equal(false);
        expect(pushups.today.goalProgress).to.equal(0.5);

        pushups.updatePushupCount(15);
        expect(pushups.today.pushups).to.equal(30);
        expect(pushups.today.goalMet).to.equal(true);
        expect(pushups.today.goalProgress).to.equal(1);
    });

    it('removes pushups', () => {
        pushups.updatePushupCount(30);

        pushups.updatePushupCount(-15);
        expect(pushups.today.pushups).to.equal(15);
        expect(pushups.today.goalMet).to.equal(false);
        expect(pushups.today.goalProgress).to.equal(0.5);

        pushups.updatePushupCount(-15);
        expect(pushups.today.pushups).to.equal(0);
        expect(pushups.today.goalMet).to.equal(false);
        expect(pushups.today.goalProgress).to.equal(0.0);
    });

    it('updates goal', () => {
        pushups.updatePushupCount(30);

        pushups.updateGoal(30);
        expect(pushups.today.goalMet).to.equal(false);
        expect(pushups.today.goalProgress).to.equal(0.5);

        pushups.updateGoal(-45);
        expect(pushups.today.goalMet).to.equal(true);
        expect(pushups.today.goalProgress).to.equal(1);
    });

    it('prunes old data', () => {
        const now = new Date();
        const todayRecord = {
            pushups: 20,
            goalMet: true,
            goalProgress: 1.0,
            date: now.toISOString(),
        };
        const todayId = pushups._getIdFromDate(now);
        pushups._pushupData.pushups[todayId] = todayRecord;

        const oldDate = new Date(now);
        oldDate.setDate(-10);
        const oldRecord = {
            pushups: 10,
            goalMet: false,
            goalProgress: 0.5,
            date: oldDate.toISOString(),
        };
        const oldId = pushups._getIdFromDate(oldDate);
        pushups._pushupData.pushups[oldId] = oldRecord;

        expect(pushups._pushupData.pushups).to.deep.equal({
            [todayId]: todayRecord,
            [oldId]: oldRecord,
        });

        pushups._pruneOldData();
        expect(pushups._pushupData.pushups).to.deep.equal({
            [todayId]: todayRecord,
        });
    });
});