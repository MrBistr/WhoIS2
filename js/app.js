import { getNodes, setNodes, createNodeDOM, clearNodes } from './nodes.js';
import { getConnections, setConnections, drawConnections } from './connections.js';
import { getGroups, setGroups, createGroupDOM, clearGroups, randomColor } from './groups.js';

let nodes = getNodes();
let connections = getConnections();
let groups = getGroups();
let selectedNodeId = null;
let selectedGroupId = null;
let editingNodeId = null;
let editingGroupId = null;

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
    showNodeForm();
});

// --- Add Group Button Logic ---
const groupBtn = document.getElementById('add-group-btn');
const groupForm = document.getElementById('group-form');
groupBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    showGroupForm();
});

// --- Hide forms on click outside or ESC ---
function hideFormsIfClickedOutside(e) {
    if (!inputForm.classList.contains('hidden') && !inputForm.contains(e.target) && !addNodeFab.contains(e.target)) {
        inputForm.classList.add('hidden');
    }
    if (!groupForm.classList.contains('hidden') && !groupForm.contains(e.target) && !groupBtn.contains(e.target)) {
        groupForm.classList.add('hidden');
    }
}
document.addEventListener('mousedown', hideFormsIfClickedOutside);
document.addEventListener('touchstart', hideFormsIfClickedOutside);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        inputForm.classList.add('hidden');
        groupForm.classList.add('hidden');
    }
});

// --- Show Node Form (for add/edit) ---
function showNodeForm(editNode = null) {
    inputForm.classList.remove('hidden');
    groupForm.classList.add('hidden');
    editingNodeId = null;
    document.getElementById('form-title').textContent = editNode ? 'Edit Node' : 'Add a Node';
    document.getElementById('add-node-btn').textContent = editNode ? 'Update Node' : 'Add Node';
    if (editNode) {
        editingNodeId = editNode.id;
        document.getElementById('name-input').value = editNode.name;
        document.getElementById('job-title-input').value = editNode.jobTitle;
        document.getElementById('image-upload').value = "";
    } else {
        document.getElementById('name-input').value = "";
        document.getElementById('job-title-input').value = "";
        document.getElementById('image-upload').value = "";
    }
    document.getElementById('name-input').focus();
}

// --- Show Group Form (for add/edit) ---
function showGroupForm(editGroup = null) {
    groupForm.classList.remove('hidden');
    inputForm.classList.add('hidden');
    editingGroupId = null;
    document.getElementById('group-form-title').textContent = editGroup ? 'Edit Group' : 'Add a Group';
    document.getElementById('create-group-btn').textContent = editGroup ? 'Update Group' : 'Create Group';
    if (editGroup) {
        editingGroupId = editGroup.id;
        document.getElementById('group-name-input').value = editGroup.name;
    } else {
        document.getElementById('group-name-input').value = "";
    }
    document.getElementById('group-name-input').focus();
}

// --- Add/Edit node form handling ---
document.getElementById('add-node-btn').onclick = function() {
    const name = document.getElementById('name-input').value.trim();
    const jobTitle = document.getElementById('job-title-input').value.trim();
    const fileInput = document.getElementById('image-upload');

    if (!name || !jobTitle) {
        alert('Please fill in all fields.');
        return;
    }

    const saveNode = (image) => {
        if (editingNodeId) {
            nodes = nodes.map(n =>
                n.id === editingNodeId ? { ...n, name, jobTitle, image: image || n.image } : n
            );
            setNodes(nodes);
        } else {
            addNode(name, jobTitle, image);
        }
        inputForm.classList.add('hidden');
        editingNodeId = null;
        render();
    };

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            saveNode(e.target.result);
            fileInput.value = '';
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveNode();
    }
};

// --- Add/Edit group form handling ---
document.getElementById('create-group-btn').onclick = function() {
    const groupName = document.getElementById('group-name-input').value.trim();
    if (!groupName) {
        alert('Please enter a group name.');
        return;
    }
    if (editingGroupId) {
        groups = groups.map(g =>
            g.id === editingGroupId ? { ...g, name: groupName } : g
        );
        setGroups(groups);
        groupForm.classList.add('hidden');
        editingGroupId = null;
        render();
    } else {
        addGroup(groupName);
        groupForm.classList.add('hidden');
    }
};

// --- Add node ---
function addNode(name, jobTitle, image) {
    const id = 'n' + Date.now() + Math.floor(Math.random()*100000);
    let top, left;
    if (nodes.length === 0) {
        top = `${window.innerHeight/2 - 65}px`;
        left = `${window.innerWidth/2 - 65}px`;
    } else {
        top = `${Math.random() * (window.innerHeight-110) + 50}px`;
        left = `${Math.random() * (window.innerWidth-110) + 10}px`;
    }
    const node = { id, name, jobTitle, image, top, left, floating: true };
    nodes.push(node);
    setNodes(nodes);
    render();
}

