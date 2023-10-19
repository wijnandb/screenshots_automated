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
    contentDiv.innerHTML = `
        <h2>Roles Overview</h2>
        <table>
            <thead>
                <tr>
                    <th>Role Name</th>
                    <th>Number of Pages</th>
                    <th>Last Updated</th>
                </tr>
            </thead>
            <tbody id="roleTableBody">
            </tbody>
        </table>
    `;
    const tableBody = document.getElementById("roleTableBody");
    data.roles.forEach(roleData => {
        const roleRow = document.createElement('tr');
        roleRow.innerHTML = `
            <td><a href="#/${roleData.roleName}">${roleData.roleName}</a></td>
            <td>${roleData.pages.length}</td>
            <td>${roleData.timestamp}</td>
        `;
        tableBody.appendChild(roleRow);
    });
}

function showRolePages(data, role) {
    const roleData = data.roles.find(r => r.roleName === role);
    contentDiv.innerHTML = `
        <h2>Pages for ${role}</h2>
        <table>
            <thead>
                <tr>
                    <th>URL</th>
                    <th>Status Code</th>
                    <th>Thumbnail</th>
                </tr>
            </thead>
            <tbody id="pageTableBody">
            </tbody>
        </table>
    `;
    const tableBody = document.getElementById("pageTableBody");
    roleData.pages.forEach(page => {
        const pageRow = document.createElement('tr');
        pageRow.innerHTML = `
            <td><a href="#/${role}/${page.id}">${page.url}</a></td>
            <td>${page.statusCode}</td>
            <td><img class="thumbnail" src="${page.thumbnail}" alt="Thumbnail for ${page.url}"></td>
        `;
        tableBody.appendChild(pageRow);
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

