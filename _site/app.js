const contentDiv = document.getElementById("content");

// Assuming the JSON is hosted at the same domain under 'screenshots.json'
fetch('data/screenshots.json')
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
        <h2 class="text-2xl mb-6 font-semibold">Pagina's per rol</h2>
        <table class="w-full mt-5 border border-gray-300 divide-y divide-gray-200 rounded-lg overflow-hidden">
            <thead>
                <tr class="text-left bg-gray-200">
                    <th class="px-4 py-2">Rol</th>
                    <th class="px-4 py-2">Aantal pagina's</th>
                    <th class="px-4 py-2">Screenshot datum</th>
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
                    <th class="px-4 py-2">Pagina</th>
                    <th class="px-4 py-2">Status</th>
                    <th class="px-4 py-2">Screenshot</th>
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
            <td class="px-4 py-2"><a href="${page.url}" class="text-blue-500 hover:underline">${page.url}</a></td>
            <td class="px-4 py-2">${page.statusCode}</td>
            <td class="px-4 py-2"><a href="#/${role}/${page.id}" class="text-blue-500 hover:underline"><img class="thumbnail" src="${page.screenshots.iPhone}" alt="Thumbnail for ${page.url}"></a></td>
        `;
        tableBody.appendChild(pageRow);
    });
}


function showScreenshotDetails(data, role, id) {
    const roleData = data.roles.find(r => r.roleName === role);
    const page = roleData.pages.find(p => p.id === parseInt(id));
    const sizes = ['iPhone', 'MediumScreen', 'LargeScreen']; // Define the sizes you have

    // Function to create subnav buttons
    function createSubnav(size, currentPageSize) {
        return sizes.map(s => {
            const activeClass = s === currentPageSize ? 'text-black' : 'text-blue-500 hover:underline';
            const clickHandler = s === currentPageSize ? '' : `onclick="showScreenshotDetails(data, '${role}', '${id}', '${s}')"`;
            return `<a href="#" class="${activeClass}" ${clickHandler}>${s}</a>`;
        }).join(' / ');
    }

    // Define the initial size to show, default to 'MediumScreen'
    const initialSize = page.screenshots.hasOwnProperty('MediumScreen') ? 'MediumScreen' : sizes[0];

    // Update the HTML content
    contentDiv.innerHTML = `
        <nav class="mb-4 text-sm font-semibold">
            <a href="#" class="text-blue-500 hover:underline">Home</a> / 
            <a href="#/${role}" class="text-blue-500 hover:underline">${role}</a> / ${page.url}
        </nav>
        <div class="subnav text-center my-4">${createSubnav(initialSize)}</div>
        <h2 class="text-2xl mb-5 font-semibold">${role} - ${page.url} - ${page.statusCode}</h2>
        <p><a href="${page.screenshots.LargeScreen}"><img id="screenshotImage" src="${page.screenshots[initialSize]}" alt="Screenshot for ${page.url}"></a></p>
    `;

    // Add an event listener for subnav items if they are not the currently active size
    sizes.forEach(size => {
        if (size !== initialSize) {
            document.querySelector(`.subnav a[onclick*="${size}"]`).addEventListener('click', function() {
                document.getElementById('screenshotImage').src = page.screenshots[size];
                document.querySelector('.subnav').innerHTML = createSubnav(size);
            });
        }
    });
}

// Initial call
showScreenshotDetails(data, 'Manager', '123', 'MediumScreen');