// --- Add group ---
function addGroup(name) {
    const id = 'g' + Date.now() + Math.floor(Math.random()*100000);
    const top = `${Math.random() * (window.innerHeight-80) + 30}px`;
    const left = `${Math.random() * (window.innerWidth-80) + 10}px`;
    const color = randomColor();
    const group = { id, name, color, top, left };
    groups.push(group);
    setGroups(groups);

    // Always connect group to USER (main node) with a white line
    if (nodes.length > 0) {
        const userId = nodes[0].id;
        connections.push({ type: "group2user", group: id, user: userId, color: "white" });
        setConnections(connections);
    }
    render();
}

// --- Node/Group selection, highlight, double click to edit, connection logic ---
let lastClickTime = 0;
let lastClickedElement = null;
document.getElementById('nodes-container').addEventListener('click', function(e) {
    const nodeEl = e.target.closest('.node');
    const groupEl = e.target.closest('.group-node');
    const now = Date.now();

    // Double-click to edit
    if (nodeEl && lastClickedElement === nodeEl && now - lastClickTime < 400) {
        const nodeId = nodeEl.dataset.nodeId;
        const node = nodes.find(n => n.id === nodeId);
        showNodeForm(node);
        lastClickTime = 0;
        lastClickedElement = null;
        return;
    }
    if (groupEl && lastClickedElement === groupEl && now - lastClickTime < 400) {
        const groupId = groupEl.dataset.groupId;
        const group = groups.find(g => g.id === groupId);
        showGroupForm(group);
        lastClickTime = 0;
        lastClickedElement = null;
        return;
    }
    lastClickTime = now;
    lastClickedElement = nodeEl || groupEl;

    // Highlight logic
    if (nodeEl) {
        const nodeId = nodeEl.dataset.nodeId;
        if (selectedNodeId === nodeId) {
            selectedNodeId = null;
        } else {
            selectedNodeId = nodeId;
            selectedGroupId = null;
        }
        render();
        return;
    }
    if (groupEl) {
        const groupId = groupEl.dataset.groupId;
        if (selectedGroupId === groupId) {
            selectedGroupId = null;
        } else {
            selectedGroupId = groupId;
            selectedNodeId = null;
        }
        render();
        return;
    }
}, true);

// --- Connection logic: click NODE then GROUP to connect, or NODE then NODE
document.getElementById('nodes-container').addEventListener('click', function(e) {
    const nodeEl = e.target.closest('.node');
    const groupEl = e.target.closest('.group-node');
    // If both node and group are selected, connect node to group
    if (selectedNodeId && groupEl) {
        const groupId = groupEl.dataset.groupId;
        if (!connections.find(c => c.type === "group" && c.group === groupId && c.node === selectedNodeId)) {
            const group = groups.find(g => g.id === groupId);
            connections.push({ type: "group", group: groupId, node: selectedNodeId, color: group.color });
            setConnections(connections);

            // Move node closer to group
            nodes = nodes.map(n => {
                if (n.id === selectedNodeId) {
                    n.floating = false;
                    let t1 = parseFloat(n.top), l1 = parseFloat(n.left);
                    let t2 = parseFloat(group.top), l2 = parseFloat(group.left);
                    const newTop = t1 + 0.35 * (t2 - t1);
                    const newLeft = l1 + 0.35 * (l2 - l1);
                    n.top = `${newTop}px`;
                    n.left = `${newLeft}px`;
                }
                return n;
            });
            setNodes(nodes);

            selectedNodeId = null;
            render();
        }
        return;
    }
    // If both are nodes, connect node to node
    if (selectedNodeId && nodeEl) {
        const nodeId = nodeEl.dataset.nodeId;
        if (selectedNodeId !== nodeId) {
            if (!connections.find(c =>
                c.type === "node" && ((c.from === selectedNodeId && c.to === nodeId) || (c.from === nodeId && c.to === selectedNodeId)))) {
                connections.push({ type: "node", from: selectedNodeId, to: nodeId });
                setConnections(connections);
                // Move both nodes closer together
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
        return;
    }
}, true);

// --- Floating animation for unconnected nodes (not first node) and groups ---
function floatNodes() {
    if (nodes.length === 0) return;
    nodes.forEach((n, idx) => {
        if ((n.floating && idx !== 0)) {
            let t = parseFloat(n.top), l = parseFloat(n.left);
            t += Math.sin(Date.now()/250 + l)*0.7;
            l += Math.cos(Date.now()/350 + t)*0.7;
            n.top = `${t}px`; n.left = `${l}px`;
            const dom = document.querySelector(`.node[data-node-id="${n.id}"]`);
            if(dom) { dom.style.top = n.top; dom.style.left = n.left; }
        }
        // Main node always stays at center
        if (idx === 0) {
            n.top = `${window.innerHeight/2 - 65}px`;
            n.left = `${window.innerWidth/2 - 65}px`;
            const dom = document.querySelector(`.node[data-node-id="${n.id}"]`);
            if(dom) { dom.style.top = n.top; dom.style.left = n.left; }
        }
    });
    setTimeout(floatNodes, 40);
}
floatNodes();

window.onload = render;