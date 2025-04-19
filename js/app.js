import { getNodes, setNodes, createNodeDOM, clearNodes } from './nodes.js';
import { getConnections, setConnections, drawConnections } from './connections.js';
import { getGroups, setGroups, createGroupDOM, clearGroups, randomColor } from './groups.js';

let nodes = getNodes();
let connections = getConnections();
let groups = getGroups();
let selectedNodeId = null;
let selectedGroupId = null;

function render() {
    clearNodes();
    clearGroups();
    nodes.forEach((node, idx) => createNodeDOM(node, node.id === selectedNodeId, idx === 0));
    groups.forEach(g => createGroupDOM(g, g.id === selectedGroupId));
    setTimeout(() => drawConnections(nodes, groups), 0);
}

// --- Add Node Button Logic ---
const addNodeFab = document.getElementById('add-node-fab');
const inputForm = document.getElementById('input-form');
addNodeFab.addEventListener('click', function(e) {
    e.stopPropagation();
    inputForm.classList.remove('hidden');
    groupForm.classList.add('hidden');
    document.getElementById('name-input').focus();
});

// --- Add Group Button Logic ---
const groupBtn = document.getElementById('add-group-btn');
const groupForm = document.getElementById('group-form');
groupBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    groupForm.classList.remove('hidden');
    inputForm.classList.add('hidden');
    document.getElementById('group-name-input').focus();
});

// --- Hide forms on click outside or ESC ---
document.addEventListener('mousedown', (e) => {
    if (!inputForm.classList.contains('hidden') && !inputForm.contains(e.target) && !addNodeFab.contains(e.target)) {
        inputForm.classList.add('hidden');
    }
    if (!groupForm.classList.contains('hidden') && !groupForm.contains(e.target) && !groupBtn.contains(e.target)) {
        groupForm.classList.add('hidden');
    }
});
document.addEventListener('touchstart', (e) => {
    if (!inputForm.classList.contains('hidden') && !inputForm.contains(e.target) && !addNodeFab.contains(e.target)) {
        inputForm.classList.add('hidden');
    }
    if (!groupForm.classList.contains('hidden') && !groupForm.contains(e.target) && !groupBtn.contains(e.target)) {
        groupForm.classList.add('hidden');
    }
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        inputForm.classList.add('hidden');
        groupForm.classList.add('hidden');
    }
});

// --- Add node form handling ---
document.getElementById('add-node-btn').onclick = function() {
    const name = document.getElementById('name-input').value.trim();
    const jobTitle = document.getElementById('job-title-input').value.trim();
    const fileInput = document.getElementById('image-upload');
    if (!name || !jobTitle) {
        alert('Please fill in all fields.');
        return;
    }
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            addNode(name, jobTitle, e.target.result);
            inputForm.classList.add('hidden');
            fileInput.value = '';
            document.getElementById('name-input').value = '';
            document.getElementById('job-title-input').value = '';
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        addNode(name, jobTitle, null);
        inputForm.classList.add('hidden');
        document.getElementById('name-input').value = '';
        document.getElementById('job-title-input').value = '';
    }
};

// --- Add group form handling ---
document.getElementById('create-group-btn').onclick = function() {
    const groupName = document.getElementById('group-name-input').value.trim();
    if (!groupName) {
        alert('Please enter a group name.');
        return;
    }
    addGroup(groupName);
    groupForm.classList.add('hidden');
    document.getElementById('group-name-input').value = '';
};

function addNode(name, jobTitle, image) {
    const id = 'n' + Date.now() + Math.floor(Math.random()*100000);
    let top, left;
    if (nodes.length === 0) {
        top = `${window.innerHeight/2 - 60}px`;
        left = `${window.innerWidth/2 - 60}px`;
    } else {
        top = `${Math.random() * (window.innerHeight-110) + 50}px`;
        left = `${Math.random() * (window.innerWidth-110) + 10}px`;
    }
    const node = { id, name, jobTitle, image, top, left, floating: true };
    nodes.push(node);
    setNodes(nodes);
    render();
}
function addGroup(name) {
    const id = 'g' + Date.now() + Math.floor(Math.random()*100000);
    const top = `${Math.random() * (window.innerHeight-60) + 30}px`;
    const left = `${Math.random() * (window.innerWidth-60) + 10}px`;
    const color = randomColor();
    const group = { id, name, color, top, left };
    groups.push(group);
    setGroups(groups);
    render();
}

// --- Node/Group selection and connection logic ---
document.getElementById('nodes-container').addEventListener('click', function(e) {
    const groupEl = e.target.closest('.group');
    const nodeEl = e.target.closest('.node');
    if (selectedGroupId && nodeEl) {
        // Connect node to group
        const nodeId = nodeEl.dataset.nodeId;
        if (!connections.find(c =>
            c.type === "group" && c.group === selectedGroupId && c.node === nodeId)) {
            const group = groups.find(g => g.id === selectedGroupId);
            connections.push({ type: "group", group: selectedGroupId, node: nodeId, color: group.color });
            setConnections(connections);
            render();
        }
        return;
    }
    if (groupEl) {
        selectedGroupId = groupEl.dataset.groupId;
        selectedNodeId = null;
        render();
        return;
    }
    if (nodeEl) {
        const nodeId = nodeEl.dataset.nodeId;
        if (selectedNodeId === null) {
            selectedNodeId = nodeId;
            selectedGroupId = null;
            render();
        } else if (selectedNodeId === nodeId) {
            selectedNodeId = null;
            render();
        } else {
            // Connect nodes
            if (!connections.find(c =>
                c.type === "node" && ((c.from === selectedNodeId && c.to === nodeId) || (c.from === nodeId && c.to === selectedNodeId)))) {
                connections.push({ type: "node", from: selectedNodeId, to: nodeId });
                setConnections(connections);
                // Stop floating and move both nodes a bit closer
                nodes = nodes.map(n => {
                    if (n.id === nodeId || n.id === selectedNodeId) {
                        n.floating = false;
                        const other = nodes.find(nn => nn.id === (n.id === nodeId ? selectedNodeId : nodeId));
                        if (other) {
                            let t1 = parseFloat(n.top), l1 = parseFloat(n.left);
                            let t2 = parseFloat(other.top), l2 = parseFloat(other.left);
                            const newTop = t1 + 0.35 * (t2 - t1);
                            const newLeft = l1 + 0.35 * (l2 - l1);
                            n.top = `${newTop}px`;
                            n.left = `${newLeft}px`;
                        }
                    }
                    return n;
                });
                setNodes(nodes);
                selectedNodeId = null;
                render();
            }
        }
    }
});

// Node floating animation for unconnected nodes
function floatNodes() {
    nodes.forEach((n, idx) => {
        if (n.floating && idx !== 0) {
            let t = parseFloat(n.top), l = parseFloat(n.left);
            t += Math.sin(Date.now()/250 + l)*0.7;
            l += Math.cos(Date.now()/350 + t)*0.7;
            n.top = `${t}px`; n.left = `${l}px`;
            const dom = document.querySelector(`.node[data-node-id="${n.id}"]`);
            if(dom) { dom.style.top = n.top; dom.style.left = n.left; }
        }
    });
    setTimeout(floatNodes, 40);
}
floatNodes();

window.onload = render;