document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const nameInput = document.getElementById('name-input');
    const jobTitleInput = document.getElementById('job-title-input');
    const imageUpload = document.getElementById('image-upload');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const nodesContainer = document.getElementById('nodes-container');

    // Show modal when clicking anywhere on the screen
    document.body.addEventListener('click', (e) => {
        if (!modal.contains(e.target)) {
            modal.classList.remove('hidden');
        }
    });

    // Close modal on cancel or clicking outside the modal
    cancelBtn.addEventListener('click', () => closeModal());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Close modal function
    function closeModal() {
        modal.classList.add('hidden');
        nameInput.value = '';
        jobTitleInput.value = '';
        imageUpload.value = '';
    }

    // Confirm and create a node
    confirmBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const jobTitle = jobTitleInput.value.trim();
        const file = imageUpload.files[0];

        if (!name || !jobTitle) {
            alert('Please fill in both name and job title!');
            return;
        }

        const node = document.createElement('div');
        node.classList.add('node');
        node.style.top = `${Math.random() * 80}vh`;
        node.style.left = `${Math.random() * 80}vw`;

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

        closeModal();
    });
});