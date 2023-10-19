const contentDiv = document.getElementById("content");

// Assuming the JSON is hosted at the same domain under 'screenshots.json'
fetch('screenshots.json')
    .then(response => response.json())
    .then(data => {
        handleNavigation(data);
        window.addEventListener('popstate', () => handleNavigation(data));
    });

function handleNavigation(data) {
    const hash = window.location.hash;
    if (hash.startsWith("#/")) {
        const parts = hash.split("/");
        const role = parts[1];
        const id = parts[2];
        if (id) {
            showScreenshotDetails(data, role, id);
        } else {
            showRolePages(data, role);
        }
    } else {
        showHomepage(data);
    }
}

function showHomepage(data) {
    contentDiv.innerHTML = '';
    data.roles.forEach(roleData => {
        const roleDiv = document.createElement('div');
        roleDiv.innerHTML = `
            <h2><a href="#/${roleData.roleName}">${roleData.roleName}</a></h2>
            <p>Last Updated: ${roleData.timestamp}</p>
            <p>Number of Pages: ${roleData.pages.length}</p>
        `;
        contentDiv.appendChild(roleDiv);
    });
}

function showRolePages(data, role) {
    const roleData = data.roles.find(r => r.roleName === role);
    contentDiv.innerHTML = `<h2>${role}</h2>`;
    roleData.pages.forEach(page => {
        const pageDiv = document.createElement('div');
        pageDiv.innerHTML = `
            <h3><a href="#/${role}/${page.id}">${page.url}</a></h3>
            <p>Status Code: ${page.statusCode}</p>
            <img class="thumbnail" src="${page.thumbnail}" alt="Thumbnail for ${page.url}">
        `;
        contentDiv.appendChild(pageDiv);
    });
}

function showScreenshotDetails(data, role, id) {
    const roleData = data.roles.find(r => r.roleName === role);
    const page = roleData.pages.find(p => p.id === parseInt(id));
    contentDiv.innerHTML = `
        <h2>${role} - ${page.url}</h2>
        <p>Status Code: ${page.statusCode}</p>
        <p><img src="${page.screenshot}" alt="Screenshot for ${page.url}"></p>
    `;
}

