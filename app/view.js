import document from 'document';
import {vibration} from 'haptics';

const pushupCountText = document.getElementById('txt-count');
const settingsButton = document.getElementById('btn-settings');
const addButton = document.getElementById('btn-add');
const subButton = document.getElementById('btn-sub');
const arcGoalProgress = document.getElementById('arc-goal-progress');
const imgGoalComplete = document.getElementById('img-goal-complete');
const saveSettingsButton = document.getElementById('btn-save-settings');
const goalText = document.getElementById('txt-goal');
const addGoalButton = document.getElementById('btn-add-goal');
const subGoalButton = document.getElementById('btn-sub-goal');

export function onSettingsClick(listener) {
    settingsButton.addEventListener('click', listener);
}

export function render(pushups) {
    pushupCountText.text = pushups.today.pushups;
    arcGoalProgress.sweepAngle = pushups.today.goalProgress * 360;
    imgGoalComplete.style.display =
        pushups.today.goalMet ? 'inline' : 'none';

    goalText.text = `Goal: ${pushups.settings.goal} pushups`;
}

export function onAddClickLongPress(onClick, onLongPress) {
    attachClickLongPressListener(addButton, onClick, onLongPress);
}

export function onSubClickLongPress(onClick, onLongPress) {
    attachClickLongPressListener(subButton, onClick, onLongPress);
}

function attachClickLongPressListener(element, onClick, onLongPress) {
    const LONG_PRESS_TIMEOUT = 500;
    const LONG_PRESS_INTERVAL = 250;
    let longPressTimeout;
    let longPressInterval;
    let longPressTriggered;
    let clickEnded;

    const longPressCallback = () => {
        longPressTriggered = true;
        vibration.start('bump');
        onLongPress();
    };
    element.addEventListener('mousedown', () => {
        clickEnded = false;
        longPressTriggered = false;
        longPressTimeout = setTimeout(() => {
            longPressCallback();
            longPressInterval = setInterval(longPressCallback, LONG_PRESS_INTERVAL);
        }, LONG_PRESS_TIMEOUT);
    });

    const onMouseup = (e) => {
        if (clickEnded) {
            return;
        }
        clearTimeout(longPressTimeout);
        clearInterval(longPressInterval);
        if (!longPressTriggered) {
            onClick();
        }
        clickEnded = true;
    }
    element.addEventListener('mouseup', onMouseup);
    element.addEventListener('mouseout', onMouseup);  
}

export function showView(view) {
    document.getElementsByClassName('view').forEach((element) => {
        element.style.display = element.id === view ? 'inline' : 'none';
    });
}

export function onSaveSettingsClick(listener) {
    saveSettingsButton.addEventListener('click', listener);
}

export function onAddGoalClickLongPress(onClick, onLongPress) {
    attachClickLongPressListener(addGoalButton, onClick, onLongPress);
}

export function onSubGoalClickLongPress(onClick, onLongPress) {
    attachClickLongPressListener(subGoalButton, onClick, onLongPress);
}