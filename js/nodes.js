import { saveToStorage, getFromStorage } from './storage.js';

const nodesContainer = document.getElementById('nodes-container');

export function getNodes() {
    return getFromStorage('nodes', []);
}
export function setNodes(nodes) {
    saveToStorage('nodes', nodes);
}
export function createNodeDOM(node, isSelected, isMain) {
    const el = document.createElement('div');
    el.className = 'node' + (isMain ? ' main' : '') + (isSelected ? ' selected' : '');
    el.style.top = node.top;
    el.style.left = node.left;
    el.dataset.nodeId = node.id;

    const circle = document.createElement('div');
    circle.className = 'circle';
    if (node.image) {
        const img = document.createElement('img');
        img.src = node.image;
        circle.appendChild(img);
    }
    el.appendChild(circle);

    const label = document.createElement('div');
    label.className = 'node-label';
    label.innerHTML = `<strong>${node.name}</strong><br>${node.jobTitle}`;
    el.appendChild(label);

    nodesContainer.appendChild(el);
    return el;
}
export function clearNodes() {
    nodesContainer.querySelectorAll('.node').forEach(el => el.remove());
}