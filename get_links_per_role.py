from bs4 import BeautifulSoup
import requests

BASE_URL = 'https://acceptatiebredeschoolzuidoost.herokuapp.com/'

def get_all_links_for_role(role):
    start_url = f"{BASE_URL}/{role}/"
    visited = set()
    to_visit = [start_url]

    while to_visit:
        url = to_visit.pop()
        if url in visited:
            continue
        visited.add(url)

        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')

        # Find all links within this page that starts with the role's directory.
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            if href.startswith(f"/{role}/"):
                absolute_url = BASE_URL + href
                to_visit.append(absolute_url)

    return visited

roles = ['parent', 'schoolmanager', 'teacher', 'company', 'ppozo']
all_pages = {role: get_all_links_for_role(role) for role in roles}
