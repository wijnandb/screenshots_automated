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
        <h2 class="text-2xl mb-6 font-semibold">Roles Overview</h2>
        <table class="w-full mt-5 border border-gray-300 divide-y divide-gray-200 rounded-lg overflow-hidden">
            <thead>
                <tr class="text-left bg-gray-200">
                    <th class="px-4 py-2">Role Name</th>
                    <th class="px-4 py-2">Number of Pages</th>
                    <th class="px-4 py-2">Last Updated</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    `;

    const tableBody = contentDiv.querySelector("tbody");
    data.roles.forEach(roleData => {
        const roleRow = document.createElement('tr');
        roleRow.innerHTML = `
            <td class="px-4 py-2"><a href="#/${roleData.roleName}" class="text-blue-500 hover:underline">${roleData.roleName}</a></td>
            <td class="px-4 py-2">${roleData.pages.length}</td>
            <td class="px-4 py-2">${roleData.timestamp}</td>
        `;
        tableBody.appendChild(roleRow);
    });
}


function showRolePages(data, role) {
    contentDiv.innerHTML = `
        <nav class="mb-4 text-sm font-semibold">
            <a href="#" class="text-blue-500 hover:underline">Home</a> / ${role}
        </nav>
        <h2 class="text-2xl mb-6 font-semibold">Pages for ${role}</h2>
        <table class="w-full mt-5 border border-gray-300 divide-y divide-gray-200 rounded-lg overflow-hidden">
            <thead>
                <tr class="text-left bg-gray-200">
                    <th class="px-4 py-2">URL</th>
                    <th class="px-4 py-2">Status Code</th>
                    <th class="px-4 py-2">Thumbnail</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    `;

    const tableBody = contentDiv.querySelector("tbody");
    const roleData = data.roles.find(r => r.roleName === role);
    roleData.pages.forEach(page => {
        const pageRow = document.createElement('tr');
        pageRow.innerHTML = `
            <td class="px-4 py-2"><a href="#/${role}/${page.id}" class="text-blue-500 hover:underline">${page.url}</a></td>
            <td class="px-4 py-2">${page.statusCode}</td>
            <td class="px-4 py-2"><img class="thumbnail" src="${page.thumbnail}" alt="Thumbnail for ${page.url}"></td>
        `;
        tableBody.appendChild(pageRow);
    });
}


function showScreenshotDetails(data, role, id) {
    const roleData = data.roles.find(r => r.roleName === role);
    const page = roleData.pages.find(p => p.id === parseInt(id));
    contentDiv.innerHTML = `
        <nav class="mb-4 text-sm font-semibold">
            <a href="#" class="text-blue-500 hover:underline">Home</a> / 
            <a href="#/${role}" class="text-blue-500 hover:underline">${role}</a> / ${page.url}
        </nav>
        <h2 class="text-2xl mb-5 font-semibold">${role} - ${page.url}</h2>
        <p>Status Code: ${page.statusCode}</p>
        <p><img src="${page.screenshot}" alt="Screenshot for ${page.url}"></p>
    `;
}


