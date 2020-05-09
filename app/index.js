import * as view from './view';
import {Pushups} from './pushups';

const pushups = new Pushups();

view.showView('main-view');
view.render(pushups);

function updatePushups(count) {
    pushups.updatePushupCount(count);
    view.render(pushups);
}

const onAddClick = () => {
    updatePushups(1);
};
const onAddLongPress = () => {
    updatePushups(10);
};
view.onAddClickLongPress(onAddClick, onAddLongPress);

const onSubClick = () => {
    updatePushups(-1);
};
const onSubLongPress = () => {
    updatePushups(-10);
}
view.onSubClickLongPress(onSubClick, onSubLongPress);

view.onSettingsClick(() => {
    view.showView('settings-view');
});

view.onSaveSettingsClick(() => {
    view.showView('main-view');
});

function updateGoal(count) {
    pushups.updateGoal(count);
    view.render(pushups);
}

const onAddGoalClick = () => {
    updateGoal(1);
};
const onAddGoalLongPress = () => {
    updateGoal(10);
}
view.onAddGoalClickLongPress(onAddGoalClick, onAddGoalLongPress);

const onSubGoalClick = () => {
    updateGoal(-1);
};
const onSubGoalLongPress = () => {
    updateGoal(-10);
};
view.onSubGoalClickLongPress(onSubGoalClick, onSubGoalLongPress);
