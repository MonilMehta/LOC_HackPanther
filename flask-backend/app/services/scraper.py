import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import time

def scrape_most_wanted():
    url = "https://nia.gov.in/most-wanted.htm"
    response = requests.get(url)
    response.raise_for_status()  # Raise error if the request fails

    soup = BeautifulSoup(response.content, "html.parser")
    criminals = []

    # Extracting all elements matching the pattern in the HTML
    outer_divs = soup.select('div.inner')  # Matches all criminal details
    for div in outer_divs:
        name = div.find("div", class_="name").text.strip()
        image_tag = div.find("img")
        image_url = image_tag["src"] if image_tag else None
        if image_url and not image_url.startswith("http"):
            image_url = f"https://nia.gov.in/{image_url}"  # Make it a full URL
        criminals.append({"name": name, "image_url": image_url})
    return criminals

def scrape_most_wanted_sel():
    # Set up Selenium WebDriver
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode for automation
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    service = Service("D:\\chromedriver-win64\\chromedriver-win64\\chromedriver.exe")  # Update with your chromedriver path
    driver = webdriver.Chrome(service=service, options=chrome_options)

    url = "https://nia.gov.in/most-wanted.htm"
    driver.get(url)

    # Wait for the page to load
    time.sleep(3)

    # Initialize results
    criminals = []

    # Locate all outer divs
    outer_divs = driver.find_elements(By.XPATH, '/html/body/form/div[3]/div/div[1]/div[3]/div[2]/div[3]/div[1]/div/div/div/div[1]/ul/li/div')
    print(f"Found {len(outer_divs)} outer divs")
    for i, outer_div in enumerate(outer_divs[:30]):  # Limit to top 30
        try:
            # Click on the outer div
            ActionChains(driver).move_to_element(outer_div).click(outer_div).perform()
            time.sleep(1)  # Wait for the popup to load

            # Scrape the popup details
            soup = BeautifulSoup(driver.page_source, "html.parser")
            name = soup.find("span", id="ContentPlaceHolder1_WantedList1_lblName").text.strip()
            aliases = soup.find("span", id="ContentPlaceHolder1_WantedList1_lblAliases").text.strip()
            address = soup.find("span", id="ContentPlaceHolder1_WantedList1_lblAddress").text.strip()
            organization = soup.find("span", id="ContentPlaceHolder1_WantedList1_lblOrganization").text.strip()
            image_tag = soup.find("img", {"title": f"Wanted Photo {name}"})
            image_url = image_tag["src"] if image_tag else None
            if image_url and not image_url.startswith("http"):
                image_url = f"https://nia.gov.in/{image_url}"

            # Add details to the list
            criminals.append({
                "name": name,
                "aliases": aliases,
                "address": address,
                "organization": organization,
                "image_url": image_url
            })

            # Move to the next div
            ActionChains(driver).move_to_element(outer_div).click(outer_div).perform()
            time.sleep(0.5)

        except Exception as e:
            print(f"Error processing criminal {i}: {e}")
            continue

    # Quit the driver
    driver.quit()

    return criminals