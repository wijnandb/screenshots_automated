from selenium import webdriver
from datetime import datetime
import os, requests, json, hashlib, time
from bs4 import BeautifulSoup

password = os.environ.get("MY_APP_PASSWORD")


def initialize_driver(session):
    """I could add the role as an argument and use it to determine the URL to visit.
    That way I could use this function to initialize a driver for each role.
    """
    # Initialize Selenium WebDriver
    driver = webdriver.Chrome()

    # Visit a URL to establish a WebDriver session
    driver.get("https://acceptatiebredeschoolzuidoost.herokuapp.com/")

    # Transfer the cookies from the requests session to the WebDriver
    for cookie in session.cookies:
        cookie_dict = {
            "name": cookie.name,
            "value": cookie.value,
            "path": cookie.path,
            "secure": cookie.secure,
            "expires": cookie.expires,
        }
        driver.add_cookie(cookie_dict)

    return driver


def capture_webpage_info(driver, session, url, role, output_dir):
    # Create output directory if it doesn't exist
    role_dir = os.path.join(output_dir, role)
    if not os.path.exists(role_dir):
        os.makedirs(role_dir)

    # Define the different screen sizes
    screen_sizes = {
        "iPhone": (375, 812),
        "MediumScreen": (1024, 768),
        "LargeScreen": (3840, 2160)
    }

    screenshots_info = {}

    # Loop through the defined screen sizes and take a screenshot for each
    for screen_name, (width, height) in screen_sizes.items():
        # Resize the browser window
        driver.set_window_size(width, height)

        # Visit the webpage to establish a WebDriver session
        driver.get(url)

        # Define the screenshot path
        screenshot_filename = f"screenshot_{screen_name}_{hashlib.md5(url.encode()).hexdigest()}.png"
        screenshot_path = os.path.join(role_dir, screenshot_filename)

        # Take the screenshot
        driver.save_screenshot(screenshot_path)

        # Store the screenshot info in a dictionary
        screenshots_info[screen_name] = screenshot_path

    # Get the status code
    response = session.get(url)
    status_code = response.status_code

    # Get the current timestamp
    timestamp = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")

        # Return the collected data including screenshots info
    return {
        "id": int(hashlib.md5(url.encode()).hexdigest(), 16) % (10**8),  # Create an ID from the URL hash
        "url": url,
        "statusCode": status_code,
        "screenshots": screenshots_info,
        "timestamp": timestamp,
    }


# from selenium import webdriver
# from selenium.webdriver.chrome.options import Options

# def capture_webpage_info(driver, session, url, role, output_dir, mobile=False):
#     # Create output directory if it doesn't exist
#     role_dir = os.path.join(output_dir, role)
#     if not os.path.exists(role_dir):
#         os.makedirs(role_dir)
    
#     if mobile:
#         # Set mobile emulation on Chrome
#         mobile_emulation = {
#             "deviceMetrics": {"width": 360, "height": 640, "pixelRatio": 3.0},
#             "userAgent": "Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Mobile Safari/537.36"
#         }
#         chrome_options = Options()
#         chrome_options.add_experimental_option("mobileEmulation", mobile_emulation)
#         driver = webdriver.Chrome(options=chrome_options)
#     else:
#         # Set a larger desktop resolution
#         driver.set_window_size(3000, 2000)
    
#     # Visit the webpage to establish a WebDriver session
#     driver.get(url)

#     # Capture the screenshot
#     screenshot_filename = f"screenshot_{hashlib.md5(url.encode()).hexdigest()}.png"
#     screenshot_path = os.path.join(role_dir, screenshot_filename)
#     driver.save_screenshot(screenshot_path)
    
#     # Get the status code
#     response = session.get(url)
#     status_code = response.status_code

#     # Get the current timestamp
#     timestamp = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")

#     # Return the collected data
#     return {
#         "id": int(hashlib.md5(url.encode()).hexdigest(), 16) % (10**8),  # Create an ID from the URL hash
#         "url": url,
#         "statusCode": status_code,
#         "screenshot": screenshot_path,
#         "timestamp": timestamp,
#     }


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


    login_data = {
        "login": role,
        "password": password,
        "csrfmiddlewaretoken": csrf_token,
    }

    # Step 3: Send POST Request to Login
    headers = {"User-Agent": "Mozilla/5.0", "Referer": login_url}
    response = session.post(login_url, data=login_data, headers=headers)
    if response.status_code != 200:
        print(f"Failed to log in: {response.status_code}")
        print(response.text)
        return
    time.sleep(2)
    print(f"Url: {response.url} accessed with user {role}")
    return session  # Return the session object at the end of the login function


def process_pages(input_file, output_dir):
    # Read the input file and parse the JSON content
    with open(input_file, "r") as file:
        pages_per_role = json.load(file)

    # Initialize an empty dictionary to hold the collected data
    roles_data = {}

    # Iterate through each role and its associated URLs
    for role, urls in pages_per_role.items():
        print(f"Processing role: {role}")
        role_data = []  # List to hold the collected data for this role
        # login here with role?
        # Create a requests session by logging in
        session = login(role)
        driver = initialize_driver(session)

        for url in urls:
            print(f"  Processing URL: {url}")
            page_info = capture_webpage_info(driver, session, url, role, output_dir)
            role_data.append(page_info)

        roles_data[role] = role_data
        driver.quit()

    return roles_data


def generate_json(roles_data):
    return {
        "roles": [
            {
                "roleName": role,
                "timestamp": max(page["timestamp"] for page in pages),
                "pages": pages,
            }
            for role, pages in roles_data.items()
        ]
    }



# Specify the input file and output directory
input_file = "././data/all_pages.json"
output_dir = "././data/screenshots"

roles_data = process_pages(input_file, output_dir)

# Generate the JSON structure from the collected data
json_data = generate_json(roles_data)

# Write the JSON data to an output file
with open("././data/screenshots.json", "w") as file:
    json.dump(json_data, file, indent=2)
