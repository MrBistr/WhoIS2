document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('name-input');
    const jobTitleInput = document.getElementById('job-title-input');
    const imageUpload = document.getElementById('image-upload');
    const addNodeBtn = document.getElementById('add-node-btn');
    const nodesContainer = document.getElementById('nodes-container');
    const nodes = [];
    const groups = {};
    let selectedNode = null;

    // Add a new node on button click
    addNodeBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const jobTitle = jobTitleInput.value.trim();
        const file = imageUpload.files[0];

        if (!name || !jobTitle) {
            alert('Please fill in both name and job title!');
            return;
        }

        const node = document.createElement('div');
        node.classList.add('node');
        node.style.top = `${Math.random() * 90}vh`;
        node.style.left = `${Math.random() * 90}vw`;

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                node.appendChild(img);
            };
            reader.readAsDataURL(file);
        }

        const textContainer = document.createElement('div');
        textContainer.classList.add('text-container');
        textContainer.innerHTML = `<strong>${name}</strong><br>${jobTitle}`;

        node.appendChild(textContainer);
        nodesContainer.appendChild(node);
        nodes.push(node);

        // Reset inputs
        nameInput.value = '';
        jobTitleInput.value = '';
        imageUpload.value = '';

        // Add interactivity: drag-and-drop, click-to-connect, and grouping
        addInteractivity(node);
    });

    function addInteractivity(node) {
        node.draggable = true;

        // Drag and Drop Connections
        node.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('nodeId', nodes.indexOf(node));
        });

        node.addEventListener('drop', (e) => {
            e.preventDefault();
            const fromId = e.dataTransfer.getData('nodeId');
            const fromNode = nodes[fromId];
            const line = new LeaderLine(fromNode, node, { color: 'white', size: 2 });
        });

        node.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        // Double Click to Edit Node
        node.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            if (selectedNode) return;

            selectedNode = node;
            const rect = node.getBoundingClientRect();

            const editWindow = document.createElement('div');
            editWindow.classList.add('edit-window');
            editWindow.style.top = `${rect.bottom + window.scrollY}px`;
            editWindow.style.left = `${rect.left + window.scrollX}px`;

            editWindow.innerHTML = `
                <input type="text" id="edit-name" value="${node.querySelector('.text-container strong').innerText}">
                <input type="text" id="edit-job" value="${node.querySelector('.text-container').innerHTML.split('<br>')[1]}">
                <button id="edit-ok-btn">OK</button>
            `;

            document.body.appendChild(editWindow);

            document.getElementById('edit-ok-btn').addEventListener('click', () => {
                const newName = document.getElementById('edit-name').value;
                const newJob = document.getElementById('edit-job').value;

                node.querySelector('.text-container').innerHTML = `<strong>${newName}</strong><br>${newJob}`;
                editWindow.remove();
                selectedNode = null;
            });
        });
    }
});