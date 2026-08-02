import time
from playwright.sync_api import sync_playwright

def run_cuj(page):
    print("Navigating to discover feed...")
    page.goto("http://localhost:3000/discover")
    page.wait_for_timeout(1500)

    # Take screenshot of discover feed
    page.screenshot(path="/home/jules/verification/screenshots/discover.png")
    print("Screenshot of discover feed saved.")

    print("Navigating to account page...")
    page.goto("http://localhost:3000/account")
    page.wait_for_timeout(2000)

    # Try to click on the Posts / Feed tab in the premium B2B profile segment
    # Let's see if there is an Instagram Feed or Posts tab
    print("Clicking Posts tab...")
    posts_tab = page.get_by_role("button", name="Instagram Feed")
    if posts_tab.count() > 0:
        posts_tab.click()
    else:
        # fallback to general tab button
        posts_tab_fallback = page.get_by_text("Posts")
        if posts_tab_fallback.count() > 0:
            posts_tab_fallback.first.click()

    page.wait_for_timeout(1500)

    # Take screenshot of the posts list
    page.screenshot(path="/home/jules/verification/screenshots/account_posts.png")
    print("Screenshot of account posts saved.")

    # Let's open the Create Post modal
    print("Clicking New Update Post button...")
    create_btn = page.get_by_role("button", name="New Update Post")
    if create_btn.count() > 0:
        create_btn.click()
        page.wait_for_timeout(1000)

        # Take a screenshot of the modal
        page.screenshot(path="/home/jules/verification/screenshots/create_modal.png")
        print("Screenshot of create post modal saved.")

        # Fill in post content
        print("Filling post content...")
        textarea = page.get_by_placeholder("What's new? Describe your new arrivals")
        if textarea.count() > 0:
            textarea.fill("Premium Date Syrup organic Tunisian dates wholesale export box bulk shipping. Acidity < 0.3%.")
            page.wait_for_timeout(1000)

            # Click save/publish button
            print("Clicking publish button...")
            publish_btn = page.get_by_role("button", name="Publish Update")
            if publish_btn.count() > 0:
                publish_btn.click()
                page.wait_for_timeout(2000)

                # Take screenshot after publishing
                page.screenshot(path="/home/jules/verification/screenshots/post_published.png")
                print("Screenshot after publishing saved.")

    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        except Exception as e:
            print(f"Error occurred during script execution: {e}")
        finally:
            context.close()
            browser.close()
            print("Browser closed.")
