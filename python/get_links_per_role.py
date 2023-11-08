from bs4 import BeautifulSoup
import requests, json, re, os
from urllib.parse import urlparse, urljoin

BASE_URL = "https://acceptatiebredeschoolzuidoost.herokuapp.com"


def login(role):
    session = requests.Session()

    # Step 1: Obtain CSRF Token
    login_url = "https://acceptatiebredeschoolzuidoost.herokuapp.com/accounts/login/"
    response = session.get(login_url)
    if response.status_code != 200:
        print(f"Failed to retrieve login page: {response.status_code}")
        return
    soup = BeautifulSoup(response.content, "html.parser")
    csrf_token = soup.find("input", {"name": "csrfmiddlewaretoken"})["value"]
    if not csrf_token:
        print("Failed to retrieve CSRF token")
        return
    print(f"CSRF Token: {csrf_token}")

    # Step 2: Prepare Login Data
    login_data = {
        "login": role,
        "password": os.environ.get("MY_APP_PASSWORD"),
        "csrfmiddlewaretoken": csrf_token,
    }

    # Step 3: Send POST Request to Login
    headers = {"User-Agent": "Mozilla/5.0", "Referer": login_url}
    print(login_data)
    response = session.post(login_url, data=login_data, headers=headers)
    print(response)
    if response.status_code != 200:
        print(f"Failed to log in: {response.status_code}")
        print(response.text)
        return

    # print(f'Login successful')
    print(f"Logged in as {role}, retrieved {response.url }")
    return session  # Return the session object at the end of the login function


def url_signature(url):
    """Generate a signature for a URL by replacing numeric segments with '0'.
    This way I won't visit each page multiple times with different IDs."""
    path = urlparse(url).path
    signature = re.sub(r"/\d+/", "/0/", path)
    return signature


def get_all_links_for_role(session, role):
    section = role.split("@")[0]
    start_url = f"{BASE_URL}/"
    visited_signatures = set()
    to_visit = [start_url]
    signature_to_url = {}  # Dictionary to store a working URL for each signature

    while to_visit:
        url = to_visit.pop()
        signature = url_signature(url)
        if signature in visited_signatures:
            print(f"Already visited signature: {signature}")
            continue  # Skip this URL if its signature has already been visited
        print(f"Visiting: {url}")
        visited_signatures.add(signature)  # Mark this signature as visited

        # Store the actual URL in the signature_to_url dictionary
        if signature not in signature_to_url:
            signature_to_url[signature] = url

        response = session.get(url)
        # print(url)
        if response.status_code != 200:
            print(f"Failed to retrieve page: {url}")
            continue  # Skip this URL if the request failed

        soup = BeautifulSoup(response.content, "html.parser")

        # Find all links within this page
        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"]
            # Use urljoin to construct absolute URLs
            absolute_url = urljoin(BASE_URL, href)
            # Only follow links that start with the role's directory and haven't been visited yet
            if absolute_url.startswith(
                f"{BASE_URL}"
            ):  # /{role}/") or (role == 'parent' and absolute_url.startswith(f"{BASE_URL}/student/")):
                #     # print(f"Found link: {absolute_url}")
                to_visit.append(absolute_url)

    return list(signature_to_url.values())  # Return the list of working URLs


roles = [
    "parent@perceptum.nl",
    "schoolmanager@perceptum.nl",
    "teacher@perceptum.nl",
    "company@perceptum.nl",
    "ppozo@perceptum.nl",
]



def main():
    all_pages = {}  # Initialize the dictionary outside of the loop

    for role in roles:
        print(f"Starting...logging in with {role}")
        session = login(role)  # Capture the session object from the login function
        print(session)
        if not session:
            print("Failed to log in")
            continue  # Continue to the next iteration if login failed

        # Get all links for the current role and store them in the all_pages dictionary
        all_pages[role] = get_all_links_for_role(session, role)

    # save to JSON file called 'all_pages.json' outside of the loop
    with open("././data/all_pages.json", "w") as f:
        json.dump(
            all_pages, f, indent=4, sort_keys=True
        )  # Format JSON output with 4-space indentation and sorted keys


if __name__ == "__main__":
    main()
