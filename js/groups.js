import { saveToStorage, getFromStorage } from './storage.js';

const nodesContainer = document.getElementById('nodes-container');
export function getGroups() {
    return getFromStorage('groups', []);
}
export function setGroups(groups) {
    saveToStorage('groups', groups);
}
const groupColors = [
    "#e6194b","#3cb44b","#ffe119","#4363d8","#f58231","#911eb4","#46f0f0","#f032e6",
    "#bcf60c","#fabebe","#008080","#e6beff","#9a6324","#fffac8","#800000","#aaffc3"
];
export function createGroupDOM(group, isSelected) {
    const el = document.createElement('div');
    el.className = 'group' + (isSelected ? ' selected' : '');
    el.style.top = group.top;
    el.style.left = group.left;
    el.style.background = group.color;
    el.dataset.groupId = group.id;

    const circle = document.createElement('div');
    circle.className = 'group-circle';
    circle.style.background = group.color;
    el.appendChild(circle);

    const label = document.createElement('div');
    label.className = 'group-label';
    label.textContent = group.name;
    el.appendChild(label);

    nodesContainer.appendChild(el);
    return el;
}
export function clearGroups() {
    nodesContainer.querySelectorAll('.group').forEach(el => el.remove());
}
export function randomColor() {
    return groupColors[Math.floor(Math.random()*groupColors.length)];
}