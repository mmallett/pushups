import document from 'document';
import {vibration} from 'haptics';

export const MAIN_PANORAMA_TODAY = 0;
export const MAIN_PANORAMA_WEEK = 1;

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
const mainPanorama = document.getElementById('main-panorama');

const CHART_HEIGHT = 200;

export function onSettingsClick(listener) {
    settingsButton.addEventListener('click', listener);
}

export function render(pushups) {
    pushupCountText.text = pushups.today.pushups;
    arcGoalProgress.sweepAngle = pushups.today.goalProgress * 360;
    imgGoalComplete.style.display =
        pushups.today.goalMet ? 'inline' : 'none';

    goalText.text = `Goal: ${pushups.settings.goal} push-ups`;

    renderWeekChart(pushups);
}

function renderWeekChart(pushups) {
    const week = pushups.week;
    const maxPushups =  week.reduce((acc, record) => {
        return Math.max(acc, record.pushups || 0);
    }, 1);

    // Height is inverted. For a maximum height bar, y is set to 0%;
    for (let i=0; i<week.length; i++) {
        const y = Math.floor(CHART_HEIGHT * (1 - week[i].pushups / maxPushups));
        const rect = document.getElementById(`week-data-${i + 1}`);
        rect.y = y;
        rect.style.opacity = week[i].goalMet ? 1 : .5;

        const text = document.getElementById(`week-text-${i + 1}`);
        text.text = week[i].label;
    }
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
    view === 'main-view' ? showAddSubButtons() : hideAddSubButtons();
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

export function onMainPanoramaChange(onChange) {
    mainPanorama.addEventListener('select', () => onChange(mainPanorama.value));
}

export function showAddSubButtons() {
    addButton.style.display = 'inline';
    subButton.style.display = 'inline';
}

export function hideAddSubButtons() {
    addButton.style.display = 'none';
    subButton.style.display = 'none';
}